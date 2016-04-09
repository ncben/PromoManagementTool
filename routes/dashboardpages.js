var db =  require('../db').db;
var HBaseTypes =  require('../db').HBaseTypes;


exports.publishPage = function(req, res) {
				
	var run = function(req, res){	
				
		if(!req.body.pageItemId || !req.body.pageItemId.trim()){
		
			if(res)res.send(400);
			return;
			
		}else{
			
			var pageItemId  = req.body.pageItemId.trim();
			
		}
		
		var publishFunc = function(){
					
			req.body.type = 'generateHTML';
			
			var mkdirp = require('mkdirp');
	
			mkdirp(require('path').resolve('views/caches/'+req.body.pid), function (err) {
				
				if (err){
					console.error(err);
					if(res)res.send(500);
					return;
					
				}else{
					
					var cb = function( req, res, response, panelInfo, config, pageItemId, panels, hasFormElement){
						
						var fs = require('fs');
						var ejs = require('ejs');
						
						fs.readFile(require('path').resolve('views/templates/'+req.userGroup+'/'+response.template+'/'+response['template-page']+'.html'), function(err, file){
							
							if (err){
								console.log(err);	
								if(res)res.send(500);
								return;
							}												
							
							var compiled = ejs.compile(file.toString(), {filename: require('path').resolve('views/templates/'+req.userGroup+'/'+response.template+'/'+response['template-page']+'.html'), compileDebug: false, debug: false});
						
							var html = compiled({
								 showPanelNumber : false,
								 panels: panelInfo,
								 templateName: config.templateName,
								 pageName: config.pagesInfo[response['template-page']].name
							});
							
							html = html.replace(/<\$\$/g, '<%').replace(/\$\$>/g, '%>');
									
							fs.writeFile(require('path').resolve('views/caches/'+req.body.pid+'/'+pageItemId+'.html'), html, {flag: 'w+'}, function (err) {
								if (err){
									
									if(res)res.send(500);
									console.log(err);  
									  
								}
								
								var configObj = {};
								
								configObj.type = response.type;
								configObj.name = response.name;
								
								configObj.data = panels;
								configObj.hasFormElement = typeof hasFormElement == 'object' && hasFormElement.length>0 ? true : false;
								configObj.hasFormElementArray =  typeof hasFormElement == 'object'? hasFormElement: [];
															
								configObj.variables = response.configurables || {};
									
								configObj = JSON.stringify(configObj);
							  
								fs.writeFile(require('path').resolve('views/caches/'+req.body.pid+'/'+pageItemId+'.config.json'), configObj, {flag: 'w+'}, function (err) {
									if (err){
										
										if(res)res.send(500);
										console.log(err);  
										  
									}
								  
									var promoObj = [];
									 
																
									promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':last-published', value: new Date().toString() }));
																
									 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
									
										if(err){
											
											console.log(err);
											if(res)res.writeHead(500);
											if(res)res.end(); 
											return;
								
											
										}
																	 
										if(!err){
																	  
										  if(res)res.json({error:'', pid: req.body.pid, pageItemId : pageItemId});
											
										}
									});
										
								})
							  
							})
								
							
						});
	
						
					}
					
					templates.previewFullPage(req, res, cb);
					
				}
			})
			
		}
		
		if(!req.body.scheduleAddTime){
			publishFunc();
		}else{
			
			if(parseInt(req.body.scheduleAddTime) - new Date().getTime() < 30000){
			
				res.send(200, {error: 'Scheduled time has passed.'});
				return;
				
			}
			
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
								
				var func = "console.log('Publish Page Running'); var dashboardpages = require('"+require("path").resolve(__dirname+'/dashboardpages')+"'); dashboardpages.publishPage({bypassAuth: true, userGroup: '"+req.userGroup+"', body: {pid: '"+req.body.pid+"', pageItemId: '"+req.body.pageItemId+"'}, query: {}}, false, true);";
				
				data[jobId]['job'] = new Function(func);
				
				data[jobId]['schedule'] = new Date(parseInt(req.body.scheduleAddTime)).getTime();
																							
				data[jobId]['pid'] = req.body.pid;
				
				data[jobId]['pageItemId'] = req.body.pageItemId;
								
				data[jobId]['_scheduleString'] = new Date(parseInt(req.body.scheduleAddTime)).toString();
																							
				var msg = require('jsonfn').JSONfn.stringify({
					func: new Function("cronprocess.queueJobs();")									
				});
																				
				var writeData = require('jsonfn').JSONfn.stringify(data); 
				
								
				fs.writeFile(__dirname+'/writable/cron.json', writeData, function (err) {
					if (err){
						res.send(400);
						console.log(err);
						return;
					}
							  
					delete require.cache[require.resolve('./writable/cron.json')];
					
					process.send(msg);
					
					var promoObj = [];
																
					promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':scheduled-publish', value: req.body.scheduleAddTime }));
												
					 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
					
						if(err){
							
							console.log(err);
							if(res)res.writeHead(500);
							if(res)res.end(); 
							return;
				
							
						}
													 
						if(!err){
													  
						  if(res)res.json({error:'', id: req.body.pid, scheduled: true});
	
						}
					});	
				})
			})	
		}
				  
	}
    
    if(req.bypassAuth){
		run(req, res);
	}else{
		dashboard.checkRequiredRoles([2], run, req, res);
	}
	 	
};


exports.unpublishPage = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.pageItemId || !req.body.pageItemId.trim()){
		
			res.send(400);
			return;
			
		}else{
			
			var pageItemId  = req.body.pageItemId.trim();
			
		}
				
		var fs = require('fs');
		fs.unlink(require('path').resolve('views/caches/'+req.body.pid+'/'+pageItemId+'.html'), function (err) {
			if (err){
				
				res.send(500);
				console.log(err);  
				  
			}
		  
			var promoObj = [];
			 
										
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':last-published', isDelete: true }));
										
			 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
			
				if(err){
					
					console.log(err);
					res.writeHead(500);
					res.end(); 
					return;
		
					
				}
											 
				if(!err){
											  
				  res.json({error:'', pid: req.body.pid, pageItemId : pageItemId});
					
				}
			});
				
		})
			
		
				  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.uploadImage = function(req, res){
		
	var run = function(req, res){
		
		var pid = req.query['pid'];
		var multiparty = require('multiparty');
		var form = new multiparty.Form();
		
		form.parse(req, function(err, fields, files) {
			
			if(typeof files != 'object'){
				
				res.json(200, {error: 'You did not upload a file.'});
				return;
				
			}
						
			if(typeof fields != 'object' || typeof fields['PHP_UPLOAD_FIELD'] != 'object' || !fields['PHP_UPLOAD_FIELD'][0]){
				
				res.json(200, {error: 'You did not upload a file.'});
				return;
				
			}
			
			if(files[fields['PHP_UPLOAD_FIELD'][0]].length > 1){
			
				res.json(200, {error: 'Please upload one file at a time.'});
				return;
				
			}
			
			if(typeof files[fields['PHP_UPLOAD_FIELD'][0]] != 'object' || files[fields['PHP_UPLOAD_FIELD'][0]].length < 1 || !files[fields['PHP_UPLOAD_FIELD'][0]][0].path){
				
				res.json(200, {error: 'You did not upload a file.'});
				return;
				
			}
			
			if(files[fields['PHP_UPLOAD_FIELD'][0]][0].size > 1048576){
			
				res.json(200, {error: 'Your image file size cannot exceed 1MB.'});
				return;
			}
			
			var mime = require('mime');
			var mimeType = mime.lookup(files[fields['PHP_UPLOAD_FIELD'][0]][0].path);
			var allowedMimeTypes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif'];
						
			if(allowedMimeTypes.indexOf(mimeType) === -1){
			
				res.json(200, {error: 'Please upload a jpg, jpeg, png or gif image.'});
				return;
				
			}
			
			
			var path = require('path');
			var ext = path.extname(files[fields['PHP_UPLOAD_FIELD'][0]][0].path||'');
			var uuid = require('node-uuid').v4();
		
			var fs = require('fs');
			
			var rackspace = require('pkgcloud').storage.createClient({
				provider: 'rackspace',
				username: 'jpetrillidja',
				apiKey: 'b459afa489e149539043d72f73b656c9',
				region: 'DFW'
			});
						
			
			
			rackspace.getContainer('PromoCMS/'+pid, function(err, container) {
				
				var pushFile = function(){
					
					var myFile = fs.createReadStream(files[fields['PHP_UPLOAD_FIELD'][0]][0].path);
					myFile.pipe(rackspace.upload({
						container: 'PromoCMS/'+pid,
						remote: uuid+ext
						}, function(err, uploaded, streamObj) {
							
							if(err)console.log(err);
																		
							if(uploaded){
																										
								res.json(200, {filename: 'https://c8e4837710701ff3763e-7e9e4af2c5313ee17d7196f45a211afd.ssl.cf1.rackcdn.com/'+pid+'/'+uuid+ext});

							}else{
								
								res.json(200, {error: 'Upload service is current unavailable.'});
								return;
									
							}
		
						})
					);
				}
				
				if(!container){
				
					rackspace.createContainer({
						name: pid,
						metadata: {
							origin: 'PromoCMS'
						}}, function(err, container) {
							
							if(err)console.log(err);
							pushFile();
						
						})	
					
				}else pushFile();
				
			});

		});	
		
	}

	dashboard.checkRequiredRoles([2], run, req, res);	
}


exports.updatePageItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.pageItemId || !req.body.pageItemId.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
			
		}else{
			
			var pageItemId  = req.body.pageItemId.trim();
			
		}	
		
		var headerSent = false
		
		var saveData = function(promoObj){
		
			 db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
		
				if(err){
					
					console.log(err);
					res.writeHead(500);
					res.end(); 
					return;
		
					
				}
											 
				if(!err){
					
					if(headerSent)return;
					headerSent=true;		  
					if(!req.headerSent)res.json({error:'', pid: req.body.pid, update: req.body.update, newValue: req.body.value, pageItemId : pageItemId});
					
				}
			});	
			
		}
		
	
		
		var promoObj = [
		 ];
		promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':last-updated', value: new Date().toString() }));
		 
		if(req.body.update == 'template'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':template', value: req.body.value }));
			saveData(promoObj);
			
		}else if(req.body.update == 'type'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':type', value: req.body.value }));
			saveData(promoObj);

		}else if(req.body.update == 'template-page'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':template-page', value: req.body.value }));
			saveData(promoObj);
			
		}else if(req.body.update == 'desc'){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':name', value: req.body['name'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':desc', value: req.body['desc'] }));
			saveData(promoObj);
			
		}else if(req.body.update == 'page-data'){
			
			if(!req.body.value || typeof req.body.value != 'object' || !req.body.value.panel || !req.body.value.panel.trim()){
		
				res.writeHead(400);
				res.end(); 
				return;
				
				
			}else{
				var panelId = req.body.value['panel'].trim();
			}
		
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':template-page', value: req.body.value['page'] }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':template', value: req.body.value['template'] }));
			
			var pagesApplyTo = [];
			
			pagesApplyTo.push(pageItemId);
			
			if(req.body.value['applyTo'] && typeof req.body.value['applyTo'] == 'object'){
		
				for(var i=0;i<req.body.value['applyTo'].length;i++){
				
					pagesApplyTo.push(req.body.value['applyTo'][i]);
					
				}
				
			}
			
			db.getRowWithColumns('promobuilder', 'promo:'+req.body.pid, ["pages:"], {}, function(err,data) {
			
				if (err){
					console.log(err);
					res.writeHead(500);
					res.end(); 
					return;
				}		
			
				for(page in pagesApplyTo){
													 														
					if(typeof req.body.value['checkEntryLimitWith'] == 'object'){
						
						var checkEntryLimitWithPerson = [];
						
						if(typeof req.body.value['checkEntryLimitWith']['person'] == 'object'){
							for(var i=0;i<req.body.value['checkEntryLimitWith']['person'].length;i++){
								
								if(typeof req.body.value['checkEntryLimitWith']['person'][i] == 'object'){
									
									var checkEntryLimitWithPersonEachField = [];
									
									for(var x=0;x<req.body.value['checkEntryLimitWith']['person'][i].length; x++){
										checkEntryLimitWithPersonEachField.push(req.body.value['checkEntryLimitWith']['person'][i][x].id);
									}
									
									checkEntryLimitWithPersonEachField = checkEntryLimitWithPersonEachField.join(',');
									checkEntryLimitWithPerson.push(checkEntryLimitWithPersonEachField);
								}
								
							}
						}
							
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-entry-limit-with-person', value: checkEntryLimitWithPerson.join('|') }));
						
													
						var checkEntryLimitWithHousehold = [];
						
						if(typeof req.body.value['checkEntryLimitWith']['household'] == 'object'){
							for(var i=0;i<req.body.value['checkEntryLimitWith']['household'].length;i++){
								
								if(typeof req.body.value['checkEntryLimitWith']['household'][i] == 'object'){
									
									var checkEntryLimitWithHouseholdEachField = [];
									
									for(var x=0;x<req.body.value['checkEntryLimitWith']['household'][i].length; x++){
										checkEntryLimitWithHouseholdEachField.push(req.body.value['checkEntryLimitWith']['household'][i][x].id);
									}
									checkEntryLimitWithHouseholdEachField = checkEntryLimitWithHouseholdEachField.join(',');
									checkEntryLimitWithHousehold.push(checkEntryLimitWithHouseholdEachField);
									
								}
								
							}
						}
							
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-entry-limit-with-household', value: checkEntryLimitWithHousehold.join('|') }));
						
					}else{
						
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-entry-limit-with-person', isDelete: true }));

						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-entry-limit-with-household', isDelete: true }));

						
					}
					
					if(typeof req.body.value['checkEligibilityWith'] == 'object'){
											
						var checkEligibilityWithDOB = [];
						
						if(typeof req.body.value['checkEligibilityWith']['dob'] == 'object'){
							for(var i=0;i<req.body.value['checkEligibilityWith']['dob'].length;i++){
								
								checkEligibilityWithDOB.push(req.body.value['checkEligibilityWith']['dob'][i].id);
								
							}
							
						}
						
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-eligibility-with-dob', value: checkEligibilityWithDOB.join(',') }));

						
						
						var checkEligibilityWithState = [];
						
						if(typeof req.body.value['checkEligibilityWith']['state'] == 'object'){
							for(var i=0;i<req.body.value['checkEligibilityWith']['state'].length;i++){
								
								checkEligibilityWithState.push(req.body.value['checkEligibilityWith']['state'][i].id);
								
							}
							
						}
						
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-eligibility-with-state', value: checkEligibilityWithState.join(',') }));
						
						
						var checkEligibilityWithCountry = [];
						
						if(typeof req.body.value['checkEligibilityWith']['country'] == 'object'){
							for(var i=0;i<req.body.value['checkEligibilityWith']['country'].length;i++){
								
								checkEligibilityWithCountry.push(req.body.value['checkEligibilityWith']['country'][i].id);
								
							}

						}
						
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-eligibility-with-country', value: checkEligibilityWithCountry.join(',') }));

						
		
					}else{
					
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-eligibility-with-dob', isDelete: true }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-eligibility-with-state', isDelete: true }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':check-eligibility-with-country', isDelete: true }));
	
						
						
					}
					
					if(typeof req.body.value['whenSubmitIsClicked'] == 'object'){
						
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':submit-action', value: req.body.value['whenSubmitIsClicked']['submit-action'] }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':submit-next-page', value: req.body.value['whenSubmitIsClicked']['submit-next-page'] }));
		
					}else{
					
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':submit-action', isDelete: true }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':submit-next-page', isDelete: true }));
						
					}
					
					if(typeof req.body.value['bypassThisPageIf'] == 'object'){
						
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-completed-form', value: req.body.value['bypassThisPageIf']['bypass-user-completed-form'] }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-ineligible', value: req.body.value['bypassThisPageIf']['bypass-user-ineligible'] }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-ineligible-identifier', value: req.body.value['bypassThisPageIf']['bypass-user-ineligible-identifier'] }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-entry-limit', value: req.body.value['bypassThisPageIf']['bypass-user-entry-limit'] }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-entry-limit-identifier', value: req.body.value['bypassThisPageIf']['bypass-user-entry-limit-identifier'] }));
		
					}else{
						
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-completed-form', isDelete: true }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-ineligible', isDelete: true  }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-ineligible-identifier', isDelete: true  }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-entry-limit', isDelete: true  }));
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':bypass-user-entry-limit-identifier', isDelete: true  }));
						
					}
					
					if(typeof req.body.value['saveDataFromPanel'] != 'undefined'){
						
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':save-data-from', value: req.body.value['saveDataFromPanel'] }));
					
					}else{
						
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':save-data-from',  isDelete: true }));
						
					}
					
					
					
					if(typeof req.body.value['data'] == 'object'){
						
						for(var i=0;i<req.body.value['data'].length;i++){
							
							if(typeof req.body.value['data'][i] == 'object'){
								
								for(key in req.body.value['data'][i]){
								
									if(typeof req.body.value['data'][i][key] != 'object'){
										
										promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':'+i+':'+key, value: req.body.value['data'][i][key]}));
										
									}else{
										
										promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':'+panelId+':'+i+':'+key, value: req.body.value['data'][i][key].join(',')}));
		
										
									}
									
								}
								
							}
							
						}
					}
					
					var promoObjColumns = [];
					
					for(var i=0; i<promoObj.length; i++){
						
						promoObjColumns.push(promoObj[i].column);
						
					}
					
					if(typeof data == 'object' && data.length > 0 && typeof data[0] == 'object'){
						
						for(key in data[0].columns){
																											
							var pageId = key.replace('pages:','').split(":")[0];
							
							if(pageId == pagesApplyTo[page]){
								
								var panel = key.replace('pages:'+pageItemId+':','').split(":")[0];
								
								if(panel != '' && panel == panelId){
											
									if(promoObjColumns.indexOf(key) === -1){
										promoObj.push(new HBaseTypes.Mutation({ column: key, isDelete: true }));
									}
								}
							}
														
						}
						
					}
					
					promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pagesApplyTo[page]+':last-updated', value: new Date().toString() }));
															
					saveData(promoObj);
					
				}
			})


			
		}else{
			
			res.writeHead(400);
			res.end(); 
			return;
				
			
		}
		 	  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.createPageItem = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.pageItemId || !req.body.pageItemId.trim()){
		
			var uuid = require('node-uuid');
			var pageItemId  = uuid.v4();
			
		}else{
			
			var pageItemId  = req.body.pageItemId.trim();
			
		}
		
		var pageType  = typeof req.body.type != 'undefined' &&  req.body.type != '' ? req.body.type.trim() : 'custom';
		var template  = typeof req.body.template != 'undefined' &&  req.body.template != '' ? req.body.template.trim() : 'default';
		var templatePage  = typeof req.body['template-page'] != 'undefined' &&  req.body['template-page'] != '' ? req.body['template-page'].trim() : 'standard';
		var promoObj = [
		 ];
		 
		promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':last-updated', value: new Date().toString() }));
		
		if(!req.body.pageItemId || !req.body.pageItemId.trim()){
			
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':template', value: template }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':type', value: pageType }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':template-page', value: templatePage }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':name', value: req.body.name }));
			promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':desc', value: req.body.desc }));

			
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
							if(typeof data['routes'] == 'undefined')data['routes'] = {};
														
							if(pageType != 'custom'){
								if(typeof data['routes'][pageType] == 'undefined')data['routes'][pageType] = {};
								data['routes'][pageType].pageItemId = pageItemId;
							}
						
							var writeData = JSON.stringify(data);
							
							fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
							  if (err){
								  res.send(400);
								  console.log(err);
								  return;
							  }
										  
							   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
							  
							   db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
								
									if(err){
										
										console.log(err);
										res.writeHead(500);
										res.end(); 
										return;
							
										
									}
																 
									if(!err){
																  
									  res.json({error:'', pid: req.body.pid, pageItemId : pageItemId});
										
									}
								});
											
							  
							})
						})
					}
				})
			
			}
		});
					  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.updateConfigurableURL = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.pageItemId || !req.body.pageItemId.trim()){
		
			res.send(400);
			return;
			
		}else{
			
			var pageItemId  = req.body.pageItemId.trim();
			
		}
		
		if(!req.body.namespace || !req.body.namespace.trim()){
		
			res.json(200, {error: 'Namespace must be between 3 and 100 characters and must not contain any special characters.'});
			return;
			
		}else{
		
			req.body.namespace = req.body.namespace.trim().toLowerCase();	
			
		}
		
		if(!/^[a-zA-Z0-9\.\-_]{3,100}$/.test(req.body['namespace'])){
			
			res.json(200, {error: 'Namespace must be between 3 and 100 characters and must not contain any special characters.'});
			return;

		}
		
		if(!/^[a-zA-Z0-9]/.test(req.body['namespace']) || !/[a-zA-Z0-9]$/.test(req.body['namespace'])){
			
			res.json(200, {error: 'Namespace must begin and end with a letter or a number'});
			return;
			
		}
		
		var promoObj = [
		 ];
		 
			
		promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageItemId+':configurable-url', value: req.body.namespace }));
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
			
			var key = req.body.namespace.trim().toLowerCase();	
		
			if(typeof data['alias'] == 'undefined')data['alias'] = {};
			
			if(typeof data['alias'][key] == 'object' && data['alias'][key].pageItemId){
				
				if(data['alias'][key].pageItemId != pageItemId){
					
					res.json(200, {error: 'Namespace is already in use on another page under this promotion'});
					return;
					
				}
				
			}
			
			if(req.body['namespace_old'] && typeof data['alias'][req.body['namespace_old']] === 'object'){
				
				delete data['alias'][req.body['namespace_old']];
				delete data['alias'][pageItemId];
				
			}
			
			if(typeof data['alias'][key] == 'undefined')data['alias'][key] = {};
			if(typeof data['alias'][pageItemId] == 'undefined')data['alias'][pageItemId] = {};
			
			data['alias'][key].pageItemId = pageItemId;
			data['alias'][pageItemId].alias = key;
		
			var writeData = JSON.stringify(data);
			
			fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
			  if (err){
				  res.send(400);
				  console.log(err);
				  return;
			  }
			  			  
			   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
			  
			   db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
				
					if(err){
						
						console.log(err);
						res.writeHead(500);
						res.end(); 
						return;
			
						
					}
												 
					if(!err){
												  
					  res.json({error:'', pid: req.body.pid, pageItemId : pageItemId});
						
					}
				});
							
			  
			})
		})
			
		  
	  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.updateConfigurables = function(req, res) {
	
	var run = function(req, res){	 
		
		if(!req.body.pageItemId || !req.body.pageItemId.trim()){
		
			res.send(400);
			return;
			
		}else{
			
			var pageItemId  = req.body.pageItemId.trim();
			
		}
		
		if(!req.body.value){
		
			res.send(400);
			return;
			
		}
				
		var pageIds = [];
				
		var promoObj = [
		 ];
		
		var getPageIdsFromDB = function(){
			
			db.getRowWithColumns('promobuilder', 'promo:'+req.body.pid, ["pages:"], {}, function(err,data) {
				
				if (err){
					console.log(err);
					return;
				}	
				
				
				if(typeof data == 'object' && data.length > 0 && typeof data[0] == 'object'){
					
					for(key in data[0].columns){
																										
						var pageId = key.replace('pages:','').split(":")[0];
											
						if((pageId && req.body.applyToAllPages == 'true') || (pageId && pageId == pageItemId)){
							
							if(pageIds.indexOf(pageId) === -1)pageIds.push(pageId);		
														
						}
													
					}
					
				}
				
				createDataObj();
				saveData();
								
			})
			
		}
		
		var createDataObj = function(){
			
			for(var p in pageIds){
				
				var pageId = pageIds[p];
			
				for(key in req.body.value){
				
					if(key.trim()){		
						promoObj.push(new HBaseTypes.Mutation({ column: 'pages:'+pageId+':configurables:'+key, value: req.body.value[key] }));
					}
				}
			}
			

		}
	
		var saveData = function(){
			
			var pageIdsWritten = [];
			
			var fs = require('fs');
			
			var writeComplete = function(){
			
				db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, promoObj, {}, function(err,data) {
						
					if(err){
						
						console.log(err);
						
					}
												 
					if(!err){

						res.json({error:'', pid: req.body.pid, pageItemId : pageItemId});
					}
				});	
		
				
			}
			
			var writeToPageConfig = function(pageId){
				
				fs.readFile('views/caches/'+req.body.pid+'/'+pageId+'.config.json', {flag: 'a+'}, function (err, data) {
					if (err){
						console.log(err);
						return;
					}
					try{
						var data = JSON.parse(data);
					}catch(Error){
						 var data = {};
					}
							
					if(typeof data['variables'] == 'undefined')data['variables'] = {};
					
					for(key in req.body.value){
					
						if(key.trim()){
							data['variables'][key] = req.body.value[key];
						}
						
					}
				
					var writeData = JSON.stringify(data);
					
					fs.writeFile('views/caches/'+req.body.pid+'/'+pageId+'.config.json', writeData, function (err) {
					  if (err){
						  console.log(err);
						  return;
					  }
								  
					   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/'+pageId+'.config.json')];
					  
					   
						if(pageIdsWritten.indexOf(pageId) === -1)pageIdsWritten.push(pageId);
						if(pageIdsWritten.length < pageIds.length){
						
							for(var p in pageIds){
								if(pageIdsWritten.indexOf(pageIds[p]) === -1){
									writeToPageConfig(pageIds[p]);
									break;
								}
							}
							
						}else writeComplete();
					  
					})
					
				})
				
			}
			
						
			writeToPageConfig(pageIds[0]);
			
		}
		
		if(req.body.applyToAllPages == 'true'){
			
			if(typeof req.body.pagesToApplyTo == 'object' && req.body.pagesToApplyTo.length > 1){
				
				pageIds =  req.body.pagesToApplyTo;
				createDataObj();
				saveData();
				
			}else getPageIdsFromDB();
			
		}else{
		
			pageIds.push(pageItemId);
			createDataObj();
			saveData();
			
		}
		  
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};




exports.deletePageItem = function(req, res) {
	
	var run = function(req, res){	 
			 
		if(!req.body.id || !req.body.id.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
		}else{
		
			var pageItemId = req.body.id.trim();
			
		}
		 
		
		 var deleteObj = [];
		 
		 db.getRowWithColumns('promobuilder', 'promo:'+req.body.pid, ["pages:"], {}, function(err,data) {
			
			if (err){
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
			}	
			
	
			if(typeof data == 'object' && data.length > 0 && typeof data[0] == 'object'){
				
				for(key in data[0].columns){
																									
					var pageId = key.replace('pages:','').split(":")[0];
					
					if(pageId == pageItemId){
						
						deleteObj.push(new HBaseTypes.Mutation({ column: key, isDelete: true }));
							
					}
												
				}
				
			}
	
			db.mutateRowDeprecated('promobuilder', 'promo:'+req.body.pid, deleteObj, {}, function(err,data) {
					
				if(err){
					console.log(err);
					res.writeHead(500);
					res.end(); 
					return;
		
					
				}else{
					var fs = require('fs');
					fs.unlink(require('path').resolve('views/caches/'+req.body.pid+'/'+pageItemId+'.html'), function (err) {
						if (err){
							
							console.log(err);  
							  
						}
				
					})
					
					fs.unlink(require('path').resolve('views/caches/'+req.body.pid+'/'+pageItemId+'.config.json'), function (err) {
						if (err){
							
							console.log(err);  
							  
						}
				
					})
					
					fs.readFile('views/caches/'+req.body.pid+'/config.page.json', {flag: 'a+'}, function (err, data) {
						if (err){
							console.log(err);
						}
						try{
							var data = JSON.parse(data);
						}catch(Error){
							 var data = {};
						}
						if(typeof data['alias'] == 'undefined')data['alias'] = {};
						for(key in data['alias']){
							
							if(data['alias'][key] && data['alias'][key].pageItemId == pageItemId){
								
								delete data['alias'][key];
								delete data['alias'][pageItemId];
								
							}
							
							
						}
					
						var writeData = JSON.stringify(data);
						
						fs.writeFile('views/caches/'+req.body.pid+'/config.page.json', writeData, function (err) {
						  if (err){
							  console.log(err);
						  }
									  
						   delete require.cache[require.resolve('../views/caches/'+req.body.pid+'/config.page.json')];
						  	
						})
					})
					
					res.json({error:'', pid: req.body.pid, pageItemId: req.body.id.trim()});
											  
				}
			});
					
			
		 })
		 
		
	}
  
	dashboard.checkRequiredRoles([2], run, req, res);
	 	
};


exports.getTemplateDetails = function(req, res){
	
	var run = function(req,res){
		
		var fs = require('fs');
				  
		if(!req.query.templateId || !/^[0-9a-zA-Z_\-]+$/.test(req.query.templateId.trim())){
		
			res.json(400, {error:'Template not found.'});
			return;
			
		}	
				
		var config = require(__dirname + '/../views/templates/'+req.userGroup+'/'+req.query.templateId+'/config.js');
											
		stats = fs.lstatSync(__dirname + '/../views/templates/'+req.userGroup+'/'+req.query.templateId);
								
		if (stats.isDirectory()) { 
			
			if(config.enabled !== true){
		
				res.json(400, {error: 'Template has been disabled.'});
				return;
			
			}
			
			config.id = req.query.templateId;
			
			res.send(config);
			return;
									
		}
					
	}
	dashboard.checkRequiredRoles([1], run, req, res);
	
}


exports.getTemplates = function(req, res){
	
	var run = function(req,res){
		
		var fs = require('fs');
		fs.readdir(__dirname + '/../views/templates/'+req.userGroup, function (err, files) {
			
			if (err) throw err;
			
			var results = [];
			
			files.forEach( function (file) {
				
				var config = require(__dirname + '/../views/templates/'+req.userGroup+'/'+file+'/config.js');
								
				stats = fs.lstatSync(__dirname + '/../views/templates/'+req.userGroup+'/'+file);
										
				if (stats.isDirectory()) { 
					
					if(config.enabled !== true){
				
						config.id = file;
						results.push(config);
					
					}
					
					
											
				}
					
		    });
						
			res.send(results);
			return;
		});
		
	}
	dashboard.checkRequiredRoles([1], run, req, res);
	
}




exports.getPanelInfo = function(req, res) {
	
	var run = function(req,res){
		
		
		if(!req.query.pageItemId || !req.query.pageItemId.trim()){
		
			res.writeHead(400);
			res.end(); 
			return;
			
			
		}else{
			
			var pageItemId  = req.query.pageItemId.trim();
			
		}	
		
		if(!req.query.panelId || !req.query.panelId.trim()){
	
			res.writeHead(400);
			res.end(); 
			return;
				
				
		}else{
			var panelId = req.query.panelId.trim();
		}
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ["pages:"], {}, function(err,data) {
								
			
			if (err || data.length == 0){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
			}					
								
			var response = {};
			response.data = [];			
			
			for(key in data[0].columns){
										
				if(/^pages:/.test(key)){
					
					var pageId = key.replace('pages:','').split(":")[0];
					
					if(pageId == pageItemId){
						
						var panel = key.replace('pages:'+pageItemId+':','').split(":")[0];
						
						if(panel != '' && panel == panelId){
									
							var column = key.replace('pages:'+pageItemId+':'+panelId+':','').split(":");
													
							if(column[0] != '' && /^[0-9]+$/.test(column[0])){
								
																																											
								if(typeof response.data[parseInt(column[0])] == 'undefined')response.data[parseInt(column[0])] = {};
	
								response.data[parseInt(column[0])][column[column.length-1]] = data[0].columns[key].value;
								
							}else{
							
								response[column[0]]	 = data[0].columns[key].value;
								
							}
							
						}
					}
					
				}	
				
			}
		
			response['data'].sort(function(a,b){
				rowA = parseInt(a.row);
				rowB = parseInt(b.row);
				colA = parseInt(a.col);
				colB = parseInt(b.col);
				sizeyA = parseInt(a.sizey);
				sizeyB = parseInt(b.sizey);
				
				 if(rowA > rowB)return 1;
					else if ( rowA < rowB )return -1;
					else if (colA > colB )return 1;
					else if ( colA < colB )return -1;
					else if (sizeyA > sizeyB)return -1;
					else if ( sizeyA < sizeyB )return 1;
					else return 0;
			})
			
											
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};

var requiredPagesInfo = function(){
	
	
		return {
		
			'like-gate' : {
				name: 'Like Gate',
				desc: 'Displays when "like" requirement is not met'
				},
			'thank-you' : {
				name: 'Registration Complete',
				desc: 'Commonly called the "thank you" page, it replaces the submission page after the entry is complete',
				},
			'registration-form' : {
				name: 'Registration Form',
				desc: 'Create the form on this page'
				},
			'not-eligible' : {
				name: 'Not Eligible',
				desc: 'Replaces the submission page when an ineligible age and/or location is detected'
				},
			'not-eligible-voting' : {
				name: 'Not Eligible for Voting',
				desc: 'Replaces the voting registration page when an ineligible age and/or location is detected'
				},
			'already-entered' : {
				name: 'Already Entered',
				desc: 'Replaces the submission page when entry limit is exceeded'
				},
			'promotion-limit-reached' : {
				name: 'Promotion Limit Reached',
				desc: 'Replaces the submission page when the total number of entries received from all users has reached the set limit'
				},
			'already-entered-voting' : {
				name: 'Already Entered',
				desc: 'Replaces the voting registration page when voting limit is exceeded'
				},
			'before-first-entry-period' : {
				name: 'Before First Entry Period',
				desc: 'Commonly called the "coming soon" page, it replaces the submission page prior to the start of the first entry period'
				},
			'between-entry-period' : {
				name: 'Between Entry Periods',
				desc: 'Commonly called the "interim" page, it replaces the submission page when there is a gap between each submission period'
				},
			'after-last-entry-period' : {
				name: 'After Last Entry Period',
				desc: 'Commonly called the "submission over" page, it replaces the submission page after the end of the last entry period'
				},
			'before-first-gallery-period' : {
				name: 'Before First Gallery Live Period',
				desc: 'Commonly called the "coming soon" page, it replaces the gallery prior to the start of the first gallery period'
				},
			'between-gallery-period' : {
				name: 'Between Gallery Live Periods',
				desc: 'Commonly called the "interim" page, it replaces the gallery when there is a gap between each gallery period'
				},
			'after-last-gallery-period' : {
				name: 'After Last Gallery Live Period',
				desc: 'Commonly called the "over" page, it replaces the gallery after the end of the last gallery period'
				},
			'before-first-voting-period' : {
				name: 'Before First Voting Period',
				desc: 'Commonly called the "coming soon" page, it replaces the voting registration page prior to the start of the first voting period'
				},
			'between-voting-period' : {
				name: 'Between Voting Periods',
				desc: 'Commonly called the "interim" page, it replaces the voting registration page when there is a gap between each voting period'
				},
			'after-last-voting-period' : {
				name: 'After Last Voting Period',
				desc: 'Commonly called the "over" page, it replaces the voting registration page after the end of the last voting period'
				}
		}
			
			
};

exports.getInfo = function(req, res) {
		
	var run = function(req,res){
		
	  db.getRowWithColumns('promobuilder', 'promo:'+req.query.pid, ['basic', 'fb-tab', 'promotype:','essaycontest','photocontest','videocontest','pages','gallery','regform'], {}, function(err,data) {
								
			
			if (err || data.length == 0){
				
				console.log(err);
				res.writeHead(500);
				res.end(); 
				return;
			}					
								
			var response = {};
						 												  
			if( typeof data[0].columns['basic:defaultTemplate'] !='undefined')response.defaultTemplate = data[0].columns['basic:defaultTemplate'].value;


			response.type = [];
			response.pages = {};
			response.defaultDomain = {};
			
			for(key in data[0].columns){
						
				if(/^promotype:type:/.test(key)){
				
					if(data[0].columns[key].value == 1){
						response.type.push(key.replace(/^promotype:type:/, ''));
					}
					
				}

				if(/^basic:url:/.test(key)){
										
					var column = key.replace('basic:url:','').split(":");
																									
					if(typeof response.defaultDomain[column[0]] == 'undefined')response.defaultDomain[column[0]] = {};
				
					response.defaultDomain[column[0]][column[column.length-1]] = data[0].columns[key].value;
					
				}	
				
				if(/^pages:/.test(key)){
									
					var column = key.replace('pages:','').split(":");
																									
					if(typeof response.pages[column[0]] == 'undefined')response.pages[column[0]] = {};
				
					if(column[2]){
						if(typeof response.pages[column[0]][column[column.length-2]] == 'undefined')response.pages[column[0]][column[column.length-2]] = {};
						response.pages[column[0]][column[column.length-2]][column[column.length-1]] = data[0].columns[key].value;
					}else{
						response.pages[column[0]][column[column.length-1]] = data[0].columns[key].value;
					}
					
				}	
				
			}
						
			response.components = {};
			response.components.essaycontest = {};
			response.components.photocontest = {};
			response.components.videocontest = {};
			response.components.gallery = {};
			response.requiredPages = [];
			
			var entryPeriod = {};
			
			for(key in data[0].columns){
				
				if(response.type.indexOf('5') !== -1){
					
					if(/^essaycontest:/.test(key)){
					
						var column = key.replace('essaycontest:','').split(":");
																										
						if(typeof response.components.essaycontest[column[0]] == 'undefined')response.components.essaycontest[column[0]] = {};
					
						response.components.essaycontest[column[0]][column[column.length-1]] = data[0].columns[key].value;
						
					}	
				}
				
				if(response.type.indexOf('4') !== -1){
					
					if(/^photocontest:/.test(key)){
					
						var column = key.replace('photocontest:','').split(":");
																										
						if(typeof response.components.photocontest[column[0]] == 'undefined')response.components.photocontest[column[0]] = {};
					
						response.components.photocontest[column[0]][column[column.length-1]] = data[0].columns[key].value;
						
					}	
				}
				
				if(response.type.indexOf('8') !== -1){
					
					if(/^videocontest:/.test(key)){
					
						var column = key.replace('videocontest:','').split(":");
																										
						if(typeof response.components.videocontest[column[0]] == 'undefined')response.components.videocontest[column[0]] = {};
					
						response.components.videocontest[column[0]][column[column.length-1]] = data[0].columns[key].value;
						
					}	
				}
				
				if(response.type.indexOf('11') !== -1){
					
					if(/^gallery:/.test(key)){
					
						var column = key.replace('gallery:','').split(":");
																										
						if(typeof response.components.gallery[column[0]] == 'undefined')response.components.gallery[column[0]] = {};
					
						response.components.gallery[column[0]][column[column.length-1]] = data[0].columns[key].value;
						
					}	
				}
				if(response.type.indexOf('2') !== -1){
					if(/^fb\-tab:likeGate:/.test(key)){
					
						if(data[0].columns[key].value == 1){
							
							if(response.requiredPages.indexOf('like-gate') === -1)response.requiredPages.push('like-gate');
						}
						
					}	
					
					if(/^fb\tab:targetAudience:/.test(key)){
						if(data[0].columns[key].value!='' && data[0].columns[key].value !='0'){
							if(response.requiredPages.indexOf('not-eligible') === -1)response.requiredPages.push('not-eligible');
						}
					}
				}
				
				if(response.type.indexOf('15') !== -1){
					
					if(response.requiredPages.indexOf('registration-form') === -1)response.requiredPages.push('registration-form');
					if(response.requiredPages.indexOf('thank-you') === -1)response.requiredPages.push('thank-you');
					if(/^regform:eligibility:/.test(key)){
					
						if(response.requiredPages.indexOf('not-eligible') === -1)response.requiredPages.push('not-eligible');
						
					}
					
					if(/^regform:entrylimit:/.test(key)){
					
						if(response.requiredPages.indexOf('already-entered') === -1)response.requiredPages.push('already-entered');
						
						if(key.indexOf('limit-type') !== -1 && data[0].columns[key].value == 'total-entries'){
							
							if(response.requiredPages.indexOf('promotion-limit-reached') === -1)response.requiredPages.push('promotion-limit-reached');
						}
						
					}
					
					if(/^regform:entryperiod:/.test(key)){
					
						if(response.requiredPages.indexOf('before-first-entry-period') === -1)response.requiredPages.push('before-first-entry-period');
						if(response.requiredPages.indexOf('after-last-entry-period') === -1)response.requiredPages.push('after-last-entry-period');
						
						
						var column = key.replace('regform:entryperiod:','').split(":");
																											
						if(typeof entryPeriod[column[0]] == 'undefined')entryPeriod[column[0]] = {};
						
						entryPeriod[column[0]][column[column.length-1]] = data[0].columns[key].value;
					}	
					
				}
				
					
				
			}
			
			response.requiredPagesInfo = requiredPagesInfo();
					
			/*				
			for(key in response.requiredPagesInfo){
			
				if(response.requiredPages.indexOf(key) === -1){
									
					// response.requiredPagesInfo[key];
					
				}
				
			}
			*/
			
			var entryPeriodArray=[];
			
			for(k in entryPeriod){
				
				entryPeriod.id = k;
				entryPeriodArray.push(entryPeriod[k]);
				
			}
										
			entryPeriodArray.sort(function(a,b){
			  a = (a.start=='') ? '' : new Date(a.start);
			  b = (b.start=='') ? '' : new Date(b.start);
			  
			  return (a<b || a == '')?-1:a>b?1:0;
			});
			
			for(k in entryPeriodArray){

				if(entryPeriodArray[(parseInt(k)+1)] && entryPeriodArray[(parseInt(k)+1)].start && entryPeriodArray[k].end){
										
					if(new Date(entryPeriodArray[(parseInt(k)+1)].start) > new Date(entryPeriodArray[k].end)){
					
						response.requiredPages.push('between-entry-period');
						break;
						
					}
					
				}
				
			}
											
			res.send(response);
			return;
					
		});				
						  
	}
	 	
	dashboard.checkRequiredRoles([1], run, req, res);

};