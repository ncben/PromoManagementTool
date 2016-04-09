module.exports = function(app, express){
	
	app.get('/auth/skip', function(req, res){
					
		res.render('../public/tpl/200-facebook-skipped.html', { in_iframe: req.query.in_iframe, next: req.query.next, target: req.query.target, signed_request: req.query.signed_request});
		return;
		
	});
	
	app.get('/fb-static/channel', function(req, res){
				
		res.render('../public/tpl/200-facebook-channel.html');
		return;
		
	});
	
	app.use(express.vhost('*', function( req, res, next ) {
			
		var vhost = function(req,res,next){
			
			if(req.host == 'promocms.dja.com')return next();
			
			var defaultVars = {};
			
			defaultVars.originalUrl = 'http://'+req.host+require('url').parse(req.url).pathname;
			defaultVars.app_id = '381112031899990';
			defaultVars.fbAdmin = '100001846908030';
			defaultVars.__fbAllowAccessOn = '<script>var __fbAllowAccessOn = 1;</script>';
			defaultVars.__isFacebookCanvasOn = '<script>var __isFacebookCanvasOn = 1;</script>';
			defaultVars.__isFacebookTabOn = '<script>var __isFacebookTabOn = 1;</script>';
			defaultVars.__signedRequest = '<script>var __signedRequest = "'+(req.body.signed_request ? req.body.signed_request : '')+'";</script>';
			defaultVars.__fpu = '<script>var __fpu = "'+(req.params && req.params.__fpu ? req.params.__fpu : '')+'";</script>';

			defaultVars.googleAnalytics = "";
			
			
			var renderPage = function(appNamespaces, key, page){
								
				if(key == 'favicon.ico' || page == 'favicon.ico'){
					
					res.sendfile(require("path").resolve(__dirname+'/../public/favicon.ico'));
					res.send('');
					return;	
					
				}
							
				var sendPageFile = function(renderPageId, pageData, pageType){
					
					if(pageData.__isFacebookCanvas && pageData['facebook']['enable-canvas-page'] != 1){
						
						res.render('../public/tpl/200-no-canvas-support.html');
						return;	
						
					}
															
										
					if(typeof renderPageId != 'undefined' && renderPageId != '' && renderPageId != 'null'){
						
						readHostnameJSON(require("path").resolve(__dirname+'/../views/caches/'+namespaceObj.pid+'/'+renderPageId+'.config.json'),{}, function(pageConfig){
							
					
							defaultVars.pageName = pageData.pageName;
							defaultVars.googleAnalytics = pageData.googleAnalytics || "";
							defaultVars.uid = (typeof req.body.uid == 'object' ? req.body.uid[0] : (typeof req.body.uid == 'string' ? req.body.uid.split(',')[0] : (typeof req.session[namespaceObj.pid] != 'undefined' && req.session[namespaceObj.pid]['uid'] ? (typeof req.session[namespaceObj.pid]['uid'] == 'object' ? req.session[namespaceObj.pid]['uid'][0] : (typeof req.session[namespaceObj.pid]['uid'] == 'string' ? req.session[namespaceObj.pid]['uid'] : '')) : '')))
							
							if(pageConfig.variables && Object.keys(pageConfig.variables).length > 0){

								for(v in pageConfig.variables){
									
									if(/^var=/.test(pageConfig.variables[v]) || pageConfig.variables[v].trim() == ''){
									
										pageConfig.variables[v] = defaultVars[pageConfig.variables[v].replace(/^var=/, '')] || '';
										
									}
									
									if(pageConfig.variables[v+'.__isReferral']){
										
										pageConfig.variables[v] += '?ref='+defaultVars.uid;
											
									}
									
								}	
								
							}else{
								pageConfig.variables = defaultVars || {};
								pageConfig.variables.customHeadValues = '';
								
							}
							
							pageConfig.variables.uid = 	defaultVars.uid;					
							pageConfig.variables.customHeadValues += defaultVars.googleAnalytics || "";
							pageConfig.variables.customHeadValues += '<script>var __ref="'+(defaultVars.uid || "")+'";</script>';
							if(defaultVars.__refId)pageConfig.variables.customHeadValues += '<script>var __refId="'+(defaultVars.__refId || "")+'";</script>';
							
							
							
							var facebookOptions = pageData['facebook'];
														
							if(!req.body.signed_request && req.body.__isFacebookTabOn != 1 && req.body.__isFacebookTabOn != 'true' && req.body.__isFacebookCanvasOn != 1 && req.body.__isFacebookCanvasOn != 'true' && facebookOptions && facebookOptions['allow-access'] && facebookOptions['allow-access'][(defaultVars.__mdIsMobile ? 'mobile' : 'microsite')] == 1){

								pageData.__fbAllowAccess = true;
								
							}
																					
							if(req.body.__isFacebookTabOn == 1 || req.body.__isFacebookTabOn == 'true' || req.body.__isFacebookCanvasOn == 1 || req.body.__isFacebookCanvasOn == 'true' ){
											
								if(req.body.__isFacebookTabOn == 1 || req.body.__isFacebookTabOn == 'true')pageData.__isFacebookTab = true;
								if(req.body.__isFacebookCanvasOn == 1 || req.body.__isFacebookCanvasOn == 'true')pageData.__isFacebookCanvas = true;
								
								//TAB
																								
								if(pageData.__isFacebookTab && facebookOptions['allow-access'] && facebookOptions['allow-access']['facebook-page-tab'] == 1){
									pageData.__fbAllowAccess = true;
									
								}
								
						
								//CANVAS
								
								if(pageData.__isFacebookCanvas && facebookOptions['allow-access'] && facebookOptions['allow-access']['facebook-canvas'] == 1){
									pageData.__fbAllowAccess = true;
									
								}
							}
											
							
							if(pageData.__fbAllowAccess == true){
								
								if(typeof pageConfig.variables.customHeadValues == 'undefined')pageConfig.variables.customHeadValues = '';						
								pageConfig.variables.customHeadValues += defaultVars.__fbAllowAccessOn;
								
							}
							
							if(pageData.__isFacebookCanvas == true){
								
								if(typeof pageConfig.variables.customHeadValues == 'undefined')pageConfig.variables.customHeadValues = '';						
								pageConfig.variables.customHeadValues += defaultVars.__isFacebookCanvasOn;
								pageConfig.variables.customHeadValues += defaultVars.__signedRequest;
							}
							
							if(req.params && req.params.__fpu){
								
								if(typeof pageConfig.variables.customHeadValues == 'undefined')pageConfig.variables.customHeadValues = '';						
								pageConfig.variables.customHeadValues += defaultVars.__fpu;
								
							}
							
							
							
							if(pageData.__isFacebookTab == true){
								
								if(typeof pageConfig.variables.customHeadValues == 'undefined')pageConfig.variables.customHeadValues = '';						
								pageConfig.variables.customHeadValues += defaultVars.__isFacebookTabOn;
								pageConfig.variables.customHeadValues += defaultVars.__signedRequest;
								
							}
						
							if(req.method == 'GET' || (req.body && typeof req.body['signed_request'] != 'undefined' && req.body['signed_request'] != '' && req.body['signed_request'] != 'null' && !req.body.dataPath)){
																
								
								if(pageConfig.hasFormElement == true || pageType == 'like-gate'){
																		
							 	    delete require.cache[require.resolve('./getform.js')];
															
									require('./getform.js')(namespaceObj, pageConfig, pageData, renderPageId, req, res, next);
									
								}else{
																										
									res.render('../views/caches/'+namespaceObj.pid+'/'+renderPageId+'.html',{vars: pageConfig.variables|| {}}, function(err, html){ err ? next() && console.log(err) : res.end(html)});
									
								}
								
							}else if (req.method == 'POST'){	
							
								var pageConfigObj = [];
								pageConfigObj[renderPageId] = pageConfig;
								
								var renderPostForm = function(){
								
									delete require.cache[require.resolve('./postform.js')];
									
									require('./postform.js')(namespaceObj, pageConfigObj, pageData, renderPageId, req, res, next);
									
								}
															
								if(pageConfig.hasFormElement == true && req.body['datapath'] && typeof req.body['dataString'] == 'undefined'){
																							
									var dataPathObj = req.body['datapath'].split('/').filter( function( item, index, inputArray ) { return !!item.trim() });
									
									var pageDataObjRequired = [];
									var pageDataObjChecked = [];
									
									for(k in dataPathObj){
										
										var pageDataId = dataPathObj[k].split('.')[0];
	
										if(pageDataId && renderPageId != pageDataId){
										
											pageDataObjRequired.push(pageDataId);
											
										}
										
									}
												
									if(pageDataObjRequired.length == 0)renderPostForm();
																		
									for(var i=0;i<pageDataObjRequired.length;i++){
																			
										readHostnameJSON(require("path").resolve(__dirname+'/../views/caches/'+namespaceObj.pid+'/'+pageDataObjRequired[i]+'.config.json'), {pageDataObjId: pageDataObjRequired[i]}, function(pageConfig, pageOptions){
																						
											pageConfigObj[pageOptions.pageDataObjId] = pageConfig;
											pageDataObjChecked.push(pageDataObjRequired[i]);
											if(pageDataObjRequired.length == pageDataObjChecked.length){
											
												renderPostForm();
												
											}
											
										});
										
									}

									
							 	    
								}else if(pageConfig.hasFormElement == true && typeof req.body['dataString'] != 'undefined' && req.body['dataPath']){
									
									
									var pageConfigObj = [];
									pageConfigObj[renderPageId] = pageConfig;
									
									var renderPostForm = function(){
									
										delete require.cache[require.resolve('./postnextform.js')];
										require('./postnextform.js')(namespaceObj, pageConfigObj, pageData, renderPageId, req, res, next);
										
									}
																
									if(pageConfig.hasFormElement == true && req.body['dataPath']){
																								
										var dataPathObj = req.body['dataPath'].split('/').filter( function( item, index, inputArray ) { return !!item.trim() });
										
										var pageDataObjRequired = [];
										var pageDataObjChecked = [];
										
										for(k in dataPathObj){
											
											var pageDataId = dataPathObj[k].split('.')[0];
		
											if(pageDataId && renderPageId != pageDataId){
											
												pageDataObjRequired.push(pageDataId);
												
											}
											
										}
													
										if(pageDataObjRequired.length == 0)renderPostForm();
																			
										for(var i=0;i<pageDataObjRequired.length;i++){
																				
											readHostnameJSON(require("path").resolve(__dirname+'/../views/caches/'+namespaceObj.pid+'/'+pageDataObjRequired[i]+'.config.json'), {pageDataObjId: pageDataObjRequired[i]}, function(pageConfig, pageOptions){
																							
												pageConfigObj[pageOptions.pageDataObjId] = pageConfig;
												pageDataObjChecked.push(pageDataObjRequired[i]);
												if(pageDataObjRequired.length == pageDataObjChecked.length){
												
													renderPostForm();
													
												}
												
											});
											
										}
										
																		
									}
									
									
								}else return next();

							}
							
						}) 
						
					}	
					
				}
				
				if(typeof appNamespaces == 'object' && typeof appNamespaces[key] != 'undefined' && typeof appNamespaces[key].pid != 'undefined'){
					var namespaceObj = appNamespaces[key];
													
					readHostnameJSON(require("path").resolve(__dirname+'/../views/caches/'+namespaceObj.pid+'/config.page.json'), {},function(pageData){
							
						if(typeof pageData['published'] != 'undefined' && pageData['published'] == 0){
						
							return next();	
							
						}
						
						var getCurrentPageType = function(page, pageData){
							
							if(page){
								
								if(page.length != 36){

									if(typeof pageData['alias'] == 'object'){
										var aliasObj = pageData['alias'][page.toLowerCase()];
									}
															
									if(typeof aliasObj !== 'undefined' && aliasObj.pageItemId){
																				
										return aliasObj.pageItemId;
										
									}else return '';
									
										
								}else return page;
								
							}else{
							
								return '';
								
							}	
							
						}
						
						var sendPageFileByPathname = function(page, pageData, next){
														
							if(page){
								
								if(page.length != 36){

									if(typeof pageData['alias'] == 'object'){
										var aliasObj = pageData['alias'][page.toLowerCase()];
									}
									
									if(typeof facebookOptions['custom-canvas-redirect-url'] == 'object'){
														
										var _ = require('underscore');
										
										var customDestination = _.findWhere(facebookOptions['custom-canvas-redirect-url'], {namespace: page});
																				
										if(customDestination && customDestination.destination){
											
											var reqUrl = req.url.split('?');
											var reqUrlPathname = reqUrl[0].split('/');
											
											
											if(typeof aliasObj !== 'undefined' && aliasObj.pageItemId){
												
												if(req.query.cru){
												
													sendPageFile(aliasObj.pageItemId, pageData);
													return;
													
												}else{
													
													if(pageData.__isFacebookCanvas){
													
														res.render('../public/tpl/200-facebook-canvas-duplicate-namespace.html');
														return;	
														
													}
												
													res.redirect('/'+reqUrlPathname[1]+'/'+reqUrlPathname[2] + (reqUrl[1] ? '?' + reqUrl[1] + '&' : '?') + 'cru=' + page + '&fpu=' + customDestination.destination);
													return;
													
												}
												
											}else{
											
												res.redirect('/'+reqUrlPathname[1]+'/' + (reqUrl[1] ? '?' + reqUrl[1] + '&' : '?') + 'cru=' + page + '&fpu=' + customDestination.destination);
												return;
												
											}
										}
										
									}
															
									if(typeof aliasObj !== 'undefined' && aliasObj.pageItemId){
																				
										sendPageFile(aliasObj.pageItemId, pageData);
										
									}else return next();
									
										
								}else sendPageFile(page, pageData);
								
							}else{
							
								sendPageFile(namespaceObj['landing-page'], pageData);
								
							}	
							
						}
						
						var mobile_detect = require('mobile-detect');
										
						md = new mobile_detect(req.headers['user-agent']);
						
						var mdIsMobile = md.mobile();
						
						defaultVars.__mdIsMobile = pageData.__mdIsMobile = mdIsMobile;
					
					
						if(req.method == 'GET' || (req.body && req.body.signed_request)){
						
							
							if(req.body['signed_request'] && pageData['components'].indexOf('2') === -1){
								
								res.render('../public/tpl/200-no-facebook-support.html');
								return;
	
							}else if(mdIsMobile && pageData['components'].indexOf('3') === -1){
								
								res.render('../public/tpl/200-no-mobile-support.html');
								return;
	
							}else if(!mdIsMobile && pageData['components'].indexOf('1') === -1 && !req.body.signed_request && req.body.__isFacebookTabOn != 1 && req.body.__isFacebookTabOn != 'true' && req.body.__isFacebookCanvasOn != 1 && req.body.__isFacebookCanvasOn != 'true'){
																
								res.render('../public/tpl/200-no-microsite-support.html');
								return;
	
							}
							
							var facebookOptions = pageData['facebook'];
							if(typeof pageData['components'] == 'object' && pageData['components'].indexOf('2') !== -1){
								
								if(typeof req.body['signed_request'] != 'undefined' && req.body['signed_request'] != null){
									
									var signedRequestData = require('fb-signed-parser').parse(req.body['signed_request'], '8e069c16293dc82877377d50aeb182a2');
																		
									if(signedRequestData && signedRequestData['app_data'] && signedRequestData['app_data'].indexOf('ref=') !== -1){
										defaultVars.__refId = signedRequestData['app_data'].split('ref=')[1].split(';')[0];
										
									}
								
									if(signedRequestData && signedRequestData['user'] && facebookOptions['target-audience']){
										
										if(signedRequestData['user']['country']  && signedRequestData['user']['age'] && signedRequestData['user']['age']['min'] && facebookOptions['target-audience']['contains-alcohol'] == 1){
											var alcoholAgesObj = {"CA" : 21, "KR": 21, "NI": 21, "JP": 21, "IS": 21, "PY": 21, "CM": 21, "FM": 21, "PW": 21, "SB": 21, "LK": 21, "US": 21, "IN": 21, "SE": 21 };
											
																				
											if((typeof alcoholAgesObj[signedRequestData['user']['country'].toUpperCase()] != 'undefined' && parseInt(signedRequestData['user']['age']['min']) < alcoholAgesObj[signedRequestData['user']['country'].toUpperCase()]) || (typeof alcoholAgesObj[signedRequestData['user']['country'].toUpperCase()] == 'undefined' && parseInt(signedRequestData['user']['age']['min']) < 18)){
											
												res.render('../public/tpl/200-facebook-alcohol-restriction.html');
												return;
												
											}
										}
										
										if(signedRequestData['user']['age'] && signedRequestData['user']['age']['min'] && facebookOptions['target-audience']['age-restriction']){
																				
											if(parseInt(signedRequestData['user']['age']['min']) < parseInt(facebookOptions['target-audience']['age-restriction'])){
																						
												res.render('../public/tpl/200-facebook-age-restriction.html');
												return;
												
											}
										}
										
										if(signedRequestData['user']['country'] && typeof facebookOptions['target-audience']['country-restrictions'] == 'object' && facebookOptions['target-audience']['country-restrictions'].length > 0 && facebookOptions['target-audience']['country-restrictions'].indexOf(signedRequestData['user']['country'].toUpperCase()) === -1 ){
																					
											res.render('../public/tpl/200-facebook-country-restriction.html');
											return;
												
										}
										
										
											
									}
									
									var currentPageId = getCurrentPageType(page, pageData);
									
									var isLandingPageChecksRequired = (appNamespaces['landing-page'] && appNamespaces['landing-page'][key] && appNamespaces['landing-page'][key] == currentPageId) || !currentPageId;
																		
									if(typeof signedRequestData == 'object' && signedRequestData.user){
										if(signedRequestData.page){
											
											pageData.__isFacebookTab = true;
										}else{
											pageData.__isFacebookCanvas = true;
										}
									}

																																					
									if(isLandingPageChecksRequired){
										
										if(typeof signedRequestData == 'object' && signedRequestData.user){
											if(signedRequestData.page){
																								
												//TAB
												
												if(facebookOptions['allow-access'] && facebookOptions['allow-access']['facebook-page-tab'] == 1){
													pageData.__fbAllowAccess = true;
													
												}
												
												if(facebookOptions['fan-gate']['facebook-page-tab'] == 1){
	
													if(signedRequestData.page.liked == true){
														
														 sendPageFile(namespaceObj['landing-page'], pageData);
														
													}else{
														
														 sendPageFile(pageData['routes']['like-gate']['pageItemId'], pageData, 'like-gate');
														 
													}
													
													
												}else sendPageFile(namespaceObj['landing-page'], pageData);
													
											}else{
											
												//CANVAS
																								
												if(facebookOptions['allow-access'] && facebookOptions['allow-access']['facebook-canvas'] == 1){
													pageData.__fbAllowAccess = true;
													
												}
												
												if(facebookOptions['enable-canvas-page'] && facebookOptions['enable-canvas-page'] == 1){
												
													if(facebookOptions['fan-gate']['facebook-canvas'] == 1){
														
														if(!signedRequestData['user_id']){
															res.render('../public/tpl/200-fb-login.html', {scope: 'user_likes', next_url: req.originalUrl, signed_request: req.body.signed_request, app_id: '381112031899990', app_url: '//apps.facebook.com/promotioncms'});
															return;
															
														}else{
														
															var FB = require('fb');
															FB.setAccessToken(signedRequestData['oauth_token']);
															
															if(!pageData['facebook']['fan-gate-url'] || !pageData['facebook']['fan-gate-url']['facebook-canvas']){
															
																res.render('../public/tpl/200-no-canvas-like-gate-url.html');
																return;	
																
															}
																										  
															FB.api('me', { fields: ['permissions','likes.target_id('+pageData['facebook']['fan-gate-url']['facebook-canvas']+').fields(id)'] }, function (fbData) {
															  if(!fbData || fbData.error) {
																console.log(!fbData ? 'FB Like Gate Error Occurred' : fbData.error);
																next();
																return;
															  }
															  
															  if(!fbData.permissions || !fbData.permissions.data || !fbData.permissions.data[0]  || fbData.permissions.data[0]['user_likes'] != 1){
																  
																  res.render('../public/tpl/200-facebook-skipped-user-likes.html');
																  return;
																  
															  }
																												  
															  if(!fbData.likes || !fbData.likes.data || !fbData.likes.data[0]){
																  															  
																  sendPageFile(pageData['routes']['like-gate']['pageItemId'], pageData, 'like-gate');
																
															  }else{
																  
																  sendPageFileByPathname(page, pageData, next);
																  
															  }
															  
															  
															});
															
														}
														
													}else sendPageFile(namespaceObj['landing-page'], pageData);
													
												}else{
																										
													var extraNamespace = require('url').parse(req.url).path.split('/')[2];
													
													if(extraNamespace && typeof facebookOptions['custom-canvas-redirect-url'] == 'object'){
														
														var _ = require('underscore');
														
														var customDestination = _.findWhere(facebookOptions['custom-canvas-redirect-url'], {namespace: extraNamespace});
														
													}
													
													if(customDestination && customDestination.destination){
													
														res.render('../public/tpl/200-facebook-canvas-redirect.html', {'canvasRedirectUrl': '//www.facebook.com/'+customDestination.destination+'?sk=app_381112031899990'+ (typeof require('url').parse(req.url).query != 'undefined' && require('url').parse(req.url).query !== null ? '&app_data='+require('url').parse(req.url).query.replace(/&/g, ';') : '')});
														return;
														
													}
													
													if(facebookOptions['canvas-redirect-url']){
																																										
														res.render('../public/tpl/200-facebook-canvas-redirect.html', {'canvasRedirectUrl': '//www.facebook.com/'+facebookOptions['canvas-redirect-url']+'?sk=app_381112031899990'+ (typeof require('url').parse(req.url).query != 'undefined' && require('url').parse(req.url).query !== null ? '&app_data='+require('url').parse(req.url).query.replace(/&/g, ';') : '')});
														return;
													}else{
														
														res.render('../public/tpl/200-no-canvas-redirect.html');
														return;
														
													}
													
													
												}
															
												
											}
											
										}else next();
											
											
										
									}else sendPageFileByPathname(page, pageData, next);
									
																																		
								}else{
									
									var currentPageId = getCurrentPageType(page, pageData);
																			
									if((appNamespaces['landing-page'] && appNamespaces['landing-page'][key] && appNamespaces['landing-page'][key] == currentPageId) || !currentPageId){
																																																																										
										if((!req.headers['user-agent'] || (req.headers['user-agent'] && req.headers['user-agent'].indexOf('facebookexternalhit') === -1)) && typeof pageData['routes']['like-gate'] != undefined && facebookOptions && facebookOptions['fan-gate'] && facebookOptions['fan-gate-url'] && ((mdIsMobile && facebookOptions['fan-gate']['mobile'] == 1) || (!mdIsMobile && facebookOptions['fan-gate']['microsite'] == 1)) && !!(mdIsMobile ? facebookOptions['fan-gate-url']['mobile'] : facebookOptions['fan-gate-url']['microsite'])){
											
											var authFacebook = function(){ 
												var passport = require('passport');
												var FacebookStrategy = require('passport-facebook').Strategy;
																											
												passport.use(new FacebookStrategy({
													clientID: '381112031899990',
													clientSecret: '8e069c16293dc82877377d50aeb182a2',
													callbackURL: req.originalUrl
												  },
												  function(accessToken, refreshToken, profile, done) {
																									  
													  var FB = require('fb');
													  FB.setAccessToken(accessToken);
													  
													  if(mdIsMobile && (!pageData['facebook']['fan-gate-url'] || !pageData['facebook']['fan-gate-url']['mobile'])){
														res.render('../public/tpl/200-no-mobile-like-gate-url.html');
														return;	
															
													  }
													  
													  if(!mdIsMobile && (!pageData['facebook']['fan-gate-url'] || !pageData['facebook']['fan-gate-url']['microsite'])){
														res.render('../public/tpl/200-no-microsite-like-gate-url.html');
														return;	
															
													  }
																									  
													  FB.api('me', { fields: ['permissions','likes.target_id('+(mdIsMobile ? pageData['facebook']['fan-gate-url']['mobile'] : pageData['facebook']['fan-gate-url']['microsite'])+').fields(id)'] }, function (fbData) {
														  if(!fbData || fbData.error) {
															console.log(!fbData ? 'FB Like Gate Error Occurred' : fbData.error);
															next();
															return;
														  }
														  
														  if(!fbData.permissions || !fbData.permissions.data || !fbData.permissions.data[0]  || fbData.permissions.data[0]['user_likes'] != 1){
															  
															  res.render('../public/tpl/200-facebook-skipped-user-likes.html');
															  return;
															  
														  }
																											  
														  if(!fbData.likes || !fbData.likes.data || !fbData.likes.data[0]){
														  
															  sendPageFile(pageData['routes']['like-gate']['pageItemId'], pageData, 'like-gate');
															
														  }else{
															  
															  sendPageFileByPathname(page, pageData, next);
															  
														  }
														  
														  
													  });
													  
													 
												  }
												));
																					
											
												passport.authenticate('facebook', { scope: 'user_likes', failureRedirect: '/auth/skip?next='+encodeURIComponent(req.originalUrl) }, function(err){
																											
													if(err || req.query.error) { 
														var querystring = require('querystring');
														var params = querystring.parse(require('url').parse(req.url).query);
														params.code? delete params.code : '';
														params.error? delete params.error : '';
														params.error_code? delete params.error_code : '';
														params.error_description? delete params.error_description : '';
														params.error_reason? delete params.error_reason : '';
														
														params = querystring.stringify(params);
													}
														
													if(err){
														
														console.log(err);
														res.redirect(require('url').parse(req.url).pathname+'?'+params);
														return;
													
													}
												
													if(req.query && req.query.error){
														res.redirect('/auth/skip?next='+encodeURIComponent(require('url').parse(req.url).pathname+'?'+params))
														return;
													}
													
												})(req,res,next);
													
												
											}
											
											authFacebook();										
											return;
												
										}else{
																				
											sendPageFileByPathname(page, pageData, next);
											
										}
										
									}else sendPageFileByPathname(page, pageData, next);
									
								}
									
							}else{
								sendPageFileByPathname(page, pageData, next);
							}
															
						}else{
							
							sendPageFileByPathname(page, pageData, next);
						}
							
					})
											
				}else next();	
				
			}
			
			var readHostnameJSON = function(path, options, cb){

				var fs = require('fs');
				fs.readFile(path, function (err, data) {
					if (err){
					
						console.log(err);	
						
					}
					
					try{
						var jsonData = JSON.parse(data);
					}catch(Ex){
						console.log(Ex);
						var jsonData = {}
					}
					
					cb(jsonData, options);
					
					
				})		
				
				
			}
					
			if(req.host == 'apps.dja.com'){
																
				if(!req.originalUrl || req.originalUrl == '/' || typeof req._parsedUrl !== 'object' || typeof req._parsedUrl.pathname === 'undefined'){
					if(req.body && typeof req.body['signed_request'] != 'undefined' && req.body['signed_request'] != null){
												
						var signedRequestData = require('fb-signed-parser').parse(req.body.signed_request, '8e069c16293dc82877377d50aeb182a2');
												
						if(typeof signedRequestData == 'object'){
							
							if(signedRequestData.user && signedRequestData.page && signedRequestData.page.id){
								
								//TAB - universal url
						
								readHostnameJSON(__dirname+'/writable/config.routes.facebook.json',{}, function(appNamespaces){
										
									if(appNamespaces[signedRequestData.page.id]){
										
										var pid = appNamespaces[signedRequestData.page.id].pid;
										
										if(pid){
											
											readHostnameJSON(__dirname+'/writable/config.hostname.pid.json',{}, function(appNamespaces){												
												if(typeof appNamespaces[pid] == 'object' && typeof appNamespaces[pid].domain == 'object' && appNamespaces[pid].domain.length > 0 ){
													
													for(var i=0;i<appNamespaces[pid].domain.length;i++){
														
														if(appNamespaces[pid].domain[i].indexOf('.dja.com') !== -1){
															
															res.render('../public/tpl/200-proxy-form.html', {signed_request: req.body.signed_request, next_url: '//'+appNamespaces[pid].domain[i]+'/'});
															break;
															
														}
														
													}
													if(!req.headerSent)res.render('../public/tpl/200-proxy-form.html', {signed_request: req.body.signed_request, next_url: '//'+appNamespaces[pid].domain[0]+'/'});
													
												}else{
												
													res.status(404);
													res.render('../public/tpl/404-no-url-created.html');
													return;	
													
												}
												
											})
											
											
											
										}else{
												
											res.status(404);
											res.render('../public/tpl/404-no-url-created.html');
											return;	
											
										}
										
									}else{
												
										res.status(404);
										res.render('../public/tpl/404-no-url-created.html');
										return;	
										
									}
									
																							
								})
							}else if(signedRequestData.user){

								//CANVAS - no namespace
								
								
								res.render('../public/tpl/200-facebook-canvas-no-app-specified.html');
								return;
								
								
							}else{
								next();
							}
							
						}
	
						
					}else{
						res.redirect('http://dja.com');
						return;
					}
				}else{
				
					if(req.query && req.query.notif_t == 'app_request'){
						res.render('../public/tpl/200-facebook-canvas-no-app-request-support.html');
						return;
					}
					
				}

				readHostnameJSON(__dirname+'/writable/config.hostname.apps.dja.com.json',{}, function(appNamespaces){

					var pathname = req._parsedUrl.pathname.replace(/^\//, '').split('/');
					var key = pathname[0];
					var page = typeof pathname[1] !== 'undefined' ? pathname[1] : '';
					
					if(typeof pathname[1] === 'undefined' && req._parsedUrl.pathname.substr(-1) != '/'){
						
						if(req.body && req.body['signed_request']){
														
							res.render('../public/tpl/200-proxy-form.html', {signed_request: req.body.signed_request, next_url: '//'+req.host+req.url.replace(req._parsedUrl.pathname, req._parsedUrl.pathname+'/')});
							return;

						}else{
							res.redirect(req.url.replace(req._parsedUrl.pathname, req._parsedUrl.pathname+'/'));
							return;
						}
					}
															
					renderPage(appNamespaces, key.toLowerCase(), page.toLowerCase());
					
				})
				
				
			}else if(req.host.match(/^[a-zA-Z0-9\-_]{3,17}\.dja\.com/)){
				
				readHostnameJSON(__dirname+'/writable/config.hostname.wildcard.dja.com.json',{}, function(appNamespaces){
				
					var pathname = req._parsedUrl.pathname.replace(/^\//, '').split('/');
					var page = typeof pathname[0] !== 'undefined' ? pathname[0] : '';
					var key = req.host;
					
					renderPage(appNamespaces, key.toLowerCase(), page.toLowerCase());
					
				})
				
			}else{
				
				
				readHostnameJSON(__dirname+'/writable/config.hostname.custom.json',{}, function(appNamespaces){
				
					var appNamespaces = require('./writable/config.hostname.custom.json');
					var pathname = req._parsedUrl.pathname.replace(/^\//, '').split('/');
					var page = typeof pathname[0] !== 'undefined' ? pathname[0] : '';
					var key = req.host;
					
					renderPage(appNamespaces, key.toLowerCase(), page.toLowerCase());
					
				})
			
			}
				
		}
			
		if(req.headers['x-forwarded-proto'] !== 'https'){
			var fs = require('fs');
			fs.readFile(__dirname+'/writable/config.protocol.https.json', function (err, data) {
				if (err) throw err;
				
				try{
					var sslVhost = JSON.parse(data);
				}catch(Ex){
					console.log(Ex);
					var sslVhost = {}
				}
			  
				if(req.host == 'apps.dja.com'){
			
					if(typeof sslVhost[req.host+req._parsedUrl.pathname] !== 'undefined'){
					
						res.redirect('https://'+req.host+req.originalUrl);
						return;
					
					}
				
				}else if(typeof sslVhost[req.host] !== 'undefined'){
					res.redirect('https://'+req.host+req.originalUrl);
					return;
				}
				
				vhost(req,res,next);
			  
			});
				
		}else vhost(req,res,next);
	
	}));

}