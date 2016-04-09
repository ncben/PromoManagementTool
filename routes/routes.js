module.exports = function(app, express){

	/* Enable for logging each request
	app.all('*', function(req, res, next) {
	  console.log('Request ID: ' +req.id);
	  return next();
	});
	
	*/
	
	require('./vhost')(app, express);
	
	app.all('*', function(req, res, next) {
	  
		if(req.host == 'promocms.dja.com'){
						
			app.get('/logout', auth.Logout);
			app.get('/auth', auth.authLogout);
			app.post('/auth', auth.authLogin);
			app.get('/me', auth.getCurrentUser);
			
			app.post('/promo/add', promo.addNewPromo);
			app.get('/promo/add', promo.getPromoTypes);
			app.get('/promo/all', promo.getAllPromos);
			app.get('/promo/browse', promo.getAllPromos);
			
			app.post('/manage/user', manage.addUser);
			app.get('/manage/user', manage.getUser);
			app.get('/manage/user/roles', manage.getAllUserRoles);
			app.get('/manage/user/groups', manage.getAllUserGroups);
			app.get('/manage/user/suspend', manage.suspendUser);
			app.get('/manage/user/reactivate', manage.reactivateUser);
			app.delete('/manage/user', manage.deleteUser);
			app.put('/manage/user', manage.updateUser);
			
			app.get('/profile', profile.getProfile);
			app.get('/profile/password', profile.changePassword);
			app.put('/profile', profile.updateProfile);
			app.get('/profile/switch-group', profile.switchGroup);
			app.delete('/profile', profile.deleteProfile);
			
			app.get('/dashboard/basic', dashboardbasic.getInfo);
			app.get('/dashboard/basic/types', dashboardbasic.getTypes);
			app.post('/dashboard/basic/promoTitle', dashboardbasic.updatePromoTitle);
			app.put('/dashboard/basic/defaultTemplate', dashboardbasic.updateDefaultTemplate);
			app.post('/dashboard/basic/accessToken', dashboardbasic.generateAccessToken);
			app.put('/dashboard/basic/siteUpDown', dashboardbasic.siteUpDown);
			app.put('/dashboard/basic/lockChanges', dashboardbasic.lockChanges);
			app.delete('/dashboard/basic/deletePromotion', dashboardbasic.deletePromotion);
			app.put('/dashboard/basic/typeChanges', dashboardbasic.typeChanges);
			app.get('/dashboard/basic/templates', dashboardbasic.getTemplates);
			app.post('/dashboard/basic/domain', dashboardbasic.updateDomainDetails);
			app.put('/dashboard/basic/domain', dashboardbasic.updateDomainDetails);
			app.delete('/dashboard/basic/domain', dashboardbasic.deleteDomain);
			
			app.get('/dashboard/fb-tab', dashboardfbtab.getInfo);
			app.put('/dashboard/fb-tab/fanGate', dashboardfbtab.fanGate);
			app.put('/dashboard/fb-tab/fanGateURL', dashboardfbtab.fanGateURL);
			app.put('/dashboard/fb-tab/allowAccess', dashboardfbtab.allowAccess);
			app.put('/dashboard/fb-tab/linkFanPage', dashboardfbtab.linkFanPage);
			app.delete('/dashboard/fb-tab/unlinkFanPage', dashboardfbtab.unlinkFanPage);
			app.post('/dashboard/fb-tab/addTab', dashboardfbtab.addPageTab);
			app.delete('/dashboard/fb-tab/removeTab', dashboardfbtab.removePageTab);
			app.get('/dashboard/fb-tab/checkAddTab', dashboardfbtab.checkAddTab);
			app.delete('/dashboard/fb-tab/cancelAddPageTab', dashboardfbtab.cancelAddPageTab);
			app.put('/dashboard/fb-tab/containsAlcohol', dashboardfbtab.containsAlcohol);
			app.put('/dashboard/fb-tab/enableCanvasPage', dashboardfbtab.enableCanvasPage);
			app.put('/dashboard/fb-tab/canvasRedirectURL', dashboardfbtab.canvasRedirectURL);
			app.post('/dashboard/fb-tab/addCanvasRedirectURL', dashboardfbtab.addCanvasRedirectURL);
			app.delete('/dashboard/fb-tab/removeCanvasURL', dashboardfbtab.removeCanvasURL);
			app.put('/dashboard/fb-tab/updateCanvasRedirectURLNamespace', dashboardfbtab.updateCanvasRedirectURLNamespace);
			app.put('/dashboard/fb-tab/updateCanvasRedirectURLDestination', dashboardfbtab.updateCanvasRedirectURLDestination);
			app.put('/dashboard/fb-tab/ageRestrictions', dashboardfbtab.ageRestrictions);
			app.post('/dashboard/fb-tab/exchangeAccessToken', dashboardfbtab.exchangeAccessToken);
			app.post('/dashboard/fb-tab/countryRestrictions', dashboardfbtab.countryRestrictions);
			app.post('/dashboard/fb-tab/collectDemographicData', dashboardfbtab.collectDemographicData);
			
			app.get('/dashboard/reg-form', dashboardregform.getInfo);
			app.post('/dashboard/reg-form/eligibility/country', dashboardregform.updateEligibilityCountry);
			app.post('/dashboard/reg-form/eligibility/state', dashboardregform.updateEligibilityState);
			app.delete('/dashboard/reg-form/eligibility', dashboardregform.deleteEligibility);
			app.put('/dashboard/reg-form/eligibility/age', dashboardregform.updateEligibilityAge);
			app.post('/dashboard/reg-form/entryperiod', dashboardregform.updateEntryPeriod);
			app.delete('/dashboard/reg-form/entryperiod', dashboardregform.deleteEntryPeriod);
			app.post('/dashboard/reg-form/entrylimit', dashboardregform.updateEntryLimit);
			app.delete('/dashboard/reg-form/entrylimit', dashboardregform.deleteEntryLimit);
			app.post('/dashboard/reg-form/referralentrylimit', dashboardregform.updateReferralEntryLimit);
			app.delete('/dashboard/reg-form/referralentrylimit', dashboardregform.deleteReferralEntryLimit);
			
			app.get('/dashboard/essay-contest', dashboardessaycontest.getInfo);
			app.post('/dashboard/essay-contest/createEssayItem', dashboardessaycontest.createEssayItem);
			app.put('/dashboard/essay-contest/essayItem', dashboardessaycontest.updateEssayItem);
			app.post('/dashboard/essay-contest/essayItem', dashboardessaycontest.updateEssayItem);
			app.delete('/dashboard/essay-contest/essayItem', dashboardessaycontest.deleteEssayItem);
			
			
			app.get('/dashboard/photo-contest', dashboardphotocontest.getInfo);
			app.post('/dashboard/photo-contest/createPhotoItem', dashboardphotocontest.createPhotoItem);
			app.put('/dashboard/photo-contest/photoItem', dashboardphotocontest.updatePhotoItem);
			app.post('/dashboard/photo-contest/photoItem', dashboardphotocontest.updatePhotoItem);
			app.delete('/dashboard/photo-contest/photoItem', dashboardphotocontest.deletePhotoItem);
			
			app.get('/dashboard/video-contest', dashboardvideocontest.getInfo);
			app.post('/dashboard/video-contest/createVideoItem', dashboardvideocontest.createVideoItem);
			app.put('/dashboard/video-contest/videoItem', dashboardvideocontest.updateVideoItem);
			app.post('/dashboard/video-contest/videoItem', dashboardvideocontest.updateVideoItem);
			app.delete('/dashboard/video-contest/videoItem', dashboardvideocontest.deleteVideoItem);
			
			
			app.get('/dashboard/gallery', dashboardgallery.getInfo);
			app.post('/dashboard/gallery/createGalleryItem', dashboardgallery.createGalleryItem);
			app.put('/dashboard/gallery/galleryItem', dashboardgallery.updateGalleryItem);
			app.post('/dashboard/gallery/galleryItem', dashboardgallery.updateGalleryItem);
			app.delete('/dashboard/gallery/galleryItem', dashboardgallery.deleteGalleryItem);
			
			
			app.get('/dashboard/pages', dashboardpages.getInfo);
			app.get('/dashboard/pages/getTemplateDetails', dashboardpages.getTemplateDetails);
			app.post('/dashboard/pages/pageItem', dashboardpages.createPageItem);
			app.delete('/dashboard/pages/pageItem', dashboardpages.deletePageItem);
			app.get('/dashboard/pages/templates', dashboardpages.getTemplates);
			app.put('/dashboard/pages/updatePageItem', dashboardpages.updatePageItem);
			app.get('/dashboard/pages/getPanelInfo', dashboardpages.getPanelInfo);
			app.post('/dashboard/pages/publishPage', dashboardpages.publishPage);
			app.delete('/dashboard/pages/publishPage', dashboardpages.unpublishPage);
			app.post('/dashboard/pages/updateConfigurableURL', dashboardpages.updateConfigurableURL);
			app.post('/dashboard/pages/uploadImage', dashboardpages.uploadImage);
			app.post('/dashboard/pages/updateConfigurables', dashboardpages.updateConfigurables);
			
			app.get('/dashboard/analytics', dashboardanalytics.getInfo);
			app.post('/dashboard/analytics/googleAnalyticsCode', dashboardanalytics.googleAnalyticsCode);
			app.put('/dashboard/analytics/addMetric', dashboardanalytics.addMetric);
			app.delete('/dashboard/analytics/deleteMetric', dashboardanalytics.deleteMetric);
			app.post('/dashboard/analytics/metricsAuth', dashboardanalytics.metricsAuth);
			
			app.get('/dashboard/datamanager', dashboarddatamanager.getInfo);
			
			app.get('/dashboard/api/json', dashboardbasic.getAllJSON);
			app.get('/dashboard/api/json/:endpoint', function(req, res) {
				res.redirect('/dashboard/'+req.params.endpoint+'?pid='+req.query.pid+'&access_token='+req.query.access_token);
			});
			
			app.delete('/aws/route53/api/DeleteHostedZone', aws.DeleteHostedZone);
			app.put('/aws/route53/api/CreateHostedZone', aws.CreateHostedZone);
			app.get('/aws/route53/api/GetHostedZone', aws.GetHostedZone);
			app.put('/aws/route53/api/CreateResourceRecord', aws.CreateResourceRecord);
			app.delete('/aws/route53/api/DeleteResourceRecord', aws.DeleteResourceRecord);
			app.get('/aws/route53/api', aws.ListHostedZones);
			
			app.get('/dashboard/templates', templates.previewBasic);
			app.get('/dashboard/templates/preview', templates.previewFullPage);
			app.get('/dashboard/templates/:pageId', function(req,res,next){res.sendfile('public/tpl/404-preview.html')});
			
			
			app.get('/aws/route53', function(req, res){
					
				res.sendfile('public/aws/route53/index.html', {
				  
				});
				
			});
			
			app.get('/promo/:pid', function(req, res){
					
				res.sendfile('public/promo/index.html' , {
					data: {pid: req.param.pid}
				});
				
				
			});
	
		}
		
		app.get('/auth/skip', function(req, res){
					
			res.render('../public/tpl/200-facebook-skipped.html', { next: req.query.next});
			return;
			
		});
		
		app.get('/fb-static/channel', function(req, res){
					
			res.render('../public/tpl/200-facebook-channel.html');
			return;
			
		});
				
		return next();
		
	});
	
	

}

