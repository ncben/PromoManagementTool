module.exports = function(namespaceObj, pageConfigObj, pageData, renderPageId, req, res, next){
	
	var dataPathObj = req.body['dataPath'].split('/').filter( function( item, index, inputArray ) { return !!item.trim() });
				
	var dataString = req.body['dataString'].split( "&" );
	
	for ( i = 0, length = dataString.length; i < length; i++ ) {
		var parts =  dataString[ i ].split( "=" );
		var name = decodeURIComponent( parts[ 0 ] );
		
		var nameObj = name.match(/\[[0-9a-zA-Z+]\]$/);
		
		
		if(nameObj != null && typeof nameObj == 'object' && nameObj.length>0){			
			
			var nameObjKey = nameObj[0].replace(/\[[0-9a-zA-Z+]\]$/, '');
			
			if(typeof req.body[nameObjKey] == 'undefined')req.body[nameObjKey] = {};
			req.body[nameObjKey][nameObj[0].match(/[0-9a-zA-Z+]/)[0]] = decodeURIComponent( parts[ 1 ].replace( /\+/g, "%20" ) );
			
		}else{
		
			req.body[name] = parts[ 1 ] ? decodeURIComponent( parts[ 1 ].replace( /\+/g, "%20" ) ) : '';
			
		}
		
	
	}
	
	var submitDataFromPanel = {};
		
	for(k in dataPathObj){
	
		var requirePageId = dataPathObj[k].split('.')[0];
		
		var requirePagePanel = dataPathObj[k].split('.')[1];
		
		if(!requirePagePanel.trim() || !(requirePagePanel in pageConfigObj[requirePageId].data) || pageConfigObj[requirePageId]['hasFormElementArray'].indexOf(requirePagePanel) === -1){
			return next();	
		}
		
		submitDataFromPanel[requirePageId] = pageConfigObj[requirePageId].data[requirePagePanel]['save-data-from'] == 'entire-page' ? Object.keys(pageConfigObj[requirePageId].data) : [requirePagePanel];
		
	
		
	}
		
	/** REDIRECT HANDLER **/
	
	var redirectToPage = function(type, pageData, req, res, next, namespaceObj, passData){
			
		if(requestTransferred)return;
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
				
				for(k in submitDataFromPanel){	
				
					var pageId = k;
				
					for(p in submitDataFromPanel[k]){	
				
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
					res.json(200, {next: nextPage, passData: passData ? true : ''})
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
	
	/** PRELIMINARY CHECKS **/

	var valuesToSave = [];
	var userIdentifiers = [];
	var householdIdentifiers = [];
			
	for(k in submitDataFromPanel){
		
		var pageId = k;
		
		for(p in submitDataFromPanel[k]){	
		
			var panelId = submitDataFromPanel[k][p];
			
			if(pageConfigObj[pageId].data[panelId]['bypass-user-ineligible'] == 1 && pageConfigObj[pageId].data[panelId]['bypass-user-ineligible-identifier'].indexOf('session') !== -1){
				
				if(typeof req.session[namespaceObj.pid] != 'undefined' && typeof req.session[namespaceObj.pid]['reg-form-ineligible'] == 'object'){
					
					for(s in req.session[namespaceObj.pid]['reg-form-ineligible']){
						
						if(req.session[namespaceObj.pid]['reg-form-ineligible'][s]['pageId'] == pageId && req.session[namespaceObj.pid]['reg-form-ineligible'][s]['panelId'] == panelId){
					
							redirectToPage('not-eligible', pageData, req, res, next, namespaceObj);
							
						}
						
					}
					
					
				}
				
			}
			
			if(pageConfigObj[pageId].data[panelId]['bypass-user-entry-limit'] == 1 && pageConfigObj[pageId].data[panelId]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
				
				if(typeof req.session[namespaceObj.pid] != 'undefined' && typeof req.session[namespaceObj.pid]['reg-form-already-entered'] == 'object'){
					
					for(s in req.session[namespaceObj.pid]['reg-form-already-entered']){
						
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
	
	
	if(redirectToPageCalled)return;
		
	/** VALIDATION SUCCESS AFTER THIS POINT **/
	
	var validationSuccess = function(){
			
		var db =  require('../db').db;
		var HBaseTypes =  require('../db').HBaseTypes;
	
		db.getRowWithColumns('promobuilder', 'promo:'+namespaceObj.pid, ['regform:'], {}, function(err,data) {
											
			if(err || !data){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
		
				
			}				
		
			if(data.length > 0){
				
				var entryPeriod = {};
				var entryLimit = {};
				
				for(key in data[0].columns){
				
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
			
				res.render('../public/tpl/200-no-reg-form-info.html');
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
							
				for(uuid in entryPeriod){
					
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
				
			/*** RESPONSE HANDLER **/
			
			var sendResponse = function(userUidsToPass, nextPage, skipPanelId){
								
				if(requestTransferred)return;
				if(redirectToPageCalled)return;
				redirectToPageCalled = true;
				
				res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
				
				if(userUidsToPass){
					
					if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(nextPage)){
		
						var aliasExists = typeof pageData.alias != 'undefined' && typeof pageData.alias[nextPage] == 'object' && pageData.alias[nextPage]['alias'];								
					}
					
					if(aliasExists){
					
						nextPage = pageData.alias[nextPage]['alias'];
						
					}
										
					var passObjToNextForm = JSON.stringify({dataString: req.body['dataString'], dataPath: req.body['dataPath'],renderPageId: renderPageId, skipPanelId: skipPanelId, uid: userUidsToPass, access_token: req.body['access_token'] || '', ref: req.body['ref'] || req.query['ref'] || '', signed_request: req.body['signed_request'] || '', __isFacebookTabOn: (req.body['__isFacebookTabOn'] == 1 || req.body['__isFacebookTabOn'] == 'true'), __isFacebookCanvasOn: (req.body['__isFacebookCanvasOn'] == 1|| req.body['__isFacebookCanvasOn'] == 'true')});
										
					res.render('../public/tpl/200-post-next-form.html', {passObjToNextForm: passObjToNextForm, nextPage: nextPage});					
					return;
								
				}
			
				pageConfigObj[renderPageId].variables.customHeadValues += '<script> var postdata="'+req.body['dataString']+'", postpath="'+req.body['dataPath']+'"'+(typeof req.body['uid'] != 'undefined' ? ', uid='+(typeof req.body['uid'] == 'object'  ? JSON.stringify(req.body['uid']) : '["'+req.body['uid']+'"]') : '')+'; </script>';
				
				
				res.render('../views/caches/'+namespaceObj.pid+'/'+renderPageId+'.html', {vars: pageConfigObj[renderPageId].variables || {}}, function(err, html){ err ? next() && console.log(err) : res.end(html)});
				
				return;
	
				
			}
			
			
			/** BEGIN ENTRY LIMIT CHECK **/
			
			if(typeof entryLimit == 'object'){
								
				var pointerObj = [];
			
				if(userIdentifiers.length>0){
					for(k in userIdentifiers){
						var userIdentifier = userIdentifiers[k].split('|');
						for(u in userIdentifier){
							var userIdentifierFields = userIdentifier[u].split(',');
							for(f in userIdentifierFields){
								pointerObj.push('pointer:'+userIdentifierFields[f]+':'+req.body[userIdentifierFields[f]]);
							}
						}
					}
				}
				
				
				if(pageData.__fbUID){
					pointerObj.push('pointer:fbuid:'+pageData.__fbUID);
				}
				
				if(householdIdentifiers.length>0){
					for(k in householdIdentifiers){
						var householdIdentifier = householdIdentifiers[k].split('|');
						for(u in householdIdentifier){
							var householdIdentifierFields = householdIdentifier[u].split(',');
							for(f in householdIdentifierFields){
								pointerObj.push('pointer:'+householdIdentifierFields[f]+':'+req.body[householdIdentifierFields[f]]);
							}
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
					
						for(key in data[0].columns){
																							
							var column = key.replace('pointer:','').split(":");
																																			
							userIdentifierRecords[column[0]] = data[0].columns[key].value;
							
						}
									
																
						if(userIdentifiers.length>0){
							for(k in userIdentifiers){
								var userIdentifier = userIdentifiers[k].split('|');
								
								for(u in userIdentifier){
									
									var uids = {};
									
									var userIdentifierFields = userIdentifier[u].split(',');
									for(f in userIdentifierFields){
										if(userIdentifierRecords[userIdentifierFields[f]]){
											var records = userIdentifierRecords[userIdentifierFields[f]].split(',');
											
											for(r in records){
											
												if(typeof uids[records[r]] == 'undefined')uids[records[r]]=0;
												uids[records[r]]++;
												
											}
											
										}
									}
									
									
									for(d in uids){
										if(uids[d] == userIdentifierFields.length){
										
											if(userUids.indexOf(d) === -1){
												userUids.push(d);
											}
											userUidsPerPerson.push(d);
										}
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
					
						for(key in data[0].columns){
																							
							var column = key.replace('pointer:','').split(":");
																																			
							householdIdentifierRecords[column[0]] = data[0].columns[key].value;
							
						}
									
																
						if(householdIdentifiers.length>0){
							for(k in householdIdentifiers){
								var householdIdentifier = householdIdentifiers[k].split('|');
								
								for(u in householdIdentifier){
									
									var uids = {};
									
									var householdIdentifierFields = householdIdentifier[u].split(',');
									for(f in householdIdentifierFields){
										if(householdIdentifierRecords[householdIdentifierFields[f]]){
											var records = householdIdentifierRecords[householdIdentifierFields[f]].split(',');
											
											for(r in records){
											
												if(typeof uids[records[r]] == 'undefined')uids[records[r]]=0;
												uids[records[r]]++;
												
											}
											
										}
									}
									
									
									for(d in uids){
										if(uids[d] == householdIdentifierFields.length){
										
											if(userUids.indexOf(d) === -1){
												userUids.push(d);
											}
											
											userUidsHousehold.push(d);
											
										}
										
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

								sendResponse();
								
							}
							
						}	
						
					}
							
					for(uuid in entryLimit){
								
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
							
							
						});	
						})(t);
												
					}
							
			
					/** END OVERALL PROMOTION ENTRY LIMIT CHECK **/
					
					/** BEGIN PER PERSON/HOUSEHOLD ENTRY LIMIT CHECK **/
									
					if(userUids.length > 0){
														
						for(u in userUids){
							
							var userObjGet = ['formdatastats:'];
							
							db.getRowWithColumns('consumer-data', namespaceObj.pid+':'+userUids[u], userObjGet, {}, function(err,userStats) {
				
								if(err){
									
									console.log(err);	
						
								}
																						
								if(userStats.length>0 && typeof userStats[0].columns == 'object'){
									
									var userEntryTimestamps = [];
									var userCompleteForms = [];
					
									for(key in userStats[0].columns){
													
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
													
									for(uuid in entryLimit){
										
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
															
															for(var p=0;p< pageConfigObj[renderPageId]['hasFormElementArray'].length;p++){
															
																if(pageConfigObj[renderPageId].data[pageConfigObj[renderPageId]['hasFormElementArray'][p]]['bypass-user-entry-limit'] == 1){
									
																	if(pageConfigObj[renderPageId].data[pageConfigObj[renderPageId]['hasFormElementArray'][p]]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
																		
																		setAlreadyEnteredSession = true;
																		
																	}
																	
																}
																
															}
															redirectToPage('already-entered', pageData, req, res, next, namespaceObj);
														}
														
														if(parseInt(entryLimit[uuid]['limit-number']) - entryCountWithinPeriod === 1){
															
															for(var p=0;p< pageConfigObj[renderPageId]['hasFormElementArray'].length;p++){
															
																if(pageConfigObj[renderPageId].data[pageConfigObj[renderPageId]['hasFormElementArray'][p]]['bypass-user-entry-limit'] == 1){
									
																	if(pageConfigObj[renderPageId].data[pageConfigObj[renderPageId]['hasFormElementArray'][p]]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
																		
																		setAlreadyEnteredSession = true;
																		
																	}
																	
																}
																
															}
															
															
														}
														
													}
													
												}
												
											}
												
										}
										
									}
									
									main_loop:
									for(var p=0;p< pageConfigObj[renderPageId]['hasFormElementArray'].length;p++){
	
										if(pageConfigObj[renderPageId].data[pageConfigObj[renderPageId]['hasFormElementArray'][p]]['bypass-user-completed-form'] == 1){
										
											sub_loop:
											for(var c=0;c<userCompleteForms.length;c++){
											
												if(userCompleteForms[c]['pageId'] == renderPageId && userCompleteForms[c]['panelId'] == 								pageConfigObj[renderPageId]['hasFormElementArray'][p]){	
												
													if(pageConfigObj[renderPageId].data[pageConfigObj[renderPageId]['hasFormElementArray'][p]]['submit-action'] == 'save-and-submit'){
														
														req.body['datapath'] = req.body['dataPath']+'/'+renderPageId+'.'+pageConfigObj[renderPageId]['hasFormElementArray'][p];
														requestTransferred=true;
														require('./postform.js')(namespaceObj, pageConfigObj, pageData, renderPageId, req, res, next);
														break;
														break main_loop;
														return;
														
													
													}else{
														
														
														if(pageConfigObj[renderPageId].data[pageConfigObj[renderPageId]['hasFormElementArray'][p]]['submit-next-page']){
														
															sendResponse(userUids, pageConfigObj[renderPageId].data[pageConfigObj[renderPageId]['hasFormElementArray'][p]]['submit-next-page'], pageConfigObj[renderPageId]['hasFormElementArray'][p]);
															return;
															
														}else{
														
															res.render('../public/tpl/200-no-next-form-specified.html');
															return;	
															
														}
													}
											
												
												
												}
											}
										}
									}
									
								}
								
								userUidsChecked.push(userUids[u]);
								if(userUidsChecked.length > 0 && userUidsChecked.length === userUids.length && checkedTotalEntries){
								
									sendResponse();
									
								}
							
							})
							
							
							
						}
						
					}else{
					
						if(checkedTotalEntries){

							sendResponse();
						}
						
					}
									
					
				})
				
				
			}else{

				sendResponse();	
				
			}
			
				
					
		});	
		
	}
	
				
	if(pageData.__fbAllowAccess){

		var FB = require('fb');
		FB.setAccessToken(req.body.access_token);
																					  
		FB.api('me', function (fbData) {
						
			if(fbData && fbData.id){
				pageData.__fbUID = fbData.id;
			}
						
			validationSuccess();

		})
		
		
	}else validationSuccess();
			

}
var setAlreadyEnteredSession = false;
var redirectToPageCalled = false;
var requestTransferred = false;

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
					for(e in entryPeriodSorted){
												
						if(entryPeriodSorted[e]['uuid'] == entryPeriodUUID){
							
							range = curDate - new Date(entryPeriodSorted[e]['start']);
							break;
							
						}
						
					}
				}
			}else{
							
				if(entryPeriodUUID && typeof entryPeriodSorted == 'object'){
					for(e in entryPeriodSorted){
												
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


var calcTime = function(curDate, offset) {

    return new Date(curDate.getTime() - (3600000*offset));

}
