var db =  require('../db').db;
module.exports = function(namespaceObj, pageConfigObj, pageData, renderPageId, req, res, next){
	
	redirectToPageCalled=false;
				
	var dataPathObj = req.body['datapath'].split('/').filter( function( item, index, inputArray ) { return !!item.trim() });
		
	var panelIdSubmit;

	var submitDataFromPanel = {};
	
	var requirementChecks = {};
	requirementChecks.dob = [];
	var valuesToSave = [];
	var userIdentifiers = [];
	var householdIdentifiers = [];
			
	for(var k in dataPathObj){
	
		var requirePageId = dataPathObj[k].split('.')[0];
		
		var requirePagePanel = dataPathObj[k].split('.')[1];
		
		if(!requirePagePanel.trim() || !(requirePagePanel in pageConfigObj[requirePageId].data) || pageConfigObj[requirePageId]['hasFormElementArray'].indexOf(requirePagePanel) === -1){
			
			return next();	
		}

		submitDataFromPanel[requirePageId] = pageConfigObj[requirePageId].data[requirePagePanel]['save-data-from'] == 'entire-page' ? Object.keys(pageConfigObj[requirePageId].data) : [requirePagePanel];
		
		if(requirePageId == renderPageId && !panelIdSubmit){
		
			panelIdSubmit = requirePagePanel;
			
		}
		
		
		
	}
		
	/** REDIRECT HANDLER **/
	
	var redirectToPage = function(type, pageData, req, res, next, namespaceObj, passData){
		
		if(redirectToPageCalled)return;
		redirectToPageCalled = true;
			
		var routeExists = typeof pageData.routes != 'undefined' && typeof pageData.routes[type] == 'object' && pageData.routes[type]['pageItemId'];
		
		var aliasExists = routeExists ? typeof pageData.alias != 'undefined' && typeof pageData.alias[pageData.routes[type]['pageItemId']] == 'object' && pageData.alias[pageData.routes[type]['pageItemId']]['alias'] : false;
		
		
		if(!routeExists && !aliasExists && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(type)){
		
			var pageExists = true;
			var aliasExists = typeof pageData.alias != 'undefined' && typeof pageData.alias[type] == 'object' && pageData.alias[type]['alias'];
			
		}
		
		var rootDir = req.host == 'apps.dja.com' ? '/'+req._parsedUrl.pathname.replace(/^\//, '').split('/')[0]+'/' : '/';
		
		
		
		if(routeExists || aliasExists || pageExists){
						
			if(setAlreadyEnteredSession){
							
				if(typeof req.session[namespaceObj.pid] !== 'object'){
					var sessionStore = {};	
				}else var sessionStore = req.session[namespaceObj.pid];
				
				if(Object.prototype.toString.call(sessionStore['reg-form-already-entered']) != '[object Array]')sessionStore['reg-form-already-entered'] = [];
				
				for(var k in submitDataFromPanel){	
				
					var pageId = k;
				
					for(var p in submitDataFromPanel[k]){	
				
						var panelId = submitDataFromPanel[k][p];
						sessionStore['reg-form-already-entered'].push({pageId: pageId, panelId: panelId});
							
					}
				}
				
				
				req.session[namespaceObj.pid] = sessionStore;	
				
			}
			
			if(routeExists && aliasExists){
				
				var nextPage = rootDir+pageData.alias[pageData.routes[type]['pageItemId']]['alias'];
				
			}else if(routeExists){
			
				var nextPage = rootDir+pageData.routes[type]['pageItemId'];
				
			}else if(pageExists && aliasExists){
				
				var nextPage = rootDir+pageData.alias[type]['alias'];
				
			}else if(pageExists){
					
				var nextPage = rootDir+type;
				
			}
			
			if(!req.headerSent){
				if(req.xhr){
					
					if(typeof req.session[namespaceObj.pid] !== 'object'){
						var sessionStore = {};	
					}else var sessionStore = req.session[namespaceObj.pid];
										
					sessionStore['uid'] = res.userUids ? res.userUids : [];					
				
					req.session[namespaceObj.pid] = sessionStore;
						
					res.json(200, {next: nextPage, passData: passData ? true : '', uid: res.userUids ? res.userUids : []})
				}else res.redirect(nextPage);
			}
			return;
			
		}else{
		
		
			if(!req.headerSent){
				next();
			}
			return;
			
		}
		
	}
	
	/** END REDIRECT FUNCTION **/

	
	var validationSuccess = function(){
	
		/** VALIDATION SUCCESS AFTER THIS POINT **/
				
		var HBaseTypes =  require('../db').HBaseTypes;
	
		db.getRowWithColumns('promobuilder', 'promo:'+namespaceObj.pid, ['regform:'], {}, function(err,data) {
											
			if(err || !data){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
		
				
			}							
		
			if(data.length > 0){
				
				var eligibility = {};
				var entryPeriod = {};
				var entryLimit = {};
				
				for(var key in data[0].columns){
								
					if(/^regform:eligibility:/.test(key)){
											
						var column = key.replace('regform:eligibility:','').split(":");
																											
						if(typeof eligibility[column[0]] == 'undefined')eligibility[column[0]] = {};
						
						eligibility[column[0]][column[column.length-1]] = data[0].columns[key].value;
					}	
					
					if(/^regform:entryperiod:/.test(key)){
											
						var column = key.replace('regform:entryperiod:','').split(":");
																											
						if(typeof entryPeriod[column[0]] == 'undefined')entryPeriod[column[0]] = {};
						
						entryPeriod[column[0]][column[column.length-1]] = data[0].columns[key].value;
					}	
					
					if(/^regform:entrylimit:/.test(key)){
											
						var column = key.replace('regform:entrylimit:','').split(":");
																											
						if(typeof entryLimit[column[0]] == 'undefined')entryLimit[column[0]] = {};
						
						entryLimit[column[0]][column[column.length-1]] = data[0].columns[key].value;
					}	
					
							
				}	
			}else{
			
				res.send(404);
				return;	
				
			}
			
			/*** ENTRY PERIOD CHECK  **/
			
			if(typeof entryPeriod == 'object' && Object.keys(entryPeriod).length > 0){
				
				var time = require('time');
				var curDate = new time.Date().setTimezone('America/New_York');
				var entryPeriodUUID;
				var greaterCount = 0;
				var lesserCount = 0;
				var entryPeriodSorted = [];
				var curTimeIsBeforeLastEntryPeriod = false;
				var entryPeriodValidCount = 0;
							
				for(var uuid in entryPeriod){
					
					entryPeriod[uuid].uuid = uuid;
									
					entryPeriodSorted.push(entryPeriod[uuid]);
					
					if(!entryPeriod[uuid]['end'] || !entryPeriod[uuid]['start']){
				
						continue;	
					
					}else ++entryPeriodValidCount;
					
					if(!entryPeriodUUID){
						if(new time.Date(entryPeriod[uuid]['end'], 'America/New_York') > curDate && new time.Date(entryPeriod[uuid]['start'], 'America/New_York') <= curDate){
						
							entryPeriodUUID = uuid;
							
						}		
						if(curDate < new time.Date(entryPeriod[uuid]['end'], 'America/New_York')) curTimeIsBeforeLastEntryPeriod=true;
						if(curDate < new time.Date(entryPeriod[uuid]['start'], 'America/New_York')) lesserCount++;
						if(curDate >= new time.Date(entryPeriod[uuid]['end'], 'America/New_York')) greaterCount++;
					}
					
				}
				
				if(!entryPeriodUUID && entryPeriodValidCount > 0){
				
					if(lesserCount > greaterCount){
						
						//Coming Soon
						redirectToPage('before-first-entry-period', pageData, req, res, next, namespaceObj);
						
					}else if(greaterCount > lesserCount && !curTimeIsBeforeLastEntryPeriod){
						
						//Over
						redirectToPage('after-last-entry-period', pageData, req, res, next, namespaceObj);
						
					}else{
					
						//Interim
						redirectToPage('between-entry-period', pageData, req, res, next, namespaceObj);					
						
					}
					
				}
				
										
				entryPeriodSorted.sort(function(a, b) {
					return new Date(a.start) - new Date(b.end);
				});
				
				
			}else{
				
			
			}
			
			/*** ENTRY PERIOD CHECK COMPLETE **/
			
			/*** ELIGIBILITY CHECK **/
					
			if(typeof requirementChecks.dob == 'object' && typeof eligibility == 'object' && Object.keys(eligibility).length>0){
								
				var stateValue = [];
				var countryValue = [];
				
				for(var k in submitDataFromPanel){	
				
					var pageId = k;
				
					for(var p in submitDataFromPanel[k]){	
				
						var panelId = submitDataFromPanel[k][p];
							
						if(pageConfigObj[pageId].data[panelId]['check-eligibility-with-state']){
							
							var statesObj = pageConfigObj[pageId].data[panelId]['check-eligibility-with-state'].split(',');
							
							for(var x=0;x<statesObj.length;x++){
								if(typeof statesObj[x] != 'undefined' && statesObj[x] != null && statesObj[x].trim() && typeof req.body[statesObj[x]] != 'undefined' && req.body[statesObj[x]] != null && req.body[statesObj[x]].trim()){
									stateValue.push(req.body[statesObj[x]]);
								}
							}
						}
						if(pageConfigObj[pageId].data[panelId]['check-eligibility-with-country']){
									
							var countriesObj = pageConfigObj[pageId].data[panelId]['check-eligibility-with-country'].split(',');
							
							for(var x=0;x<countriesObj.length;x++){
								if(typeof countriesObj[x] != 'undefined' && countriesObj[x] != null && countriesObj[x].trim() && typeof req.body[countriesObj[x]] != 'undefined' && req.body[countriesObj[x]] != null && req.body[countriesObj[x]].trim()){
									countryValue.push(req.body[countriesObj[x]]);
								}
							}
						}
						
					}
				}
							
				var stateList = { 'US': 'AK,HI,CA,NV,OR,WA,DC,AZ,CO,ID,MT,NE,NM,ND,UT,WY,AL,AR,IL,IA,KS,KY,LA,MN,MS,MO,OK,SD,TX,TN,WI,CT,DE,FL,GA,IN,ME,MD,MA,MI,NH,NJ,NY,NC,OH,PA,RI,SC,VT,VA,WV', 'US+': 'AS,GU,MP,VI,PR', 'CA': 'ON,QC,NS,NB,MB,BC,PE,SK,AB,NL,NT,YT,NU'};
				
				var locationEligible = false;
				
				if(stateValue.length>0 || countryValue.length>0){

					for(var uuid in eligibility){
																	
						var stateEligible = true;
						var stateIsAmerica = true;
						
						if(stateValue.length>0){
						
							for(var x=0;x<stateValue.length;x++){
							
								if((eligibility[uuid]['country'] == 'US' || eligibility[uuid]['country'] == 'CA' || eligibility[uuid]['country'] == 'US+') && ((eligibility[uuid]['state'] != '*' && eligibility[uuid]['state'].indexOf(stateValue[x]) === -1) || (eligibility[uuid]['state'] == '*' && stateList[eligibility[uuid]['country']].indexOf(stateValue[x]) === -1))){
																	
									stateEligible = false;
									
								}
								
								if(typeof stateList[eligibility[uuid]['country']] == 'undefined' || stateList[eligibility[uuid]['country']].indexOf(stateValue[x]) === -1){
									
									stateIsAmerica = false;
									
								}
								
							}	
							
						}
						
						var countryEligible = true;
						
						if(countryValue.length>0){
						
							for(var x=0;x<countryValue.length;x++){
							
							
								if(
								
								((countryValue[x] == 'US' || countryValue[x] == 'CA' || countryValue[x] == 'US+') && eligibility[uuid]['country'] == countryValue[x]) 
								
								|| (eligibility[uuid]['country']  == 'INTL' && countryValue[x] != 'US' && countryValue[x] != 'CA' && eligibility[uuid]['state'].indexOf(countryValue[x]) === -1)
								
								){
									
									countryEligible = true;
									break;
								}else{
									countryEligible = false;
								}
								
							}	
							
						}
					
	
						if(
						
						//State if no Country
						
						(stateValue.length>0 && countryValue.length==0 && stateIsAmerica && stateEligible) || 
						
						//Country and State
						
						(stateValue.length>0 && countryValue.length>0 && countryEligible && stateEligible) ||
						
						//Country if no State
						
						(stateValue.length==0 && countryValue.length>0 && countryEligible)
						
						){
													
							locationEligible = true;
							
							for(var k in requirementChecks.dob){
							
								if(typeof requirementChecks.dob[k]['dobValue']['y'] != 'undefined'){
								
									var today = new Date(new Date().setHours(0, 0, 0, 0));
									var birthDate = new Date(new Date((requirementChecks.dob[k]['dobValue']['m'] ? requirementChecks.dob[k]['dobValue']['y'] : (requirementChecks.dob[k]['dobValue']['y']-1))+'-'+(requirementChecks.dob[k]['dobValue']['d'] && requirementChecks.dob[k]['dobValue']['m'] ? requirementChecks.dob[k]['dobValue']['m'] : requirementChecks.dob[k]['dobValue']['m'] ? (requirementChecks.dob[k]['dobValue']['m']+1) : '12')+'-'+(requirementChecks.dob[k]['dobValue']['d'] || '01')).setHours(0, 0, 0, 0));
																		
									var age = today.getFullYear() - birthDate.getFullYear();
									var m = today.getMonth() - birthDate.getMonth();
									if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
										age--;
									}
								}
								
								if(typeof requirementChecks.dob[k]['dobValue']['y'] != 'undefined' && (
		parseInt(eligibility[uuid]['ageMax'],10) < age || parseInt(eligibility[uuid]['ageMin'],10) > age)){
															
									//Not Eligible
									if(pageConfigObj[renderPageId].data[panelIdSubmit]['bypass-user-ineligible'] == 1 && pageConfigObj[renderPageId].data[panelIdSubmit]['bypass-user-ineligible-identifier']){
																		
										var sessionMethods = pageConfigObj[renderPageId].data[panelIdSubmit]['bypass-user-ineligible-identifier'];
										if(sessionMethods.indexOf('session') !== -1){
																				
											if(typeof req.session[namespaceObj.pid] !== 'object'){
												var sessionStore = {};	
											}else var sessionStore = req.session[namespaceObj.pid];
											
											if(Object.prototype.toString.call(sessionStore['reg-form-ineligible']) != '[object Array]')sessionStore['reg-form-ineligible'] = [];
					
											for(var k in submitDataFromPanel){	
											
												var pageId = k;
											
												for(var p in submitDataFromPanel[k]){	
											
													var panelId = submitDataFromPanel[k][p];
													sessionStore['reg-form-ineligible'].push({pageId: pageId, panelId: panelId});
														
												}
											}
																					
											req.session[namespaceObj.pid] = sessionStore;
											
										}	
										
									}
									
									redirectToPage('not-eligible', pageData, req, res, next, namespaceObj);
									
									
								}
								
							}
																				
						}
							
					}
					
				}else locationEligible=true;
					
				if(!locationEligible){

					redirectToPage('not-eligible', pageData, req, res, next, namespaceObj);	
				}
			}
			
			/*** ELIGIBILITY CHECK COMPLETE **/
			
			/*** RESPONSE HANDLER **/
			
			var sendResponse = function(){
						
				/* 
				// UNCOMMENT FOR TESTING
				var response = {};
				response.eligibility = eligibility;
				response.entryPeriod = entryPeriod;
				response.entryLimit = entryLimit;					
				response.valuesToSave = valuesToSave;
				response.stateValue = stateValue;
				response.panelId = panelIdSubmit;
				response.pageData = pageData;
				response.namespaceObj = namespaceObj;
				response.renderPageId = renderPageId;
				response.config = pageConfigObj[renderPageId].data[panelIdSubmit];
				res.send(response);
				return;
				*/
			
			
				if(pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'save-and-submit'){
					
					redirectToPage('thank-you', pageData, req, res, next, namespaceObj);
					
				}else if(pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'save-and-continue'){
			
					var passData = true;
					if(!pageConfigObj[renderPageId].data[panelIdSubmit]['submit-next-page']){
						redirectToPage('thank-you', pageData, req, res, next, namespaceObj, passData);
					}else{
						
						redirectToPage(pageConfigObj[renderPageId].data[panelIdSubmit]['submit-next-page'], pageData, req, res, next, namespaceObj, passData);

					}
					
				}else if(pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'do-not-save-and-continue'){
				
					var passData = true;
					
					
					if(!pageConfigObj[renderPageId].data[panelIdSubmit]['submit-next-page']){

						redirectToPage('thank-you', pageData, req, res, next, namespaceObj, passData);
					}else{
											
						redirectToPage(pageConfigObj[renderPageId].data[panelIdSubmit]['submit-next-page'], pageData, req, res, next, namespaceObj, passData);

					}
					
				}
	
				
			}
			
			
			/** START SAVEDATA**/
			
			var saveData = function(userUids, userIdentifierRecords, dataObj){	
			
				
				if(typeof dataObj == 'object' && typeof dataObj.userUidsHousehold == 'object' && typeof dataObj.userUidsPerPerson == 'object'){
				
					for(var k in userUids){
					
						if(dataObj.userUidsHousehold.indexOf(userUids[k]) !== -1 && dataObj.userUidsPerPerson.indexOf(userUids[k]) === -1){
							
							delete userUids[k];
							
						}
						
					}
					
					userUids = userUids.filter(function(n){ return n != '' });
					
				}
								
											
				res.userUids = userUids;
				
				if(errorResponseSent || redirectToPageCalled)return;

				if(pageConfigObj[renderPageId]['data'][panelIdSubmit]['submit-action'] == 'do-not-save-and-continue'){
					sendResponse();
					return;
				}
			
				var pointersToSaveObj = [];
				var promoObj = [];
				var timestamp = new Date().getTime();
				
				if(userUids.length == 0){
					var uuid = require('node-uuid').v4();
					userUids.push(uuid);
				}
				
				for(var i=0;i<20000; i++){
				
					userUids.push(userUids[0]+i);
					
				}
				
				var platform = pageData.__isFacebookTab ? 'facebook-page-tab' : pageData.__isFacebookCanvas ? 'facebook-canvas' : pageData.__mdIsMobile ? 'mobile' : 'microsite';
				
			
				
				for(var i=0; i<valuesToSave.length; i++){
					
					
					if(userUids.length == 0 && uuid){
						
						pointersToSaveObj.push(
							new HBaseTypes.Mutation({ column: 'pointer:'+valuesToSave[i].id+':'+valuesToSave[i].value.toLowerCase().trim(), value: userIdentifierRecords && userIdentifierRecords[valuesToSave[i].id] ? [userIdentifierRecords[valuesToSave[i].id],uuid].toString() : uuid })
						);
					}else{

						pointersToSaveObj.push(
							new HBaseTypes.Mutation({ column: 'pointer:'+valuesToSave[i].id+':'+valuesToSave[i].value.toLowerCase().trim(), value: userIdentifierRecords && userIdentifierRecords[valuesToSave[i].id] ? [userIdentifierRecords[valuesToSave[i].id],userUids.join(',')].toString().split(',').filter( function( item, index, inputArray ) { return inputArray.indexOf(item) == index; }).toString() : userUids.join(',') })
						);
						
					}
					
					
					promoObj.push(
						new HBaseTypes.Mutation({ column: 'formdata:'+renderPageId+':'+valuesToSave[i].panelId+':'+valuesToSave[i].id+':'+timestamp, value: valuesToSave[i].value.trim() })
					);
					
					promoObj.push(
						new HBaseTypes.Mutation({ column: 'formdata:'+renderPageId+':'+valuesToSave[i].panelId+':platform:'+timestamp, value: platform })
					);
				
					
				}
				
				for(var r in combinedPointersToSave){
				
					var pointers = combinedPointersToSave[r].split(':');
					var key = 'pointer:combined:';
				
					for(var p in pointers){
						
						key += pointers[p]+':'+req.body[pointers[p]].toLowerCase().trim()+'|:|';
						
					}
				
					if(userUids.length == 0 && uuid){
						
						pointersToSaveObj.push(
							new HBaseTypes.Mutation({ column: key, value: userIdentifierRecords && userIdentifierRecords[combinedPointersToSave[r]] ? [userIdentifierRecords[combinedPointersToSave[r]],uuid].toString() : uuid }));
							
					}else{
						
						pointersToSaveObj.push(
							new HBaseTypes.Mutation({ column: key, value: userIdentifierRecords && userIdentifierRecords[combinedPointersToSave[r]] ? [userIdentifierRecords[combinedPointersToSave[r]],userUids.join(',')].toString().split(',').filter( function( item, index, inputArray ) { return inputArray.indexOf(item) == index; }).toString() : userUids.join(',') })
						);
						
					}

				}
				
				
				if(pageData.__fbUID){
					if(userUids.length == 0 && uuid){
						pointersToSaveObj.push(
								new HBaseTypes.Mutation({ column: 'pointer:fbuid:'+pageData.__fbUID, value: userIdentifierRecords && userIdentifierRecords[valuesToSave[i].id] ? [userIdentifierRecords[valuesToSave[i].id],uuid].toString() : uuid })
							);
					}else{
						pointersToSaveObj.push(
							new HBaseTypes.Mutation({ column: 'pointer:fbuid:'+pageData.__fbUID, value: userIdentifierRecords && userIdentifierRecords['fbuid'] ? [userIdentifierRecords['fbuid'],userUids.join(',')].toString().split(',').filter( function( item, index, inputArray ) { return inputArray.indexOf(item) == index; }).toString() : userUids.join(',') })
						);
						
					}
					promoObj.push(
							new HBaseTypes.Mutation({ column: 'formdata:::fbuid:'+timestamp, value: pageData.__fbUID })
						);
				}
				
				if(pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'save-and-submit'){
					
					if(req.body.ref && userUids.indexOf(req.body.ref.toLowerCase().trim()) === -1){
						
												
						//NEED FURTHER WORK DONE TO CHECK IF ROW EXISTS AND IF BONUS ENTRY LIMIT REACHED
											
						db.increment('consumer-data', new HBaseTypes.TIncrement({row: namespaceObj.pid+':'+req.body.ref.toLowerCase().trim(), columns: [new HBaseTypes.TColumnIncrement({ family: 'formdatastats', qualifier: 'bonusentrycount' , amount: +1 })]}), function(err,data){
						
							if(err){
								console.log(err);								
							}
							
						});	
						
						db.mutateRowDeprecated('consumer-data', namespaceObj.pid+':'+req.body.ref.toLowerCase().trim(), [new HBaseTypes.Mutation({ column: 'formdatastats:bonustimestamps:'+timestamp+(Math.floor(Math.random()*90000) + 10000), value: timestamp.toString() })], {}, function(err,data) {
						
							if(err){
								console.log(err);
									
							}
						});	
						
						
					}
				
					promoObj.push(
						new HBaseTypes.Mutation({ column: 'formdatastats:timestamps:'+timestamp+(Math.floor(Math.random()*90000) + 10000), value: timestamp.toString() })
					);
												
					var entryCountToIncrease = 0;
					
					for(var u in userUids){
											
						db.increment('consumer-data', new HBaseTypes.TIncrement({row: namespaceObj.pid+':'+userUids[u], columns: 						[new HBaseTypes.TColumnIncrement({ family: 'formdatastats', qualifier: 'entrycount' , amount: +1 })]}), function(err,data){
							
							if(err){
								console.log(err);								
							}
							
						});
						
						entryCountToIncrease++;
						
					}
					
					
					var incrementObj = [];
					
					incrementObj.push(new HBaseTypes.TColumnIncrement({ family: 'formdatastats', qualifier: 'entrycount', amount: +entryCountToIncrease }));
					
					incrementObj = new HBaseTypes.TIncrement({row: namespaceObj.pid+':stats:'+renderPageId, columns: incrementObj});
					
					db.increment('consumer-data', incrementObj, function(err,data){
						
						if(err){
							console.log(err);								
						}
						
					});
				}
				
				promoObj.push(
						new HBaseTypes.Mutation({ column: 'formdatastats:completed:'+renderPageId+':'+panelIdSubmit, value: timestamp.toString() })
					);
				
				
				
				if(userUids.length > 0){
					
					if(errorResponseSent || redirectToPageCalled)return;
					
					db.mutateRowDeprecated('consumer-data', namespaceObj.pid+':pointers:reg-form', pointersToSaveObj, {}, function(err,data) {
					
						if(err){
							console.log(err);
						
								
						}
					});	
					
			
					for(var i in userUids){
																						
						db.mutateRowDeprecated('consumer-data', namespaceObj.pid+':'+userUids[i], promoObj, {}, function(err,data) {
						
							if(err){
								console.log(err);
									
							}
						});	
						
						if(pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'save-and-submit'){
							db.mutateRowDeprecated('consumer-data', namespaceObj.pid+':stats:timestamps', [
								new HBaseTypes.Mutation({ column: 'formdatastats:'+timestamp+(Math.floor(Math.random()*90000) + 10000), value: timestamp.toString() })
							], {}, function(err,data) {
							
								if(err){
									console.log(err);
										
								}
							});	
													
						}
				
						
					}	
					
				}
								
				sendResponse();
				
			}
			
			
			/** END SAVEDATA**/
			
			/** BEGIN ENTRY LIMIT CHECK **/
			
			if(typeof entryLimit == 'object'){
								
				var pointerObj = [];
				var combinedPointersToSave = [];				
			
				if(userIdentifiers.length>0){
					for(var k in userIdentifiers){
						var userIdentifier = userIdentifiers[k].split('|');
						for(var u in userIdentifier){
							var userIdentifierFields = userIdentifier[u].split(',');
							for(var f in userIdentifierFields){
								pointerObj.push(('pointer:'+userIdentifierFields[f]+':'+req.body[userIdentifierFields[f]]).toLowerCase().trim());
							}
							if(userIdentifierFields.length>1){
								userIdentifierFields.sort();
							
								var combinedPointer = '';
								var combinedPointerKeys = [];
								for(var f in userIdentifierFields){
									
									combinedPointer+= (userIdentifierFields[f]+':'+req.body[userIdentifierFields[f]]+'|:|').toLowerCase().trim();
									combinedPointerKeys.push(userIdentifierFields[f].toLowerCase().trim());
									
								}
								pointerObj.push('pointer:combined:'+combinedPointer.toLowerCase().trim());
								combinedPointersToSave.push(combinedPointerKeys.join(':')); 
							}
						}
					}
				}
				
				if(pageData.__fbUID){
					pointerObj.push('pointer:fbuid:'+pageData.__fbUID);
				}
								
				if(householdIdentifiers.length>0){
					for(var k in householdIdentifiers){
						var householdIdentifier = householdIdentifiers[k].split('|');
						for(var u in householdIdentifier){
							var householdIdentifierFields = householdIdentifier[u].split(',');
							for(var f in householdIdentifierFields){
								pointerObj.push(('pointer:'+householdIdentifierFields[f]+':'+req.body[householdIdentifierFields[f]]).toLowerCase().trim());
							}
						}
						if(householdIdentifierFields.length>1){
							householdIdentifierFields.sort();
						
							var combinedPointer = '';
							var combinedPointerKeys = [];
							for(var f in householdIdentifierFields){
								
								combinedPointer+= (householdIdentifierFields[f]+':'+req.body[householdIdentifierFields[f]]+'|:|').toLowerCase().trim();
								combinedPointerKeys.push(householdIdentifierFields[f].toLowerCase().trim());
								
							}
							pointerObj.push('pointer:combined:'+combinedPointer.toLowerCase().trim());
							combinedPointersToSave.push(combinedPointerKeys.join(':')); 
						}
					 
					}
				}
				
				db.getRowWithColumns('consumer-data', namespaceObj.pid+':pointers:reg-form', pointerObj, {}, function(err,data) {
		
		
					if(err){
						
						console.log(err);	
			
					}
									
					var userUids = [];
					
					if(data.length > 0){
						var userIdentifierRecords = {};
						var userUidsPerPerson = [];
					
						for(var key in data[0].columns){
																							
							var column = key.replace('pointer:','').split(":");
							
							if(column[0] == 'combined'){
							
								var columns = key.replace('pointer:combined:','').split("|:|");
								
								var columnsKey = [];
								
								for(var i in columns){
									
									if(columns[i] != ''){
										columnsKey.push(columns[i].split(':')[0]);
									}
									
								}
								
								userIdentifierRecords[columnsKey.join(':')] = data[0].columns[key].value;
								
								
							}else{
								userIdentifierRecords[column[0]] = data[0].columns[key].value;
							}
							
						}
												
														
						if(userIdentifiers.length>0){
							for(var k in userIdentifiers){
								var userIdentifier = userIdentifiers[k].split('|');
								
								for(var u in userIdentifier){
									
									var uids = {};
									
									var userIdentifierFields = userIdentifier[u].split(',');
									
									if(userIdentifierFields.length == 1){
										for(var f in userIdentifierFields){
											if(userIdentifierRecords[userIdentifierFields[f]]){
												var records = userIdentifierRecords[userIdentifierFields[f]].split(',');
												
												for(var r in records){
												
													if(typeof uids[records[r]] == 'undefined')uids[records[r]]=0;
													uids[records[r]]++;
													
												}
												
											}
										}
									}else if(userIdentifierFields.length>1){
										userIdentifierFields.sort();
										
										if(userIdentifierRecords[userIdentifierFields.join(':')]){
											var records = userIdentifierRecords[userIdentifierFields.join(':')].split(',');
											
											for(var r in records){
											
												if(typeof uids[records[r]] == 'undefined')uids[records[r]]=0;
												uids[records[r]]++;
												
											}
											
										}
									}																		
									
									for(var d in uids){
										//if(uids[d] == userIdentifierFields.length){
										
											if(userUids.indexOf(d) === -1){
												userUids.push(d);
											}
											userUidsPerPerson.push(d);
										//}
									}
									
								}
								
							}
							
						}
						
						if(pageData.__fbUID){
				
							if(userIdentifierRecords['fbuid'] && userUids.indexOf(userIdentifierRecords['fbuid']) === -1){
								userUids.push(userIdentifierRecords['fbuid']);
							}
							userUidsPerPerson.push(userIdentifierRecords['fbuid']);
						
						}
					
						
						var householdIdentifierRecords = {};
						var userUidsHousehold = [];
					
						for(var key in data[0].columns){
																							
							var column = key.replace('pointer:','').split(":");
																																			
							householdIdentifierRecords[column[0]] = data[0].columns[key].value;
							
						}
									
																
						if(householdIdentifiers.length>0){
							for(var k in householdIdentifiers){
								var householdIdentifier = householdIdentifiers[k].split('|');
								
								for(var u in householdIdentifier){
									
									var uids = {};
									
									var householdIdentifierFields = householdIdentifier[u].split(',');
									
									if(householdIdentifierFields.length == 1){
										for(var f in householdIdentifierFields){
											if(householdIdentifierRecords[householdIdentifierFields[f]]){
												var records = householdIdentifierRecords[householdIdentifierFields[f]].split(',');
												
												for(var r in records){
												
													if(typeof uids[records[r]] == 'undefined')uids[records[r]]=0;
													uids[records[r]]++;
													
												}
												
											}
										}
									}else if(householdIdentifierFields.length > 1){
									
										if(householdIdentifierFields.length>1){
											householdIdentifierFields.sort();
											if(householdIdentifierRecords[householdIdentifierFields.join(':')]){
												var records = householdIdentifierRecords[householdIdentifierFields.join(':')].split(',');
												
												for(var r in records){
												
													if(typeof uids[records[r]] == 'undefined')uids[records[r]]=0;
													uids[records[r]]++;
													
												}
												
											}
										}
									}
									
									for(var d in uids){
										//if(uids[d] == householdIdentifierFields.length){
										
											if(userUids.indexOf(d) === -1){
												userUids.push(d);
											}
											
											userUidsHousehold.push(d);
											
									//	}
										
									}
									
								}
								
							}
							
						}
					
					}
					
					
								
					var userUidsChecked = [];
					
					
					/** BEGIN OVERALL PROMOTION ENTRY LIMIT CHECK **/
					
					var checkedTotalEntries = true;
					var totalEntriesToCheck = [];	
					var totalEntriesChecked = 0;
					
					
					var checkedTotalEntriesCompleteAction = function(){
	
						if(totalEntriesChecked === totalEntriesToCheck.length){
										
							checkedTotalEntries=true;
							
							if(userUids.length === 0 || (userUidsChecked.length > 0 && userUidsChecked.length === userUids.length)){
							
								saveData(userUids, userIdentifierRecords);;
								
							}
							
						}	
						
					}
							
					for(var uuid in entryLimit){
								
						if(typeof entryLimit[uuid] == 'object' && entryLimit[uuid]['limit-type'] == 'total-entries'){
							
							checkedTotalEntries=false;
							totalEntriesToCheck.push(entryLimit[uuid]);
							
						}
						
					}
					
																		
					for(var t in totalEntriesToCheck){
											
						if(totalEntriesToCheck[t]['limit-number'] == '')totalEntriesToCheck[t]['limit-number'] = 1;
						if(parseInt(totalEntriesToCheck[t]['limit-number']) <= 0)continue;
						
						
						if(totalEntriesToCheck[t]['limit-period'].indexOf('entry-period') !== -1 && totalEntriesToCheck[t]['limit-period'] != 'entry-period'){
						
							var entryPeriodToCheck = parseInt(totalEntriesToCheck[t]['limit-period'].replace('entry-period','').replace('-',''));
													
							if(entryPeriodUUID && typeof entryPeriodSorted == 'object'){
																								
								if(typeof entryPeriodSorted[(entryPeriodToCheck -1)] == 'object' && new Date() < new Date(entryPeriodSorted[(entryPeriodToCheck -1)]['start']) || new Date() >= new Date(entryPeriodSorted[(entryPeriodToCheck -1)]['end'])){
										
									totalEntriesChecked++;
									checkedTotalEntriesCompleteAction();
									continue;
									
								}
							}
							
						}
						
											
						var timeData = getTimeData(totalEntriesToCheck[t], '', entryPeriodUUID, entryPeriodSorted);
											
						var curDate = timeData.curDate;
						var range = timeData.range;
						
						if(!isFinite(curDate)){
							
							curDate = new Date(0);
							
						}
						
						if(!isFinite(range)){
							
							range = 0;
							
						}
						

						var flt = "(RowFilter(=, 'binary:"+namespaceObj.pid+":stats:timestamps') AND KeyOnlyFilter() AND QualifierFilter(>=, 'binary:"+((curDate-range) > 0 ? (curDate-range)+"00000" : '0') +"') AND ColumnCountGetFilter("+totalEntriesToCheck[t]['limit-number'] +"))";	
																	
						var scan = new HBaseTypes.TScan({"columns" : ['formdatastats:'], "filterString" : flt,  "batchSize": 100000000000000, "caching": true});
										
						(function(t) {
							db.scannerOpenWithScan('consumer-data', scan, {}, function(err,data) {
							
							if(err){
								console.log(err);
								
							}
							if(data){
														  
								db.scannerGetList(data, 1, function(err, data){
									
									if(err){
										console.log(err);
									
									}
										
									if(data && data.length >0 && typeof data[0].columns == 'object' ){
									
										var entryCountDuringPeriod = Object.keys(data[0].columns).length;
																															
										if(parseInt(totalEntriesToCheck[t]['limit-number']) > 0 && entryCountDuringPeriod >= parseInt(totalEntriesToCheck[t]['limit-number'])){
																														
											redirectToPage('promotion-limit-reached', pageData, req, res, next, namespaceObj);
											return;	
											
										}
										
										totalEntriesChecked++;
										checkedTotalEntriesCompleteAction();
										
										
									}else{
										totalEntriesChecked++;	
										checkedTotalEntriesCompleteAction();
									}
									
								});
							}else{
								totalEntriesChecked++;
								checkedTotalEntriesCompleteAction();
							}
							
							
						})
						})(t);
												
					}
							
								
					//var totalPromotionEntryCount = promotionStats[0].columns['formdatastats:entrycount'] ? parseInt(convertCharStr2CP(convertNumbers2Char(promotionStats[0].columns['formdatastats:entrycount'].value, 'hex'), 'none', true, 'dec').replace(/ /g,''),10) : 0;
							
					/** END OVERALL PROMOTION ENTRY LIMIT CHECK **/
					
					/** BEGIN PER PERSON/HOUSEHOLD ENTRY LIMIT CHECK **/
									
					if(userUids.length > 0){
																				
						for(var u in userUids){
							
							var userObjGet = ['formdatastats:'];
							
							db.getRowWithColumns('consumer-data', namespaceObj.pid+':'+userUids[u], userObjGet, {}, function(err,userStats) {
				
								if(err){
									
									console.log(err);	
						
								}
															
								if(userStats.length>0 && typeof userStats[0].columns == 'object'){
									
									var userEntryTimestamps = [];
									var userCompleteForms = [];
					
									for(var key in userStats[0].columns){
													
										if(/^formdatastats:timestamps:/.test(key)){
																																																							
											userEntryTimestamps.push(parseInt(userStats[0].columns[key].value));
											
										}	
										if(/^formdatastats:completed:/.test(key)){
																						
											var column = key.replace('formdatastats:completed:','').split(":");
											
											userCompleteForms.push({pageId: column[0], panelId: column[1]});
											
																											
										}	
										
									}
									
																
									userEntryTimestamps.sort().reverse();
																										
									var userTotalEntryCount = userEntryTimestamps.length;
													
									for(var uuid in entryLimit){
										
										if((entryLimit[uuid]['limit-type'] == 'per-household' && userUidsHousehold.indexOf(userUids[u]) !== -1) || (entryLimit[uuid]['limit-type'] == 'per-person'  && userUidsPerPerson.indexOf(userUids[u]) !== -1)){ // per-household, per-person, total-entries
										
																		
											if(entryLimit[uuid]['limit-number'] == '')entryLimit[uuid]['limit-number'] = 1;
											if(parseInt(entryLimit[uuid]['limit-number']) <= 0)continue;
																			
											var timeData = getTimeData(entryLimit[uuid], userTotalEntryCount, entryPeriodUUID, entryPeriodSorted);
											var curDate = timeData.curDate;
											var range = timeData.range;
											
											var entryCountWithinPeriod = 0;
											
											if(userEntryTimestamps.length>0){
											
												for(var t in userEntryTimestamps){
												
													if((curDate - range) <= parseInt(userEntryTimestamps[t])){
																										
														entryCountWithinPeriod++;
														if(entryCountWithinPeriod >= parseInt(entryLimit[uuid]['limit-number'])){
															
															if(pageConfigObj[renderPageId].data[panelIdSubmit]['bypass-user-entry-limit'] == 1){
								
																if(pageConfigObj[renderPageId].data[panelIdSubmit]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
																	
																	setAlreadyEnteredSession = true;
																	
																}
																
															}
															redirectToPage('already-entered', pageData, req, res, next, namespaceObj);
														}
														
														if(parseInt(entryLimit[uuid]['limit-number']) - entryCountWithinPeriod === 1){
															if(pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'save-and-submit'){
	
																for(var k in submitDataFromPanel){	
							
																	var pageId = k;
																
																	for(var p in submitDataFromPanel[k]){	
																
																		var panelId = submitDataFromPanel[k][p];
																		
																		if(pageConfigObj[pageId].data[panelId]['bypass-user-entry-limit'] == 1 && pageConfigObj[pageId].data[panelId]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
																		
																			setAlreadyEnteredSession = true;
																			
																		}
																			
																	}
															
																}
															
															}
															
														}
														
													}
													
												}
												
											}else{
												
												if(parseInt(entryLimit[uuid]['limit-number']) === 1 && pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'save-and-submit'){
												
													for(var k in submitDataFromPanel){	
						
														var pageId = k;
													
														for(var p in submitDataFromPanel[k]){	
													
															var panelId = submitDataFromPanel[k][p];
															
															if(pageConfigObj[pageId].data[panelId]['bypass-user-entry-limit'] == 1 && pageConfigObj[pageId].data[panelId]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
															
																setAlreadyEnteredSession = true;
																
															}
																
														}
														
													}
													
												}
																			
											}
											
										}
										
									}
									
									if(pageConfigObj[renderPageId].data[panelIdSubmit]['bypass-user-completed-form'] == 1){
																				
										for(var c=0;c<userCompleteForms.length;c++){
										
											if(userCompleteForms[c]['pageId'] == renderPageId && userCompleteForms[c]['panelId'] == panelIdSubmit){									
												
												if(pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'save-and-submit'){
													
													
												}else{

													sendResponse();
													return;
												}
											
											}
										}
									}
									
								}
								
								userUidsChecked.push(userUids[u]);
								if(userUidsChecked.length > 0 && userUidsChecked.length === userUids.length && checkedTotalEntries){
								
									saveData(userUids, userIdentifierRecords, {userUidsHousehold: userUidsHousehold, userUidsPerPerson: userUidsPerPerson});;
									
								}
							
							})
							
							
							
						}
						
					}else{
					
						if(checkedTotalEntries){
							saveData(userUids, userIdentifierRecords);
						}
						
					}
									
					
				})
				
				
			}else{
			
				saveData(userUids, userIdentifierRecords);;	
				
			}
			
				
					
		});	
		
	}
	
	var skipValidationOnForms = {};
	
	var checksAndValidations = function(){
			
		/** PRELIMINARY CHECKS **/
		
		for(var k in submitDataFromPanel){
			
			var pageId = k;
			
			for(var p in submitDataFromPanel[k]){	
			
				var panelId = submitDataFromPanel[k][p];
				
				if(typeof skipValidationOnForms[pageId] == 'object' &&  skipValidationOnForms[pageId].indexOf(panelId) !== -1){
				
					continue;	
					
				}
			
				if(pageConfigObj[pageId].data[panelId]['bypass-user-ineligible'] == 1 && pageConfigObj[pageId].data[panelId]['bypass-user-ineligible-identifier'].indexOf('session') !== -1){
					
					if(typeof req.session[namespaceObj.pid] != 'undefined' && typeof req.session[namespaceObj.pid]['reg-form-ineligible'] == 'object'){
						
						for(var s in req.session[namespaceObj.pid]['reg-form-ineligible']){
							
							if(req.session[namespaceObj.pid]['reg-form-ineligible'][s]['pageId'] == pageId && req.session[namespaceObj.pid]['reg-form-ineligible'][s]['panelId'] == panelId){
								
						
								redirectToPage('not-eligible', pageData, req, res, next, namespaceObj);
								
							}
							
						}
						
						
					}
					
				}
				
				if(pageConfigObj[pageId].data[panelId]['bypass-user-entry-limit'] == 1 && pageConfigObj[pageId].data[panelId]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
					
					if(typeof req.session[namespaceObj.pid] != 'undefined' && typeof req.session[namespaceObj.pid]['reg-form-already-entered'] == 'object'){
						
						for(var s in req.session[namespaceObj.pid]['reg-form-already-entered']){
							
							if(req.session[namespaceObj.pid]['reg-form-already-entered'][s]['pageId'] == pageId && req.session[namespaceObj.pid]['reg-form-already-entered'][s]['panelId'] == panelId){
						
								redirectToPage('already-entered', pageData, req, res, next, namespaceObj);
								
							}
							
						}
												
					}
					
				}
				
				if(pageConfigObj[pageId].data[panelId]['check-entry-limit-with-person']){
					
					userIdentifiers.push(pageConfigObj[pageId].data[panelId]['check-entry-limit-with-person']);
					
				}
				
				if(pageConfigObj[pageId].data[panelId]['check-entry-limit-with-household']){
					
					householdIdentifiers.push(pageConfigObj[pageId].data[panelId]['check-entry-limit-with-household']);
				}
			}
			
		}

		/** END PRELIMINARY CHECKS **/
		
		/** FORM VALIDATIONS **/
			
		for(var k in submitDataFromPanel){
			
			var pageId = k;
			
			for(var p in submitDataFromPanel[k]){	
			
				var panelId = submitDataFromPanel[k][p];
				
				if(typeof skipValidationOnForms[pageId] == 'object' &&  skipValidationOnForms[pageId].indexOf(panelId) !== -1){
									
					continue;	
					
				}
						
				if(typeof pageConfigObj[pageId].data[panelId].data != 'undefined'){
											
					for(var key in pageConfigObj[pageId].data[panelId].data){
						
						if(pageConfigObj[pageId].data[panelId].data[key]['type'] == 'recaptcha' && pageId != renderPageId)continue;
					
						if(typeof pageConfigObj[pageId].data[panelId].data[key].req != 'undefined' && pageConfigObj[pageId].data[panelId].data[key].id || pageConfigObj[pageId].data[panelId].data[key]['type'] == 'recaptcha'){
											
							var postFieldValue = req.body[pageConfigObj[pageId].data[panelId].data[key].id];
																
							var type = pageConfigObj[pageId].data[panelId].data[key]['type'];
							
							if(typeof postFieldValue === 'object' && Object.prototype.toString.call(postFieldValue) == '[object Array]'){
								postFieldValue = postFieldValue.join('').trim();
							}
																
							if((typeof postFieldValue === 'string' && postFieldValue.trim() != '') || pageConfigObj[pageId].data[panelId].data[key].req == 'true'){																	
								var regex = getRegex(pageConfigObj[pageId].data[panelId].data[key].validation || type, req);
								
								
								if(type == 'date-of-birth' && pageConfigObj[pageId].data[panelId]['check-eligibility-with-dob'] && pageConfigObj[pageId].data[panelId]['check-eligibility-with-dob'].indexOf(pageConfigObj[pageId].data[panelId].data[key].id) !== -1){
									
									if(typeof postFieldValue != 'object' || Object.prototype.toString.call(postFieldValue) != '[object Object]'){
										errorResponse([pageConfigObj[pageId].data[panelId].data[key].id],pageConfigObj[pageId].data[panelId].data[key].label,req, res);
		
									}
									
									var dobFields = pageConfigObj[pageId].data[panelId].data[key].style.split(',');
									
									var dobFull = {};
									
									if(dobFields.indexOf('year') !== -1){
									
										if(!postFieldValue || !/^\d{4}$/.test(postFieldValue['y'])){
											errorResponse([pageConfigObj[pageId].data[panelId].data[key].id+'\\.y'],pageConfigObj[pageId].data[panelId].data[key].label,req, res);
										}else dobFull.y = parseInt(postFieldValue['y'], 10);
									}
									if(dobFields.indexOf('month') !== -1){
									
										if(!postFieldValue || !/^([1-9]|0[1-9]|1[0-2])$/.test(postFieldValue['m'])){
											errorResponse([pageConfigObj[pageId].data[panelId].data[key].id+'\\.m'],pageConfigObj[pageId].data[panelId].data[key].label,req, res);
										}else dobFull.m = parseInt(postFieldValue['m'], 10);
									}
									if(dobFields.indexOf('date') !== -1){
									
										if(!postFieldValue || !/^[1-9]|0[1-9]|[12][0-9]|3[01]$/.test(postFieldValue['d'])){
											errorResponse([pageConfigObj[pageId].data[panelId].data[key].id+'\\.d'],pageConfigObj[pageId].data[panelId].data[key].label,req, res);
										}else dobFull.d = parseInt(postFieldValue['d'], 10);
									}
									
									if(pageConfigObj[pageId].data[panelId]['check-eligibility-with-dob'].indexOf(pageConfigObj[pageId].data[panelId].data[key].id) !== -1){
									
										requirementChecks.dob.push({panelId: panelId, fieldId: pageConfigObj[pageId].data[panelId].data[key].id, dobValue: dobFull});
										
									}
									
									if(errorResponseSent)return;
																	
									var y = parseInt(dobFull['y'],10) || 2000, m  = parseInt(dobFull['m'],10) || 1, d = parseInt(dobFull['d'],10) || 1;
									var daysInMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
									
									if ( (!(y % 4) && y % 100) || !(y % 400)) {
										daysInMonth[1] = 29;
									}
									  
									if(!(d <= daysInMonth[--m])){
										errorResponse([pageConfigObj[pageId].data[panelId].data[key].id+'\\.d'],pageConfigObj[pageId].data[panelId].data[key].label,req, res);
									}						
										
									
								}
								
								if(type == 'date-of-birth'){
								
									postFieldValue = (postFieldValue['y'] ? postFieldValue['y'] : '0000')+'-'+(postFieldValue['m'] ? postFieldValue['m'] : '01')+'-'+(postFieldValue['d'] ? postFieldValue['d'] : '01');
	
									
								}
								
								
								
								if(regex){
								
									if(!regex.test(postFieldValue) || typeof postFieldValue === 'undefined'){
									
										errorResponse([pageConfigObj[pageId].data[panelId].data[key].id],pageConfigObj[pageId].data[panelId].data[key].label,req, res);
										
									}	
									
								}
															
							}
							
							if(type == 'recaptcha'){
								
								var hasRecaptcha = true;
								continue;
									
							}
							
		
							if(pageConfigObj[pageId].data[panelId]['submit-action'] == 'save-and-submit' 
							|| (pageConfigObj[pageId].data[panelId]['submit-action'] == 'save-and-continue' 
							&& pageId == renderPageId) 
							|| ((pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'save-and-continue' 
							|| pageConfigObj[renderPageId].data[panelIdSubmit]['submit-action'] == 'save-and-submit') 
							&& pageConfigObj[pageId].data[panelId]['submit-action'] == 'do-not-save-and-continue')){
																
								var valuesToSaveObj = {};
								valuesToSaveObj.id = pageConfigObj[pageId].data[panelId].data[key].id;
								valuesToSaveObj.panelId = panelId;
								valuesToSaveObj.value = postFieldValue;
								valuesToSave.push(valuesToSaveObj);
							}
		
							
						}
						
						
					}
					
					
						
				}
				
			}
	
		}
		
		
		var fbAllowAccessRequirementCheck = function(){
			
			if(pageData.__fbAllowAccess){
		
				var FB = require('fb');
				FB.setAccessToken(req.body.access_token);
																							  
				FB.api('me', function (fbData) {
					
					
					if(fbData && fbData.id){
						pageData.__fbUID = fbData.id;
						validationSuccess();
					}else{
						errorResponse('access_token','You must allow access to your Facebook profile to continue.',req, res);
					}

				})
				
				
			}else validationSuccess();
		}


		if(errorResponseSent || redirectToPageCalled)return;

		if(hasRecaptcha){

			var recaptcha = require('simple-recaptcha');
								
			var privateKey = '6LeguQgAAAAAAF829dZvK7Xw-p1VX02Q4CFZlVHP';
			var ip = req.ip;
			var challenge = req.body['recaptcha_challenge_field'];
			var response = req.body['recaptcha_response_field'];
		
			recaptcha(privateKey, ip, challenge, response, function(err) {
				if(err){
				
					errorResponse(['recaptcha_response_field'],'Captcha',req, res);
					
				}else{
					recaptchaValidated = true;
					fbAllowAccessRequirementCheck();
				}
			});		
			
		}else{

			fbAllowAccessRequirementCheck();
		}
		
		
	}
	
	if(req.body['uid']){	
		
		var userUids = req.body['uid'].split(',');
		
		db.getRowWithColumns('consumer-data', namespaceObj.pid+':'+userUids[0], ['formdatastats:'], {}, function(err,userFormData) {
					
			if(err){
				
				console.log(err);	
	
			}
				
			if(userFormData.length > 0){

				for(var key in userFormData[0].columns){
					
								
					if(/^formdatastats:completed:/.test(key)){
																	
						var column = key.replace('formdatastats:completed:','').split(":");
												
						if(typeof skipValidationOnForms[column[0]] == 'undefined')skipValidationOnForms[column[0]]=[];
						
						if(pageConfigObj[column[0]] && pageConfigObj[column[0]].data && pageConfigObj[column[0]].data[column[1]] && pageConfigObj[column[0]].data[column[1]]['save-data-from']  == 'entire-page'){
																											
							skipValidationOnForms[column[0]] = Object.keys(pageConfigObj[column[0]].data);
								
						}else{
														
							if(pageConfigObj[column[0]] && pageConfigObj[column[0]].data && pageConfigObj[column[0]].data[column[1]] && pageConfigObj[column[0]].data[column[1]]['bypass-user-completed-form'] == 1){
								
								skipValidationOnForms[column[0]].push(column[1]);
								
							}
							
						}
																						
					}
					
				}
			}
									
			checksAndValidations();
				
			
		})
		
	}else{
		
		checksAndValidations();
		
	}
	

}

var redirectToPageCalled = false;
var setAlreadyEnteredSession = false;

var errorResponseSent = false;

var errorResponse = function(error, errorMsg, req, res){

	if(errorResponseSent)return;
	errorResponseSent=true;
		
	if(req.xhr){
		res.json(200, {error: error});	
		return;
	}else{
	
	 if (req.accepts('html')) {
		res.status(400);
		res.render('../public/tpl/400.html', {errorMsg: [errorMsg]});
		return;
	  }	
		
	}
	return;
	
}


var getTimeData = function(entryLimitObj, userTotalEntryCount, entryPeriodUUID, entryPeriodSorted){
	
	var time = require('time');
	var timezone = 'America/New_York';
	
	switch(entryLimitObj['limit-period-timezone']){
		case 'CT':
		timezone = 'America/Chicago';
		break;
		case 'MT':
		timezone = 'America/Phoenix';
		break;
		case 'PT':
		timezone = 'America/Los_Angeles';
		break;
		case 'HAST':
		timezone = 'Pacific/Honolulu';
		
	}
									
	var curDate = Infinity;
	var range = -Infinity;
	
	switch(entryLimitObj['limit-period'].substring(0, 12)){
		
		//entire-promotion, entry-period, entry-period-n, calendar-day-n, calendar-week-dayOfWeek, 
		//calendar-month-n, minutes-period-n, hours-period-n
		
		case 'entire-promo':

			if(userTotalEntryCount >= parseInt(entryLimitObj['limit-number'])){
			
				curDate = -Infinity;
				range = Infinity;
				
			}
		
		break;
	
		case 'entry-period':
		
			curDate = new time.Date(new Date()).setTimezone(timezone);
			
			var entryPeriod = parseInt(entryLimitObj['limit-period'].replace('entry-period','').replace('-',''));
						
			if(!entryPeriod){
			
				if(entryPeriodUUID && typeof entryPeriodSorted == 'object'){
					for(var e in entryPeriodSorted){
												
						if(entryPeriodSorted[e]['uuid'] == entryPeriodUUID){
							
							range = curDate - new Date(entryPeriodSorted[e]['start']);
							break;
							
						}
						
					}
				}
			}else{
							
				if(entryPeriodUUID && typeof entryPeriodSorted == 'object'){
					for(var e in entryPeriodSorted){
												
						if(e == (entryPeriod -1)){
							
							range = curDate - new Date(entryPeriodSorted[e]['start']);
							break;
							
						}
						
					}
				}
				
			}
						
			if(!isFinite(range))curDate = -Infinity;
					
		
		break;
		
		case 'calendar-day':
		
			curDate = new time.Date(new Date().setHours(0,0,0,0)).setTimezone(timezone);
			range = (parseInt(entryLimitObj['limit-period'].replace('calendar-day-','')) - 1)*86400000;
		
		break;
		
		case 'calendar-wee':
		
			var days = ['sun','mon','tues','wed','thur','fri','sat'];
			
			curDate = new time.Date(new Date().setHours(0,0,0,0)).setTimezone(timezone);
			range = curDate - new time.Date(new Date(new Date().setHours(0,0,0,0)).setDate(curDate.getDate() - curDate.getDay() + days.indexOf(entryLimitObj['limit-period'].replace('calendar-week-','')))).setTimezone(timezone);
		
		break;
			
		case 'calendar-mon':
			
			curDate = new time.Date(new Date().setHours(0,0,0,0)).setTimezone(timezone);
						
			range = curDate - new time.Date(new Date(curDate.getFullYear(), (curDate.getMonth() - parseInt(entryLimitObj['limit-period'].replace('calendar-month-','')) + 1), 1)).setTimezone(timezone);
		
		break;
		
		case 'minutes-peri':
		
			curDate = new time.Date(new Date()).setTimezone(timezone);
			range = parseInt(entryLimitObj['limit-period'].replace('minutes-period-',''))*60000;
		
		break;
		
		case 'hours-period':
		
			curDate = new time.Date(new Date()).setTimezone(timezone);
			range = parseInt(entryLimitObj['limit-period'].replace('hours-period-',''))*3600000;
		
		break;
		
		
		
	}
	
	
	if(isFinite(curDate)){
		curDate = calcTime(curDate, parseInt(curDate.toLocaleString().match(/(-|\+)\d{2}/)[0])-(-new Date().getTimezoneOffset()/60));
	}
	
	return {curDate: curDate, range: range}

}


var getRegex = function(type, req){
		
	if(type && type.substring(0,1) == '/'){
			
			type = type.split('/');
			
			flag = type.pop();
			
			type.shift();
			
			regex = new RegExp(type.join('/'), flag);
						
	}else{
		switch (type){
			case 'email':
				regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
				break;
			case 'date':
				regex = /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]((\d{4})|(\d{2}))$/;
				break;
			case 'phone':
			case 'phone-field':
				regex = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
				break;
			case 'address':
				regex = / +/;
				break;
			case 'name':
				regex = /^[-'a-zA-ZÀ-ÖØ-öø-ſ ]+$/;
				break;
			case 'city':
				regex = /^[-.a-zA-Z ]+$/;
				break;
			case 'zip':
				regex = /^\d{5}(-\d{4})?$/;
				break;
			case 'zip_ca_only':
				regex = /^([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)$/;
				break;
			case 'zip_with_ca':
				regex = /^((\d{5}-\d{4})|(\d{5})|([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d))$/;
				break;
			case 'number':
				regex = /^[0-9]+$/;
				break;
			case 'numeric':
				regex = /^[\d,]+$/;
				break;
			case 'alphanumeric':
				regex = /^[0-9a-zA-Z]+$/;
				break;
			default:
				regex = /^(?!\s*$).+/;
				break;
		}	
	}
	
	if(type == 'match' || type == 'recaptcha'){
					
		regex = '';
		
	}
	
	
	return regex;
		
	
}

var calcTime = function(curDate, offset) {

    return new Date(curDate.getTime() - (3600000*offset));

}


var  convertNumbers2Char = function ( str, type ) { 
	// converts a string containing HTML/XML character entities to a string of characters
	// str: string, the input
	// type: string enum [none, hex, dec, utf8, utf16], what to treat numbers as
	
	if (type == 'hex') {
		str = str.replace(/(\b[A-Fa-f0-9]{1,6}\b)/g, 
					function(matchstr, parens) {
						return hex2char(parens);
						}
						);
		}
	else if (type == 'dec') {
		str = str.replace(/(\b[0-9]+\b)/g, 
					function(matchstr, parens) {
						return dec2char(parens);
						}
						);
		}
	else if (type == 'utf8') {
		str = str.replace(/(( [A-Fa-f0-9]{2})+)/g, 
		//str = str.replace(/((\b[A-Fa-f0-9]{2}\b)+)/g, 
					function(matchstr, parens) {
						return convertUTF82Char(parens); 
						}
						);
		}
	else if (type == 'utf16') {
		str = str.replace(/(( [A-Fa-f0-9]{1,6})+)/g, 
					function(matchstr, parens) {
						return convertUTF162Char(parens);
						}
						);
		}
	return str;
	}






var  convertCharStr2CP  = function( textString, preserve, pad, type ) { 
	// converts a string of characters to code points, separated by space
	// textString: string, the string to convert
	// preserve: string enum [ascii, latin1], a set of characters to not convert
	// pad: boolean, if true, hex numbers lower than 1000 are padded with zeros
	// type: string enum[hex, dec, unicode, zerox], whether output should be in hex or dec or unicode U+ form
	var haut = 0;
	var n = 0;
	var CPstring = '';
	var afterEscape = false;
	for (var i = 0; i < textString.length; i++) {
		var b = textString.charCodeAt(i); 
		if (b < 0 || b > 0xFFFF) {
			CPstring += 'Error in convertChar2CP: byte out of range ' + dec2hex(b) + '!';
			}
		if (haut != 0) {
			if (0xDC00 <= b && b <= 0xDFFF) { //alert('12345'.slice(-1).match(/[A-Fa-f0-9]/)+'<');
				//if (CPstring.slice(-1).match(/[A-Za-z0-9]/) != null) { CPstring += ' '; }
				if (afterEscape) { CPstring += ' '; }
				if (type == 'hex') { 
					CPstring += dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)); 
					}
				else if (type == 'unicode') { 
					CPstring += 'U+'+dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)); 
					}
				else if (type == 'zerox') { 
					CPstring += '0x'+dec2hex(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00)); 
					}
				else { 
					CPstring += 0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00); 
					}
				haut = 0;
				continue;
				afterEscape = true;
				}
			else {
				CPstring += 'Error in convertChar2CP: surrogate out of range ' + dec2hex(haut) + '!';
				haut = 0;
				}
			}
		if (0xD800 <= b && b <= 0xDBFF) {
			haut = b;
			}
		else {
			if (b <= 127 && preserve == 'ascii') {
				CPstring += textString.charAt(i);
				afterEscape = false;
				}
			else if (b <= 255 && preserve == 'latin1') {
				CPstring += textString.charAt(i);
				afterEscape = false;
				}
			else { 
				//if (CPstring.slice(-1).match(/[A-Za-z0-9]/) != null) { CPstring += ' '; }
				if (afterEscape) { CPstring += ' '; }
				if (type == 'hex') { 
					cp = dec2hex(b); 
					if (pad) { while (cp.length < 4) { cp = '0'+cp; } }
					}
				else if (type == 'unicode') { 
					cp = dec2hex(b); 
					if (pad) { while (cp.length < 4) { cp = '0'+cp; } }
					CPstring += 'U+'; 
					}
				else if (type == 'zerox') { 
					cp = dec2hex(b); 
					if (pad) { while (cp.length < 4) { cp = '0'+cp; } }
					CPstring += '0x'; 
					}
				else { 
					cp = b;
					}
				CPstring += cp; 
				afterEscape = true;
				}
			}
		}
	//return CPstring.substring(0, CPstring.length-1);
	return CPstring;
	}
	