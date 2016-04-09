var DashboardRouter = Backbone.Router.extend({

    routes: {
		""		: "home",
		"analytics"		: "analytics",
		"basic"		: "basic",
        "login/:next" : "loginRedirect",
		"login" : "login",
		"fb-tab" : "fbTab",
		"403(/:next)" : "403",
		"pages" : "pages",
		"reg-form" : "regForm",
		"photo-contest" : "photoContest",
		"video-contest" : "videoContest",
		"essay-contest" : "essayContest",
		"gallery" : "gallery",
		"voting" : "voting",
		"instant-win" : "instantWin",
		"pinterest-api" : "pinterestAPI",
		"twitter-api" : "twitterAPI",
		"instagram-api" : "instagramAPI",
		"facebook-wall-api" : "facebookWallAPI",
		"rest-api" : "restAPI",
		"screening-tool" : "screeningTool",
		"judging-tool" : "screeningTool",
		"data-manager" : "dataManager",
		"email-manager" : "emailManager",
		"file-manager" : "fileManager"
    },

    initialize: function () {
		
		onloadInit();
		
        this.headerView = new HeaderView();
        $('.header').eq(0).html(this.headerView.el);
        this.headerView.selectMenuItem('browse-menu');
		
		this.sidebarView = new PromoDashboardSidebarView();
		$('.primary-sidebar').eq(0).html(this.sidebarView.el);
		 
		var sidebarCollection = new PromoDashboardSidebarCollection();
				
		//Initialize auth
		window.loginView = new LoginView();
		
        $(function(){
			$.ajaxSetup({
				statusCode: {
					401: function(){

						app.navigate('login/'+encodeURIComponent('/'+decodeURIComponent(window.location.hash).split('/')[decodeURIComponent(window.location.hash).split('/').length-1]), {trigger: true, replace: true});
					},
					403: function() {
						app.navigate('403/'+encodeURIComponent('/'+decodeURIComponent(window.location.hash).split('/')[decodeURIComponent(window.location.hash).split('/').length-1]), {trigger: true, replace: true});
						
					},
					503: function(xhr) {
						
						return Growl.error({
							title: 'Service Unavailable',
							text: xhr.responseJSON.error
						});
						
					}
				}
			});

			$('body').append(loginView.render().el);
			
		})
		
		sidebarCollection.fetch({ data: $.param({pid: window['pid']})}).success($.proxy(function(response){
		
			this.sidebarView.detachComponents(response.type);	
			
		},this));
		
    },
	
	403: function(next) {
	
		$("#loginModal").modal();
		$("#loginModal .alert-info").show();
		$("#loginModal .alert-danger").hide();
		$("#loginModal .alert-warning").hide();
		window.nextNoTrigger = next;

    },

	loginRedirect: function(next) {
					
		$("#loginModal").modal();
		$("#loginModal .alert-info").hide();
		$("#loginModal .alert-danger").hide();
		$("#loginModal .alert-warning").show();
		window.nextTrigger = next;

    },
	
	login: function() {
			
		$("#loginModal").modal();
		$("#loginModal .alert-info").hide();
		$("#loginModal .alert-danger").hide();
		$("#loginModal .alert-warning").hide();
		window.nextTrigger = '/';

    },

    home: function () {
		
        new PromoDashboardHomeView();
		
		this.sidebarView.selectMenuItem('dashboard-menu');
		
    },
	
	basic: function () {
		
        var basicCollection = new PromoDashboardBasicCollection();
		
		basicCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardBasicView({model: basicCollection, collection: basicCollection});		
			
		})
			
		this.sidebarView.selectMenuItem('basic-menu');
		
    },
	
	
	pages: function () {
				
		var pagesCollection = new PromoDashboardPagesCollection();
		
		pagesCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardPagesView({model: pagesCollection, collection: pagesCollection});		
			
		})
		
		this.sidebarView.selectMenuItem('pages-menu');
		
    },
	
	regForm: function () {
		
		var regFormCollection = new PromoDashboardRegFormCollection();
		
		regFormCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardComponentRegFormView({model: regFormCollection, collection: regFormCollection});		
			
		})
	
		this.sidebarView.selectMenuItem(['reg-form-menu','components-menu']);
		
    },
	
	analytics: function () {
		
		var analyticsCollection = new PromoDashboardAnalyticsCollection();
		
		analyticsCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardAnalyticsView({model: analyticsCollection, collection: analyticsCollection});		
			
		})
			
		        		
		this.sidebarView.selectMenuItem('analytics-menu');
		
    },
	
	fbTab:  function () {
		
		var fbTabCollection = new PromoDashboardFBTabCollection();
		
		fbTabCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardComponentFacebookTabView({model: fbTabCollection, collection: fbTabCollection});		
			
		})
        		
		this.sidebarView.selectMenuItem(['fb-tab-menu','components-menu']);
    },
	
	photoContest:  function () {
        		
		var photoContestCollection = new PromoDashboardPhotoContestCollection();
		
		photoContestCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardComponentPhotoContestView({model: photoContestCollection, collection: photoContestCollection});		
			
		})
        		
		this.sidebarView.selectMenuItem(['photo-contest-menu','components-menu']);
    },
	
	videoContest:  function () {
		
        var videoContestCollection = new PromoDashboardVideoContestCollection();
		
		videoContestCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardComponentVideoContestView({model: videoContestCollection, collection: videoContestCollection});		
			
		})
        		
		this.sidebarView.selectMenuItem(['video-contest-menu','components-menu']);
    },
	
	essayContest:  function () {
		
		var essayContestCollection = new PromoDashboardEssayContestCollection();
		
		essayContestCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardComponentEssayContestView({model: essayContestCollection, collection: essayContestCollection});		
			
		})
        		
		this.sidebarView.selectMenuItem(['essay-contest-menu','components-menu']);
    },
	
	gallery:  function () {
		
       var galleryCollection = new PromoDashboardGalleryCollection();
		
		galleryCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardComponentGalleryView({model: galleryCollection, collection: galleryCollection});		
			
		})
        		
		this.sidebarView.selectMenuItem(['gallery-menu','components-menu']);
    },
	
	voting:  function () {
        new PromoDashboardComponentVotingView();
        		
		this.sidebarView.selectMenuItem(['voting-menu','components-menu']);
    },
	
	twitterAPI:  function () {
        new PromoDashboardComponentTwitterAPIView();
        		
		this.sidebarView.selectMenuItem(['twitter-api-menu','components-menu']);
    },
	
	instagramAPI:  function () {
        new PromoDashboardComponentInstagramAPIView();
        		
		this.sidebarView.selectMenuItem(['instagram-api-menu','components-menu']);
    },
	
	facebookWallAPI:  function () {
        new PromoDashboardComponentFBWallAPIView();
        		
		this.sidebarView.selectMenuItem(['facebook-wall-api-menu','components-menu']);
    },
	
	instantWin: function(){
		
		Growl.error({
			title: 'This feature is not yet available.',
			text: 'Please check back later.'
		});
		
		$(".main-content").html('<div class="container"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="error-box"><div class="message-small">Whoa! What are you doing here?</div><div class="message-big">404</div><div class="message-small">You are not where you\'re supposed to be</div><div style="margin-top: 50px"><a class="btn btn-blue" href="#"><i class="icon-arrow-left"></i> Back to dashboard</a></div></div></div></div></div>');
		
		this.sidebarView.selectMenuItem(['instant-win-api-menu','components-menu']);
	},
	
	pinterestAPI: function(){

		Growl.error({
			title: 'This feature is not yet available.',
			text: 'Please check back later.'
		});
		
		$(".main-content").html('<div class="container"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="error-box"><div class="message-small">Whoa! What are you doing here?</div><div class="message-big">404</div><div class="message-small">You are not where you\'re supposed to be</div><div style="margin-top: 50px"><a class="btn btn-blue" href="#"><i class="icon-arrow-left"></i> Back to dashboard</a></div></div></div></div></div>');


		this.sidebarView.selectMenuItem(['pinterest-api-api-menu','components-menu']);
	},
	
	restAPI: function(){

		Growl.error({
			title: 'This feature is not yet available.',
			text: 'Please check back later.'
		});
		
		$(".main-content").html('<div class="container"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="error-box"><div class="message-small">Whoa! What are you doing here?</div><div class="message-big">404</div><div class="message-small">You are not where you\'re supposed to be</div><div style="margin-top: 50px"><a class="btn btn-blue" href="#"><i class="icon-arrow-left"></i> Back to dashboard</a></div></div></div></div></div>');
		
		this.sidebarView.selectMenuItem(['rest-api-menu','components-menu']);
	},
	judgingTool: function(){

		Growl.error({
			title: 'This feature is not yet available.',
			text: 'Please check back later.'
		});
		
		$(".main-content").html('<div class="container"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="error-box"><div class="message-small">Whoa! What are you doing here?</div><div class="message-big">404</div><div class="message-small">You are not where you\'re supposed to be</div><div style="margin-top: 50px"><a class="btn btn-blue" href="#"><i class="icon-arrow-left"></i> Back to dashboard</a></div></div></div></div></div>');
		
		this.sidebarView.selectMenuItem(['judging-tool-menu','tools-menu']);
	},
	screeningTool: function(){

		Growl.error({
			title: 'This feature is not yet available.',
			text: 'Please check back later.'
		});
		
		$(".main-content").html('<div class="container"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="error-box"><div class="message-small">Whoa! What are you doing here?</div><div class="message-big">404</div><div class="message-small">You are not where you\'re supposed to be</div><div style="margin-top: 50px"><a class="btn btn-blue" href="#"><i class="icon-arrow-left"></i> Back to dashboard</a></div></div></div></div></div>');
		
		this.sidebarView.selectMenuItem(['screening-tool-menu','tools-menu']);
	},
	dataManager: function(){
		
		var dataManagerCollection = new PromoDashboardToolsDataManagerCollection();
		
		dataManagerCollection.fetch({ data: $.param({pid: window['pid']})}).success(function(){
		
			new PromoDashboardToolsDataManagerView({model: dataManagerCollection, collection: dataManagerCollection});		
			
		})
		        		
		this.sidebarView.selectMenuItem(['data-manager-menu','tools-menu']);
		
		
	},
	emailManager: function(){

		Growl.error({
			title: 'This feature is not yet available.',
			text: 'Please check back later.'
		});
		
		$(".main-content").html('<div class="container"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="error-box"><div class="message-small">Whoa! What are you doing here?</div><div class="message-big">404</div><div class="message-small">You are not where you\'re supposed to be</div><div style="margin-top: 50px"><a class="btn btn-blue" href="#"><i class="icon-arrow-left"></i> Back to dashboard</a></div></div></div></div></div>');
		
		this.sidebarView.selectMenuItem(['email-manager-menu','tools-menu']);
	},
	fileManager: function(){

		Growl.error({
			title: 'This feature is not yet available.',
			text: 'Please check back later.'
		});
		
		$(".main-content").html('<div class="container"><div class="row"><div class="col-md-8 col-md-offset-2"><div class="error-box"><div class="message-small">Whoa! What are you doing here?</div><div class="message-big">404</div><div class="message-small">You are not where you\'re supposed to be</div><div style="margin-top: 50px"><a class="btn btn-blue" href="#"><i class="icon-arrow-left"></i> Back to dashboard</a></div></div></div></div></div>');
		
		this.sidebarView.selectMenuItem(['file-manager-menu','tools-menu']);
	}

});

utils.loadTemplate(['LoginView', 'HeaderView', 'PromoDashboardSidebarView','PromoDashboardHomeView','PromoDashboardAnalyticsView','PromoDashboardBasicView','PromoDashboardBasicURLItemView','PromoDashboardComponentFacebookTabView','PromoDashboardPagesView','PromoDashboardPagesDesignView','PromoDashboardComponentRegFormView','PromoDashboardComponentRegFormEligibilityItemView','PromoDashboardComponentPhotoContestView','PromoDashboardComponentPhotoContestItemView','PromoDashboardComponentVideoContestView','PromoDashboardComponentVideoContestItemView','PromoDashboardComponentEssayContestView','PromoDashboardComponentEssayContestItemView','PromoDashboardComponentRegFormEntryPeriodItemView','PromoDashboardComponentRegFormEntryLimitItemView','PromoDashboardComponentGalleryView','PromoDashboardComponentGalleryItemView','PromoDashboardComponentVotingView','PromoDashboardComponentTwitterAPIView','PromoDashboardComponentInstagramAPIView','PromoDashboardComponentFBWallAPIView','PromoDashboardComponentRegFormNewFieldView','PromoDashboardToolsDataManagerView','PromoDashboardComponentRegFormReferralEntryLimitItemView'], function() {
    app = new DashboardRouter();
	
	app.on("route", function(route, params){
									
		if(route != 'login' && route != 'loginRedirect'){
			$('.modal:not(#loginModal)').remove();
			$("body").removeClass('modal-open');
			$(".modal-backdrop").remove();
		}
		
	})
    Backbone.history.start();
});

