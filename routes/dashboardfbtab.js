var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;

var ownAppIds = ['381112031899990'];



exports.removePageTab = function(req, res) {
	
	var run = function(req,res){
		
		if(!req.body.id){
			
			res.json(200, {error: 'No page selected.'});
			return;
		
		}
		
		if(!req.body.tab_id){
			
			res.json(200, {error: 'No tab selected.'});
			return;
		
		}
		
		if(!req.body.accessToken){
			
			res.json(200, {error: 'You do not have access to this page. If you\'re the admin of this page, try unlinking and linking the page again.'});
			return;
		
		}
				
		var FB = require('fb');
		FB.setAccessToken(req.body.accessToken);
		
		FB.api(req.body.id+'/tabs/app_'+req.body.tab_id, 'delete', function (fbData) {
			if(fbData != true) {
				res.json(200, {error: 'You do not have access to this page. If you\'re the admin of this page, try unlinking and linking the page again.'});
				return;
			}
			
			res.json({error:'', id: req.body.pid});

		})
	
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.cancelAddPageTab = function(req, res){
	
	var run = function(req,res){
		
		if(!req.body.uuid){
			
			res.json(200, {error: 'No tab selected.'});
			return;
		
		}
		
		var fs = require('fs');
		
		fs.readFile(__dirname+'/writable/cron.json', {flag: 'a+'}, function (err, data) {
			if (err){
				res.send(400);
				console.log(err);
				return;
			}
			try{
				var data = require('jsonfn').JSONfn.parse(data);
			}catch(Error){
				 var data = {};
			}
			
			
			if(data[req.body.uuid] && data[req.body.uuid].pid && data[req.body.uuid].pid == req.body.pid){
				delete data[req.body.uuid];
			}else{
			
				res.json(200, {error: 'Unable to cancel task.'});
				return;
				
			}
						
			var writeData = require('jsonfn').JSONfn.stringify(data); 
			
			fs.writeFile(__dirname+'/writable/cron.json', writeData, function (err) {
				if (err){
					res.send(400);
					console.log(err);
					return;
				}
						  
				delete require.cache[require.resolve('./writable/cron.json')];
			   
				var msg = require('jsonfn').JSONfn.stringify({
					func: new Function("console.log(cronprocess.timeoutObj); cronprocess.timeoutObj['"+req.body.uuid+"'].clear(); console.log(cronprocess.timeoutObj);")
			   });
					
				process.send(msg);
				  
				res.json({error:'', id: req.body.pid});
			  
			})
		})
				
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);
	
}


exports.checkAddTab = function(req, res){
	
	var run = function(req,res){
		
		if(!req.query.pageId){
			
			res.json(200, {error: 'No page selected.'});
			return;
		
		}
			
		var fs = require('fs');
								
		fs.readFile(__dirname+'/writable/cron.json', {flag: 'a+'}, function (err, data) {
			if (err){
				res.send(400);
				console.log(err);
				return;
			}
			try{
				var data = require('jsonfn').JSONfn.parse(data);
			}catch(Error){
				 var data = {};
			}
						
			for(var uuid in data){
			
				if(data[uuid].pid == req.query.pid && req.query.pageId == data[uuid].pageId && data[uuid].schedule > new Date().getTime()){
				
					res.json(200, {uuid: uuid, schedule: data[uuid].schedule});
					return;
					
				}
				
			}
			res.json(200, {});
			
		})
										
				
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);
	
}

exports.addPageTab = function(req, res) {
	
	var run = function(req,res){
		
		if(!req.body.id){
			
			res.json(200, {error: 'No page selected.'});
			return;
		
		}
		
		if(!req.body.accessToken){
			
			res.json(200, {error: 'You do not have access to this page. If you\'re the admin of this page, try unlinking and linking the page again.'});
			return;
		
		}
		
		var appId = ownAppIds[0];
		
		var FB = require('fb');
		FB.setAccessToken(req.body.accessToken);
		
		FB.api(req.body.id+'/tabs', { app_id: appId }, function (fbData) {
			if(!fbData || !fbData.data) {
				console.log(!fbData ? 'FB Error Occurred' : fbData);
				res.json(200, {error: 'You do not have access to this page. If you\'re the admin of this page, try unlinking and linking the page again.'});
				return;
			}
			
			for(i in fbData.data){
			
				if(fbData.data[i].id && fbData.data[i].id.split('/tabs/app_')[1] == appId){
				
					var pageAlreadyAdded = true;
					break;	
					
				}
				
			}
						
			
			var fs = require('fs');
			
			fs.readFile(__dirname+'/writable/config.routes.facebook.json', function (err, data) {
				if (err) throw err;
				var data = JSON.parse(data);
									
				var appNamespaces = data;
				
				if(typeof appNamespaces[req.body.id] == 'object'){
													
					if(pageAlreadyAdded && appNamespaces[req.body.id].pid != req.body.pid || !appNamespaces[req.body.id].pid){
						res.json(200, {error:'A PromoCMS tab already exists on this fan page under another promotion. There is currently a limit of one PromoCMS tab per Facebook fan page at the same time.'});
						return;
					}
						
				}
		
				if(typeof appNamespaces[req.body.id] == 'undefined')appNamespaces[req.body.id] = {};
				appNamespaces[req.body.id].pid = req.body.pid;
				appNamespaces[req.body.id]['app_id'] = appId;
				appNamespaces[req.body.id]['image_url'] = req.body.fieldTabIcon;
				appNamespaces[req.body.id]['custom_name'] = req.body.fieldTabName;
				appNamespaces[req.body.id]['position'] = req.body.fieldTabPosition;
				appNamespaces[req.body.id]['is_non_connection_landing_tab'] = req.body.fieldMakeLandingTab;
				
									
				var writeData = JSON.stringify(appNamespaces);
				
				fs.writeFile(__dirname+'/writable/config.routes.facebook.json', writeData, function (err) {
					if (err) throw err;
					delete require.cache[require.resolve('./writable/config.routes.facebook.json')];
					var promoObj = [];
					promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:'+req.body.id+':app_id', value: appId}));
					promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:'+req.body.id+':image_url', value: req.body.fieldTabIcon}));
					promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:'+req.body.id+':custom_name', value: req.body.fieldTabName}));
					promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:'+req.body.id+':position', value: req.body.fieldTabPosition}));
					promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:'+req.body.id+':is_non_connection_landing_tab', value: req.body.fieldMakeLandingTab}));
							 
					db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
													 
						if(!err){
							
							var scheduleForlater = function(){
									
								var updateObj = {};
								if(typeof req.body.fieldTabIcon != 'undefined' && req.body.fieldTabIcon != '')updateObj['custom_image_url'] = req.body.fieldTabIcon;
								if(typeof req.body.fieldTabName != 'undefined' && req.body.fieldTabName != '')updateObj['custom_name'] = req.body.fieldTabName;
								if(typeof req.body.fieldTabPosition != 'undefined' && req.body.fieldTabPosition != '')updateObj['position'] = parseInt(req.body.fieldTabPosition);
								if(typeof req.body.fieldMakeLandingTab != 'undefined' && req.body.fieldMakeLandingTab != '' && (req.body.fieldMakeLandingTab === "true"))updateObj['is_non_connection_landing_tab'] = true;
								return {endpoint: req.body.id+'/tabs/app_'+appId, updateObj: updateObj};	
								
							}
							
							var removeTab = function(cb){
								
								console.log('Removing test tab');
								
								FB.api(req.body.id+'/tabs/app_'+appId, 'delete', function (fbData) {
																		
									if(fbData != true) {
										console.log(fbData);
										console.log('Failed Removing test tab');
										res.json(200, {error: 'WARNING: Tab was added to the fan page as a trial run before the scheduled time but we were unable to remove it after the test was ran. Please remove the tab manually from your page. '});
										return;
									}else{ 
										if(typeof cb == 'function')cb();
										console.log('Test tab removed'); 
									}
								})
								
							}
							
							var postTabToFB = function(testRun, testRunCallback){
								
								FB.api(req.body.id+'/tabs', 'post', { app_id: appId }, function (fbData) {
									if(fbData != true) {
										console.log(fbData);
										res.json(200, {error: 'You do not have access to add tab to this page. If you\'re the admin of this page, try unlinking and linking the page again.'});
										return;
									}
									
									var updateObj = {};
									if(typeof req.body.fieldTabIcon != 'undefined' && req.body.fieldTabIcon != '')updateObj['custom_image_url'] = req.body.fieldTabIcon;
									if(typeof req.body.fieldTabName != 'undefined' && req.body.fieldTabName != '')updateObj['custom_name'] = req.body.fieldTabName;
									if(typeof req.body.fieldTabPosition != 'undefined' && req.body.fieldTabPosition != '')updateObj['position'] = parseInt(req.body.fieldTabPosition);
									if(typeof req.body.fieldMakeLandingTab != 'undefined' && req.body.fieldMakeLandingTab != '' && (req.body.fieldMakeLandingTab === "true"))updateObj['is_non_connection_landing_tab'] = true;
	
									FB.api(req.body.id+'/tabs/app_'+appId, 'post', updateObj, function (fbData) {
										
										var cb = function(){
											if(fbData != true) {
												console.log(fbData);
												if(testRun){
													res.json(200, {error: 'Some of the settings provided are invalid. If you\'re adding a tab icon, make sure its dimensions are 111px by 74px.'});
												}else{
													
													res.json(200, {error: 'Page tab has been added, but we\'re unable to update the tab with some or all of the settings provided. If you\'re adding a tab icon, make sure its dimensions are 111px by 74px. If you\'re the admin of the page, you may go to your fan page and update it manually. '});
													
												}
												return;
											}
											
											if(testRun){
												testRunCallback();
												return;
											}
											
											
											res.json({error:'', id: req.body.pid});
											return;
											
										}
										
										if(testRun)removeTab(cb);
											else cb();
										
									})
									
								})
							}
							
							
							if(req.body.scheduleAddTime && !isNaN(new Date(parseInt(req.body.scheduleAddTime)).getTime())){
								
								console.log('Add tab scheduled at '+new Date(parseInt(req.body.scheduleAddTime)));
								
								/*var cronJob = require('cron').CronJob;
								var job = new cronJob(new Date(parseInt(req.body.scheduleAddTime)), function(){
									
									console.log('Task Running');
									postTabToFB();
								
								}, function () {
									
									console.log('Tab sent to FB.');
								
								},true);
								*/
																
								postTabToFB(true, function(){
									
									var jobId = require('node-uuid').v4();
									var fs = require('fs');
								
									fs.readFile(__dirname+'/writable/cron.json', {flag: 'a+'}, function (err, data) {
										if (err){
											res.send(400);
											console.log(err);
											return;
										}
										try{
											var data = require('jsonfn').JSONfn.parse(data);
										}catch(Error){
											 var data = {};
										}
										
										
										if(typeof data[jobId] == 'undefined')data[jobId] = {};
										
										var obj = scheduleForlater();
										
										var func = "console.log('FB Tab Job Running'); var FB = require('fb'); FB.setAccessToken('"+req.body.accessToken+"'); FB.api('"+req.body.id+"/tabs', 'post', { app_id: '"+appId+"' }, function (fbData) { if(fbData != true) { console.log(fbData); console.log('Failed adding tab to FB');}else{ console.log('Successfully Added tab to FB'); }; console.log('Updating tab to FB');  FB.api('"+obj.endpoint+"', 'post', "+JSON.stringify(obj.updateObj)+", function(fbData){ if(fbData != true){ console.log('Failed pushing updates on tab to FB'); console.log(fbData); }else{ console.log('Successfully Updated tab to FB'); }})});";
										
										data[jobId]['job'] = new Function(func);
										
										data[jobId]['schedule'] = new Date(parseInt(req.body.scheduleAddTime)).getTime();
																													
										data[jobId]['pid'] = req.body.pid;
										
										data[jobId]['pageId'] = req.body.id;
										
										data[jobId]['appId'] = appId;
										
										data[jobId]['_scheduleString'] = new Date(parseInt(req.body.scheduleAddTime)).toString();
																													
										var msg = require('jsonfn').JSONfn.stringify({
											func: new Function("cronprocess.queueJobs();")									
										});
																						
										var writeData = require('jsonfn').JSONfn.stringify(data); 
										
										/*
										
										JSON.stringify(data, function(key, val) {
											if (typeof val === 'function') {
												return val + ''; 
											}
											return val;
										});
										*/
										
																			
										fs.writeFile(__dirname+'/writable/cron.json', writeData, function (err) {
										  if (err){
											  res.send(400);
											  console.log(err);
											  return;
										  }
													  
										   delete require.cache[require.resolve('./writable/cron.json')];
										  
										   res.json({error:'', id: req.body.pid, scheduled: true});
										   process.send(msg);

										})
									})
									
								})
																
																
							}else{
							
								postTabToFB();											
							
							}
							
						}else{
							
							res.writeHead(500);
							res.end(); 
							return;
						}
					});		
					
				});
			
			});
			  
		  })
	
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};

		


exports.unlinkFanPage = function(req, res) {
	
	var run = function(req,res){
		
		if(!req.body.value){
				
			res.json(400, {error: 'No page selected.'});
			return;
			
		}
		
		var promoObj = [];
		
		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:linkedPage:'+req.body.value, isDelete: true}));
					 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
			  res.json({error:'', id: req.body.pid});
			  return;
				
			}else{
				
				res.writeHead(500);
				res.end(); 
				return;
			}
		});		
				  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};

exports.linkFanPage = function(req, res) {
	
	var run = function(req,res){
		
		if(!req.body.value || typeof req.body.value != 'object' || req.body.value.length < 1){
				
			res.json(400, {error: 'No page selected.'});
			return;
			
		}
		
		var promoObj = [];
		
		for(i in req.body.value){
			
			if(!req.body.value[i].id || !req.body.value[i].access_token){
				
				res.json(400, {error: 'id and access_token required for this request.'});	
				return;			
			}
		
			promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:linkedPage:'+req.body.value[i].id, value: req.body.value[i].access_token}));
					 
		}
				 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
			  res.json({error:'', id: req.body.pid});
			  return;
				
			}else{
				
				res.writeHead(500);
				res.end(); 
				return;
			}
		});		
				  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};

exports.exchangeAccessToken = function(req, res) {
	
	var run = function(req,res){
		
		if(!req.body.fb_exchange_token || !req.body.redirect_uri){
			
				
			res.json(400, {error: 'fb_exchange_token and redirect_uri required for this request.'});
			return;
			
		}
		
		var request = require('request');
		
		request({method: 'POST', uri: 'https://graph.facebook.com/oauth/access_token', form:{client_id : '381112031899990', client_secret:'8e069c16293dc82877377d50aeb182a2', grant_type : 'fb_exchange_token', fb_exchange_token : req.body.fb_exchange_token, redirect_uri: req.body.redirect_uri}}, function (error, response, body) {
			
			if(body.error){
				res.json(400, {error: body.error.message});
				return;
			}
		  
		  
			if (!error && !body.error && response.statusCode == 200) {
							
				var newToken = body.split('&')[0].replace('access_token=','');	
							
				var promoObj = [
					new HBaseTypes.Mutation({ column: 'fb-tab:accessToken', value: newToken})
				 ];
				 
				db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
												 
					if(!err){
												  
					  res.json({error:'', id: req.body.pid, accessToken: newToken});
					  return;
						
					}else{
						
						res.writeHead(500);
						res.end(); 
						return;
					}
				});
			
			}
		  
		})
						
				  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.containsAlcohol = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
						
		if(req.body.status == 0){
			promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:targetAudience:containsAlcohol', value: '0' }));

		}else if(req.body.status == 1){
			promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:targetAudience:containsAlcohol', value: '1' }));
		}
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');
				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
							if(typeof data['facebook']['target-audience'] == 'undefined')data['facebook']['target-audience'] = {};
							data['facebook']['target-audience']['contains-alcohol'] = req.body.status;
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
							  
							   res.json({error:'', id: req.body.pid});
							  
							})
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.enableCanvasPage = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
						
		if(req.body.status == 0){
			promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:enableCanvasPage', value: '0' }));

		}else if(req.body.status == 1){
			promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:enableCanvasPage', value: '1' }));
		}
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');
				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
							data['facebook']['enable-canvas-page'] = req.body.status;
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
							  
							   res.json({error:'', id: req.body.pid});
							  
							})
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.updateCanvasRedirectURLDestination = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
		
			
		if(!req.body.value || !req.body.value.trim()){
		
			res.json(400, {error: 'value required for this request.'});
			return;	
			
		}
			
		if(!req.body.uuid || !req.body.uuid.trim()){
		
			res.json(400, {error: 'uuid required for this request.'});
			return;	
			
		}
		
		
		var uuid = req.body.uuid.trim();
		
		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:customCanvasRedirectURL:'+uuid+':destination', value: req.body.value.trim() }));		
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');

				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							
							
							var fbPageNamespaceObj = req.body.value.replace(/^http(s)?:\/\//, '').split('/');
				
							var fbPageNamespace = fbPageNamespaceObj[1];
							
							if(fbPageNamespace == 'pages'){
								
								fbPageNamespace = fbPageNamespaceObj[3].split('?')[0];
								
							}
							
							
							var updateCache = function(){
							
								if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
								if(typeof data['facebook']['custom-canvas-redirect-url'] == 'undefined')data['facebook']['custom-canvas-redirect-url'] = {};
								if(typeof data['facebook']['custom-canvas-redirect-url'][uuid] == 'undefined')data['facebook']['custom-canvas-redirect-url'][uuid] = {};
								
								data['facebook']['custom-canvas-redirect-url'][uuid]['destination'] = fbPageNamespace;
								var writeData = JSON.stringify(data);
								
								fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
								  if (err){
									  res.send(400);
									  console.log(err);
									  return;
								  }
											  
								   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
								  
								   res.json({error:'', id: req.body.pid});
								  
								})	
								
							}
							
							if(!/^[0-9]+/.test(fbPageNamespace)){
							
								var FB = require('fb');
								
								FB.api(fbPageNamespace, function (fbData) {
									if(fbData && fbData.id) {
										
										fbPageNamespace = fbData.id;
										
									}
									
									updateCache();
															
								})
								
							}else{
							
								updateCache();
								
							}
							
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.updateCanvasRedirectURLNamespace = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
		
			
		if(!req.body.value || !req.body.value.trim()){
		
			res.json(400, {error: 'value required for this request.'});
			return;	
			
		}
			
		if(!req.body.uuid || !req.body.uuid.trim()){
		
			res.json(400, {error: 'uuid required for this request.'});
			return;	
			
		}
		
		var uuid = req.body.uuid.trim();
		
		
		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:customCanvasRedirectURL:'+uuid+':namespace', value: req.body.value.trim() }));		
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');

				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							
							
							
							
							var updateCache = function(){
							
								if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
								if(typeof data['facebook']['custom-canvas-redirect-url'] == 'undefined')data['facebook']['custom-canvas-redirect-url'] = {};
								if(typeof data['facebook']['custom-canvas-redirect-url'][uuid] == 'undefined')data['facebook']['custom-canvas-redirect-url'][uuid] = {};
								
								data['facebook']['custom-canvas-redirect-url'][uuid]['namespace'] = req.body.value.toLowerCase().trim()
								var writeData = JSON.stringify(data);
								
								fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
								  if (err){
									  res.send(400);
									  console.log(err);
									  return;
								  }
											  
								   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
								  
								   res.json({error:'', id: req.body.pid});
								  
								})	
								
							}
							
							updateCache();
							
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};

exports.addCanvasRedirectURL = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
		
		var uuid = require('node-uuid').v4();
		
		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:customCanvasRedirectURL:'+uuid+':namespace', value: '' }));
		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:customCanvasRedirectURL:'+uuid+':destination', value: '' }));
		
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');

				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
													
							var updateCache = function(){
							
								if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
								if(typeof data['facebook']['custom-canvas-redirect-url'] == 'undefined')data['facebook']['custom-canvas-redirect-url'] = {};
								
								data['facebook']['custom-canvas-redirect-url'][uuid] = {namespace: '', destination: ''};								
							
								var writeData = JSON.stringify(data);
								
								fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
								  if (err){
									  res.send(400);
									  console.log(err);
									  return;
								  }
											  
								   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
								  
								   res.json({error:'', id: req.body.pid, uuid: uuid});
								  
								})	
								
							}
							
							updateCache();
								
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};



exports.removeCanvasURL = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
		
		if(!req.body.uuid || !req.body.uuid.trim()){
		
			res.json(400, {error: 'uuid required for this request.'});
			return;	
			
		}
		
		var uuid = req.body.uuid.trim();
		
		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:customCanvasRedirectURL:'+uuid+':namespace', isDelete: true }));
		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:customCanvasRedirectURL:'+uuid+':destination', isDelete: true }));
		
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');

				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
													
							var updateCache = function(){
							
								if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
								if(typeof data['facebook']['custom-canvas-redirect-url'] == 'undefined')data['facebook']['custom-canvas-redirect-url'] = {};
								
								if(typeof data['facebook']['custom-canvas-redirect-url'][uuid] != 'undefined'){
									delete data['facebook']['custom-canvas-redirect-url'][uuid];
								}
									
								var writeData = JSON.stringify(data);
								
								fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
								  if (err){
									  res.send(400);
									  console.log(err);
									  return;
								  }
											  
								   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
								  
								   res.json({error:'', id: req.body.pid, uuid: uuid});
								  
								})	
								
							}
							
							updateCache();
								
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};



exports.canvasRedirectURL = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
		
		if(!req.body.value){
		
			res.json(400, {error: 'value required for this request.'});
			return;	
			
		}
		
		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:canvasRedirectURL', value: req.body.value }));

		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');

				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							
							
							var fbPageNamespaceObj = req.body.value.replace(/^http(s)?:\/\//, '').split('/');
				
							var fbPageNamespace = fbPageNamespaceObj[1];
							
							if(fbPageNamespace == 'pages'){
								
								fbPageNamespace = fbPageNamespaceObj[3].split('?')[0];
								
							}
							
							var updateCache = function(){
							
								if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
								data['facebook']['canvas-redirect-url'] = fbPageNamespace;
							
								var writeData = JSON.stringify(data);
								
								fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
								  if (err){
									  res.send(400);
									  console.log(err);
									  return;
								  }
											  
								   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
								  
								   res.json({error:'', id: req.body.pid});
								  
								})	
								
							}
							
							if(!/^[0-9]+/.test(fbPageNamespace)){
							
								var FB = require('fb');
								
								FB.api(fbPageNamespace, function (fbData) {
									if(fbData && fbData.id) {
										
										fbPageNamespace = fbData.id;
										
									}
									
									updateCache();
															
								})
								
							}else{
							
								updateCache();
								
							}
							
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};



exports.fanGateURL = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
		
		if(!req.body.type){
		
			res.json(400, {error: 'type required for this request.'});
			return;	
			
		}
		
		var allowedTypes = ['microsite', 'mobile', 'facebook-page-tab', 'facebook-canvas'];
		
		if(allowedTypes.indexOf(req.body.type) === -1){
			
			res.json(400, {error: 'Parameter `type` not valid for this type of request.'});
			return;	
			
		}

		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:likeGateURL:'+req.body.type, value: req.body.value }));

		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');

				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							
							
							var fbPageNamespaceObj = req.body.value.replace(/^http(s)?:\/\//, '').split('/');
				
							var fbPageNamespace = fbPageNamespaceObj[1];
							
							if(fbPageNamespace == 'pages'){
								
								fbPageNamespace = fbPageNamespaceObj[3].split('?')[0];
								
							}
							
							var updateCache = function(){
							
								if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
								if(typeof data['facebook']['fan-gate-url'] == 'undefined')data['facebook']['fan-gate-url'] = {};
								data['facebook']['fan-gate-url'][req.body.type] = fbPageNamespace;
							
								var writeData = JSON.stringify(data);
								
								fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
								  if (err){
									  res.send(400);
									  console.log(err);
									  return;
								  }
											  
								   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
								  
								   res.json({error:'', id: req.body.pid});
								  
								})	
								
							}
							
							if(!/^[0-9]+/.test(fbPageNamespace)){
							
								var FB = require('fb');
								
								FB.api(fbPageNamespace, function (fbData) {
									if(fbData && fbData.id) {
										
										fbPageNamespace = fbData.id;
										
									}
									
									updateCache();
															
								})
								
							}else{
							
								updateCache();
								
							}
							
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};




exports.fanGate = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
		
		if(!req.body.type){
		
			res.json(400, {error: 'type required for this request.'});
			return;	
			
		}
		
		var allowedTypes = ['microsite', 'mobile', 'facebook-page-tab', 'facebook-canvas'];
		
		if(allowedTypes.indexOf(req.body.type) === -1){
			
			res.json(400, {error: 'Parameter `type` not valid for this type of request.'});
			return;	
			
		}

		if(req.body.status == 0){
			promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:likeGate:'+req.body.type, value: '0' }));

		}else if(req.body.status == 1){
			promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:likeGate:'+req.body.type, value: '1' }));
			
			if(req.body.type != 'facebook-page-tab'){
				promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:allowAccess:'+req.body.type, value: '1' }));
			}
		}
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');

				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
							if(typeof data['facebook']['fan-gate'] == 'undefined')data['facebook']['fan-gate'] = {};
							data['facebook']['fan-gate'][req.body.type] = req.body.status;
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
							  
							   res.json({error:'', id: req.body.pid});
							  
							})
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.collectDemographicData = function(req, res) {
	
	var run = function(req, res){	
	
		if(!req.body.type){
		
			res.json(400, {error: 'type required for this request.'});
			return;	
			
		}
		
		var allowedTypes = ['microsite', 'mobile', 'facebook-page-tab', 'facebook-canvas'];
		
		if(allowedTypes.indexOf(req.body.type) === -1){
			
			res.json(400, {error: 'Parameter `type` not valid for this type of request.'});
			return;	
			
		} 
			  
		if(req.body.value){
					
			var promoObj = [
				new HBaseTypes.Mutation({ column: 'fb-tab:targetAudience:collectDemographicData:'+req.body.type, value:  req.body.value.join(',') }),
			 ];
			 
		}else{
			
			var promoObj = [
				new HBaseTypes.Mutation({ column: 'fb-tab:targetAudience:collectDemographicData:'+req.body.type, isDelete: true }),
			 ];
			
		}
		 
		 
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');
				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
							if(typeof data['facebook']['collect-demographic-data'] == 'undefined')data['facebook']['collect-demographic-data'] = {};
							data['facebook']['collect-demographic-data'][req.body.type] = req.body.value;
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							  	delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
							  
								res.json({error:'', pid: req.body.pid});
							  
							})
						})
					}
				})
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};



exports.countryRestrictions = function(req, res) {
	
	var run = function(req, res){	 
			  
		if(req.body.value){
			var countries = [
							"US","United States",
							"CN","Canada",
							"AS","American Samoa",
							"GU","Guam",
							"MH","Marshall Islands",
							"FM","Micronesia, Federated States",
							"MP","Northern Mariana Islands",
							"PW","Palau",
							"PR","Puerto Rico",
							"VI","U.S. Virgin Islands",
							"AF","Afghanistan",
							"AX","Åland Islands",
							"AL","Albania",
							"DZ","Algeria",
							"AD","Andorra",
							"AO","Angola",
							"AI","Anguilla",
							"AQ","Antarctica",
							"AG","Antigua and Barbuda",
							"AR","Argentina",
							"AM","Armenia",
							"AW","Aruba",
							"AU","Australia",
							"AT","Austria",
							"AZ","Azerbaijan",
							"BS","Bahamas",
							"BH","Bahrain",
							"BD","Bangladesh",
							"BB","Barbados",
							"BY","Belarus",
							"BE","Belgium",
							"BZ","Belize",
							"BJ","Benin",
							"BM","Bermuda",
							"BT","Bhutan",
							"BO","Bolivia",
							"BA","Bosnia and Herzegovina",
							"BW","Botswana",
							"BV","Bouvet Island",
							"BR","Brazil",
							"IO","British Indian Ocean Territory",
							"BN","Brunei Darussalam",
							"BG","Bulgaria",
							"BF","Burkina Faso",
							"BI","Burundi",
							"KH","Cambodia",
							"CM","Cameroon",
							"CV","Cape Verde",
							"KY","Cayman Islands",
							"CF","Central African Republic",
							"TD","Chad",
							"CL","Chile",
							"CN","China",
							"CX","Christmas Island",
							"CC","Cocos (Keeling) Islands",
							"CO","Colombia",
							"KM","Comoros",
							"CG","Congo",
							"CD","Congo, The Democratic Republic of The",
							"CK","Cook Islands",
							"CR","Costa Rica",
							"CI","Cote D'ivoire",
							"HR","Croatia",
							"CU","Cuba",
							"CY","Cyprus",
							"CZ","Czech Republic",
							"DK","Denmark",
							"DJ","Djibouti",
							"DM","Dominica",
							"DO","Dominican Republic",
							"EC","Ecuador",
							"EG","Egypt",
							"SV","El Salvador",
							"GQ","Equatorial Guinea",
							"ER","Eritrea",
							"EE","Estonia",
							"ET","Ethiopia",
							"FK","Falkland Islands (Malvinas)",
							"FO","Faroe Islands",
							"FJ","Fiji",
							"FI","Finland",
							"FR","France",
							"GF","French Guiana",
							"PF","French Polynesia",
							"TF","French Southern Territories",
							"GA","Gabon",
							"GM","Gambia",
							"GE","Georgia",
							"DE","Germany",
							"GH","Ghana",
							"GI","Gibraltar",
							"GR","Greece",
							"GL","Greenland",
							"GD","Grenada",
							"GP","Guadeloupe",
							"GT","Guatemala",
							"GG","Guernsey",
							"GN","Guinea",
							"GW","Guinea-bissau",
							"GY","Guyana",
							"HT","Haiti",
							"HM","Heard Island and Mcdonald Islands",
							"VA","Holy See (Vatican City State)",
							"HN","Honduras",
							"HK","Hong Kong",
							"HU","Hungary",
							"IS","Iceland",
							"IN","India",
							"ID","Indonesia",
							"IR","Iran, Islamic Republic of",
							"IQ","Iraq",
							"IE","Ireland",
							"IM","Isle of Man",
							"IL","Israel",
							"IT","Italy",
							"JM","Jamaica",
							"JP","Japan",
							"JE","Jersey",
							"JO","Jordan",
							"KZ","Kazakhstan",
							"KE","Kenya",
							"KI","Kiribati",
							"KP","Korea, Democratic People's Republic of",
							"KR","Korea, Republic of",
							"KW","Kuwait",
							"KG","Kyrgyzstan",
							"LA","Lao People's Democratic Republic",
							"LV","Latvia",
							"LB","Lebanon",
							"LS","Lesotho",
							"LR","Liberia",
							"LY","Libyan Arab Jamahiriya",
							"LI","Liechtenstein",
							"LT","Lithuania",
							"LU","Luxembourg",
							"MO","Macao",
							"MK","Macedonia, The Former Yugoslav Republic of",
							"MG","Madagascar",
							"MW","Malawi",
							"MY","Malaysia",
							"MV","Maldives",
							"ML","Mali",
							"MT","Malta",
							"MH","Marshall Islands",
							"MQ","Martinique",
							"MR","Mauritania",
							"MU","Mauritius",
							"YT","Mayotte",
							"MX","Mexico",
							"FM","Micronesia, Federated States of",
							"MD","Moldova, Republic of",
							"MC","Monaco",
							"MN","Mongolia",
							"ME","Montenegro",
							"MS","Montserrat",
							"MA","Morocco",
							"MZ","Mozambique",
							"MM","Myanmar",
							"NA","Namibia",
							"NR","Nauru",
							"NP","Nepal",
							"NL","Netherlands",
							"AN","Netherlands Antilles",
							"NC","New Caledonia",
							"NZ","New Zealand",
							"NI","Nicaragua",
							"NE","Niger",
							"NG","Nigeria",
							"NU","Niue",
							"NF","Norfolk Island",
							"NO","Norway",
							"OM","Oman",
							"PK","Pakistan",
							"PW","Palau",
							"PS","Palestinian Territory, Occupied",
							"PA","Panama",
							"PG","Papua New Guinea",
							"PY","Paraguay",
							"PE","Peru",
							"PH","Philippines",
							"PN","Pitcairn",
							"PL","Poland",
							"PT","Portugal",
							"QA","Qatar",
							"RE","Reunion",
							"RO","Romania",
							"RU","Russian Federation",
							"RW","Rwanda",
							"SH","Saint Helena",
							"KN","Saint Kitts and Nevis",
							"LC","Saint Lucia",
							"PM","Saint Pierre and Miquelon",
							"VC","Saint Vincent and The Grenadines",
							"WS","Samoa",
							"SM","San Marino",
							"ST","Sao Tome and Principe",
							"SA","Saudi Arabia",
							"SN","Senegal",
							"RS","Serbia",
							"SC","Seychelles",
							"SL","Sierra Leone",
							"SG","Singapore",
							"SK","Slovakia",
							"SI","Slovenia",
							"SB","Solomon Islands",
							"SO","Somalia",
							"ZA","South Africa",
							"GS","South Georgia and The South Sandwich Islands",
							"ES","Spain",
							"LK","Sri Lanka",
							"SD","Sudan",
							"SR","Suriname",
							"SJ","Svalbard and Jan Mayen",
							"SZ","Swaziland",
							"SE","Sweden",
							"CH","Switzerland",
							"SY","Syrian Arab Republic",
							"TW","Taiwan, Province of China",
							"TJ","Tajikistan",
							"TZ","Tanzania, United Republic of",
							"TH","Thailand",
							"TL","Timor-leste",
							"TG","Togo",
							"TK","Tokelau",
							"TO","Tonga",
							"TT","Trinidad and Tobago",
							"TN","Tunisia",
							"TR","Turkey",
							"TM","Turkmenistan",
							"TC","Turks and Caicos Islands",
							"TV","Tuvalu",
							"UG","Uganda",
							"UA","Ukraine",
							"AE","United Arab Emirates",
							"GB","United Kingdom",
							"UY","Uruguay",
							"UZ","Uzbekistan",
							"VU","Vanuatu",
							"VE","Venezuela",
							"VN","Viet Nam",
							"VG","Virgin Islands, British",
							"WF","Wallis and Futuna",
							"EH","Western Sahara",
							"YE","Yemen",
							"ZM","Zambia",
							"ZW","Zimbabwe"
							];	
		
		
			for(var i=0; i < req.body.value.length ; i++){			
				
				if(!/^[A-Z]{2}$/.test(req.body.value[i])){
				
					res.json(200, {error:''+req.body.value[i]+' is not valid.', field: 'countryRestrictions'});
					return;
				
				}
				
				if(countries.indexOf(req.body.value[i]) === -1){
				
					res.json(200, {error:'Country '+req.body.value[i]+' is not valid.', field: 'countryRestrictions'});
					return;
				
				}
				
			}
		
		
			var promoObj = [
				new HBaseTypes.Mutation({ column: 'fb-tab:targetAudience:countryRestrictions', value:  req.body.value.join(',') }),
			 ];
			 
		}else{
			
			var promoObj = [
				new HBaseTypes.Mutation({ column: 'fb-tab:targetAudience:countryRestrictions', isDelete: true }),
			 ];
			
		}
		 
		 
		
		 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
			if(err){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
	
				
			}
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');
				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
							if(typeof data['facebook']['target-audience'] == 'undefined')data['facebook']['target-audience'] = {};
							data['facebook']['target-audience']['country-restrictions'] = req.body.value;
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							  	delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
							  
			  					res.json({error:'', pid: req.body.pid});
							  
							})
						})
					}
				})
				
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.allowAccess = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
		
		if(!req.body.type){
		
			res.json(400, {error: 'type required for this request.'});
			return;	
			
		}
		
		var allowedTypes = ['microsite', 'mobile', 'facebook-page-tab', 'facebook-canvas'];
		
		if(allowedTypes.indexOf(req.body.type) === -1){
			
			res.json(400, {error: 'Parameter `type` not valid for this type of request.'});
			return;	
			
		}

		if(req.body.status == 0){
			promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:allowAccess:'+req.body.type, value: '0' }));
		
			if(req.body.type != 'facebook-page-tab'){
				promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:likeGate:'+req.body.type, value: '0' }));
			}

		}else if(req.body.status == 1){
			promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:allowAccess:'+req.body.type, value: '1' }));
		}
		
		
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');
				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
							if(typeof data['facebook']['allow-access'] == 'undefined')data['facebook']['allow-access'] = {};
							data['facebook']['allow-access'][req.body.type] = req.body.status;
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							  	delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
							  
							  	res.json({error:'', id: req.body.pid});
							  
							})
						})
					}
				})
				
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};


exports.ageRestrictions = function(req, res) {
	
	var run = function(req,res){
		
		var promoObj = [];
		
		if(!req.body.value){
		
			res.json(400, {error: 'value required for this request.'});
			return;	
			
		}
		
		var allowedTypes = ['13+', '17+', '18+', '19+', '21+'];
		
		if(allowedTypes.indexOf(req.body.value) === -1){
			
			res.json(400, {error: 'Parameter `value` not valid for this type of request.'});
			return;	
			
		}
	
		promoObj.push(new HBaseTypes.Mutation({ column: 'fb-tab:targetAudience:ageRestrictions', value: req.body.value }));
		 
		db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
										 
			if(!err){
										  
				var mkdirp = require('mkdirp');
				mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
					
					if (err){
						console.error(err);
						res.send(500);
						return;
						
					}else{
						var fs = require('fs');
						fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
							if (err){
								res.send(400);
								console.log(err);
								return;
							}
							try{
								var data = JSON.parse(data);
							}catch(Error){
								 var data = {};
							}
							if(typeof data['facebook'] == 'undefined')data['facebook'] = {};
							if(typeof data['facebook']['target-audience'] == 'undefined')data['facebook']['target-audience'] = {};
							data['facebook']['target-audience']['age-restriction'] = req.body.value;
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							  	delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
							  
			 					res.json({error:'', id: req.body.pid});
							  
							})
						})
					}
				})
				
			}else{
				
				res.writeHead(500);
				res.end(); 
			}
		});
							
						  
	}
	 	
	dashboard.checkRequiredRoles([2], run, req, res);

};



exports.getInfo = function(req, res) {
	
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['fb-tab:', 'promotype:', 'basic:'], {}, function(err,data) {
								
			
			if (err || data.length == 0){
				res.writeHead(500);
				res.end(); 
				return;
			}					
								
			var response = {};
						 												  
			if( typeof data[0].columns['fb-tab:accessToken'] !='undefined')response.accessToken = data[0].columns['fb-tab:accessToken'].value;

			response.likeGate = [];
			response.likeGateURL = {};
			response.allowAccess = [];
			response.targetAudience = {};
			response.linkedPage = [];
			response.type = [];
			response.customDomainWarning = false;
			response.targetAudience.collectDemographicData = {};
			response.customCanvasRedirectURL = {};
			
			for(i in data[0].columns){
						
				if(/^fb\-tab:likeGate:/.test(i)){
				
					if(data[0].columns[i].value == 1){
						
						response.likeGate.push(i.replace(/^fb\-tab:likeGate:/, ''));
					}
					
				}	
				
				if(/^fb\-tab:likeGateURL:/.test(i)){
										
					response.likeGateURL[i.replace(/^fb\-tab:likeGateURL:/, '')] = data[0].columns[i].value;
					
				}	
				
				if(/^fb\-tab:allowAccess:/.test(i)){
					
					if(data[0].columns[i].value == 1){
						
						response.allowAccess.push(i.replace(/^fb\-tab:allowAccess:/, ''));
					}
					
				}	
				
				if(/^fb\-tab:targetAudience:ageRestrictions/.test(i)){
						
					response.targetAudience.ageRestrictions = data[0].columns[i].value;
											
				}	
				
				if(/^fb\-tab:targetAudience:containsAlcohol/.test(i)){
					
					if(data[0].columns[i].value == 1){
						
						response.targetAudience.containsAlcohol = 1;
						
					}
					
				}
								
				if('fb-tab:enableCanvasPage' == i){
					
					if(data[0].columns[i].value == 1){
						
						response.enableCanvasPage = 1;
						
					}
					
				}
				
				if('fb-tab:canvasRedirectURL' == i){
											
					response.canvasRedirectURL = data[0].columns[i].value;
											
				}
				
				if(/^fb\-tab:customCanvasRedirectURL:/.test(i)){

					var keyObj = i.replace(/^fb\-tab:customCanvasRedirectURL:/, '').split(':');
					
					if(typeof response.customCanvasRedirectURL[keyObj[0]] == 'undefined')response.customCanvasRedirectURL[keyObj[0]] = {};
					
					response.customCanvasRedirectURL[keyObj[0]][keyObj[1]] = data[0].columns[i].value;

				}
				
				
				if(/^fb\-tab:targetAudience:countryRestrictions/.test(i)){
					
					response.targetAudience.countryRestrictions = data[0].columns[i].value;

				}
				
				
				if(/^fb\-tab:targetAudience:collectDemographicData/.test(i)){
					
					response.targetAudience.collectDemographicData[i.replace(/^fb\-tab:targetAudience:collectDemographicData:/, '')] = data[0].columns[i].value;

				}
				
				if(/^fb\-tab:linkedPage:/.test(i)){
					
					response.linkedPage.push({id: i.replace(/^fb\-tab:linkedPage:/,''), access_token: data[0].columns[i].value});

				}
				
				if(/^promotype:type:/.test(i)){
				
					if(data[0].columns[i].value == 1){
						response.type.push(i.replace(/^promotype:type:/, ''));
					}
					
				}	
				
				if(/^basic:url:/.test(i) && /:domain\-type$/.test(i)){
					
					if(data[0].columns[i].value == 'custom'){
					
						response.customDomainWarning=true;
						
					}
					
				}	
				
				
			}
			
			response.ownAppIds = ownAppIds;
					
				
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};