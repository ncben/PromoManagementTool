var HBaseTypes =  require('../db').HBaseTypes;
var db =  require('../db').db;

module.exports = function(namespaceObj, pageConfig, pageData, renderPageId, req, res, next){
					
	var redirectToPageCalled = false;
	var hasRegForm = pageData && pageData.components && pageData.components.indexOf('15') !== -1;
	
	if(req.body['signed_request']){		
						
		var signedRequestData = require('fb-signed-parser').parse(req.body['signed_request'], '8e069c16293dc82877377d50aeb182a2');
		
		if(pageData.__fbAllowAccess && !pageData.__fbUID){
			if(signedRequestData['user_id'])pageData.__fbUID = signedRequestData['user_id'];
		}
		
		
	}
	
	
	var sendResponse = function(){
				
		if(redirectToPageCalled)return;
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		
		var fs = require('fs');
		fs.exists('views/caches/'+namespaceObj.pid+'/'+renderPageId+'.html', function(exists) {
			if (exists) {
    
				if(pageConfig.type == 'like-gate'){
				
					
					if(req.body['signed_request']){		
												
						if(signedRequestData['page']){
							
							//TAB
															
							res.render('../views/caches/'+namespaceObj.pid+'/'+renderPageId+'.html',{like_url_to_trace: signedRequestData['page']['id'], app_data: signedRequestData['app_data'], 'in_tab': true, 'is_prelike_page': true, app_id: '381112031899990', app_url: '//apps.facebook.com/promotioncms', vars: pageConfig.variables|| {}}, function(err, html){ err ? next() && console.log(err) : res.end(html)});
							
						}else{
							
							//CANVAS
							
							res.render('../views/caches/'+namespaceObj.pid+'/'+renderPageId+'.html',{like_url_to_trace: pageData['facebook'] && pageData['facebook']['fan-gate-url'] && pageData['facebook']['fan-gate-url']['facebook-canvas'] ? pageData['facebook']['fan-gate-url']['facebook-canvas'] : '', 'in_canvas': true, 'is_prelike_page': true, app_id: '381112031899990', app_url: '//apps.facebook.com/promotioncms', vars: pageConfig.variables|| {}}, function(err, html){ err ? next() && console.log(err) : res.end(html)}, function(err, html){ err ? next() && console.log(err) : res.end(html)});
							
						}
					}else{
						
						var mobile_detect = require('mobile-detect');
												
						md = new mobile_detect(req.headers['user-agent']);
						
						var mdIsMobile = md.mobile();
						
						if(mdIsMobile){
							//MOBILE
						
							res.render('../views/caches/'+namespaceObj.pid+'/'+renderPageId+'.html',{like_url_to_trace: pageData['facebook'] && pageData['facebook']['fan-gate-url'] && pageData['facebook']['fan-gate-url']['mobile'] ? pageData['facebook']['fan-gate-url']['mobile'] : '', 'is_prelike_page': true, app_id: '381112031899990', app_url: '//apps.facebook.com/promotioncms', vars: pageConfig.variables|| {}}, function(err, html){ err ? next() && console.log(err) : res.end(html)});
							
						}else{
						
							//MICROSITE	
							res.render('../views/caches/'+namespaceObj.pid+'/'+renderPageId+'.html',{like_url_to_trace: pageData['facebook'] && pageData['facebook']['fan-gate-url'] && pageData['facebook']['fan-gate-url']['microsite'] ? pageData['facebook']['fan-gate-url']['microsite'] : '', 'is_prelike_page': true, app_id: '381112031899990', app_url: '//apps.facebook.com/promotioncms', vars: pageConfig.variables|| {}}, function(err, html){ err ? next() && console.log(err) : res.end(html)});
							
						}
						
					}
						
				}else{
								
					res.render('../views/caches/'+namespaceObj.pid+'/'+renderPageId+'.html',{ vars: pageConfig.variables|| {}}, function(err, html){ err ? next() && console.log(err) : res.end(html)});	
				}
			}else next();
		})
		
	}
	
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
	
	
	if(!hasRegForm){
		
		sendResponse();
		return;
		
	}
			
	var userIdentifiers = [];
	var householdIdentifiers = [];
	
	for(panelId in pageConfig.data){
										
		if(pageConfig.data[panelId]['bypass-user-ineligible'] == 1 && pageConfig.data[panelId]['bypass-user-ineligible-identifier'].indexOf('session') !== -1){
				
			if(typeof req.session[namespaceObj.pid] != 'undefined' && typeof req.session[namespaceObj.pid]['reg-form-ineligible'] == 'object'){
				
				for(s in req.session[namespaceObj.pid]['reg-form-ineligible']){
					
					if(req.session[namespaceObj.pid]['reg-form-ineligible'][s]['pageId'] == renderPageId && req.session[namespaceObj.pid]['reg-form-ineligible'][s]['panelId'] == panelId){
				
						redirectToPage('not-eligible', pageData, req, res, next, namespaceObj);
						
					}
					
				}
				
				
			}
			
		}
		
		if(pageConfig.data[panelId]['bypass-user-entry-limit'] == 1 && pageConfig.data[panelId]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
			
			if(typeof req.session[namespaceObj.pid] != 'undefined' && typeof req.session[namespaceObj.pid]['reg-form-already-entered'] == 'object'){
								
				for(s in req.session[namespaceObj.pid]['reg-form-already-entered']){
				
					if(req.session[namespaceObj.pid]['reg-form-already-entered'][s]['pageId'] == renderPageId && req.session[namespaceObj.pid]['reg-form-already-entered'][s]['panelId'] == panelId){
				
						redirectToPage('already-entered', pageData, req, res, next, namespaceObj);
						
					}
					
					
				}
				
			}
			
		}
		
	
		if(pageConfig.data[panelId]['check-entry-limit-with-person']){
			
			userIdentifiers.push(pageConfig.data[panelId]['check-entry-limit-with-person']);
			
		}
		
		if(pageConfig.data[panelId]['check-entry-limit-with-household']){
			
			householdIdentifiers.push(pageConfig.data[panelId]['check-entry-limit-with-household']);
		}

	
	}
		
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
		
		/** BEGIN PER PERSON/HOUSEHOLD ENTRY LIMIT CHECK **/
				
		var userUids = [];
		
		if(typeof entryLimit == 'object' && pageData.__fbAllowAccess && pageData.__fbUID){
								
			var pointerObj = [];
			
			pointerObj.push('pointer:fbuid:'+pageData.__fbUID);
			
			db.getRowWithColumns('consumer-data', namespaceObj.pid+':pointers:reg-form', pointerObj, {}, function(err,data) {
	
				if(err){
					
					console.log(err);	
		
				}
												
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
		
					if(userIdentifierRecords['fbuid'] && userUids.indexOf(userIdentifierRecords['fbuid']) === -1){
						userUids.push(userIdentifierRecords['fbuid']);
					}
					
					userUidsPerPerson.push(userIdentifierRecords['fbuid']);
					
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
															
															for(var p=0;p< pageConfig['hasFormElementArray'].length;p++){
															
																if(pageConfig.data[pageConfig['hasFormElementArray'][p]]['bypass-user-entry-limit'] == 1){
									
																	if(pageConfig.data[pageConfig['hasFormElementArray'][p]]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
																		
																		setAlreadyEnteredSession = true;
																		
																	}
																	
																}
																
															}
															redirectToPage('already-entered', pageData, req, res, next, namespaceObj);
														}
														
														if(parseInt(entryLimit[uuid]['limit-number']) - entryCountWithinPeriod === 1){
															
															for(var p=0;p< pageConfig['hasFormElementArray'].length;p++){
															
																if(pageConfig.data[pageConfig['hasFormElementArray'][p]]['bypass-user-entry-limit'] == 1){
									
																	if(pageConfig.data[pageConfig['hasFormElementArray'][p]]['bypass-user-entry-limit-identifier'].indexOf('session') !== -1){
																		
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
									
									for(var p=0;p< pageConfig['hasFormElementArray'].length;p++){
	
										if(pageConfig.data[pageConfig['hasFormElementArray'][p]]['bypass-user-completed-form'] == 1){
										
											
											for(var c=0;c<userCompleteForms.length;c++){
											
												if(userCompleteForms[c]['pageId'] == renderPageId && userCompleteForms[c]['panelId'] == pageConfig['hasFormElementArray'][p]){	
												
													if(pageConfig.data[pageConfig['hasFormElementArray'][p]]['submit-action'] == 'save-and-submit'){
														
														
													}else{

														sendResponse(userUids, pageConfig.data[pageConfig['hasFormElementArray'][p]]['submit-next-page'], pageConfig['hasFormElementArray'][p]);
														return;
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
						
					}
					
				}
			})
		}
						
		
		/** END PER PERSON ENTRY LIMIT CHECK **/
		
		/** BEGIN OVERALL PROMOTION ENTRY LIMIT CHECK **/
				
		var userUidsChecked = [];
		
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
				
		if(typeof entryLimit == 'object'){
							
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
			
			checkedTotalEntriesCompleteAction();
					
		
			/** END OVERALL PROMOTION ENTRY LIMIT CHECK **/
			
		}
				
	})

	
	
	
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
