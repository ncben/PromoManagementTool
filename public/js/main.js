var AppRouter = Backbone.Router.extend({

    routes: {
        ""                  : "home",
		"promo/browse"		: "listPromo",
		"promo/browse/(:pid)"		: "promoDashboard",
		"promo/add"    : "addPromo",
        "login/:next" : "loginRedirect",
		"login" : "login",
		"403(/:next)" : "403",
		"manage" : "manage",
		"manage/(:p1)(/:p2)(/:p3)(/:p4)" : function(p1,p2,p3,p4){
			
			window.nextDeepRoute = ((typeof p1 != 'undefined' && p1 != null) ? '/'+encodeURIComponent(p1) : '') + 
			((typeof p2 != 'undefined' && p2 != null) ? '/'+encodeURIComponent(p2) : '') + 
			((typeof p3 != 'undefined' && p3 != null) ? '/'+encodeURIComponent(p3) : '') + 
			((typeof p4 != 'undefined' && p4 != null) ? '/'+encodeURIComponent(p4) : '') ;
						
			app.navigate('manage',true);
		},
		"profile" : "profile",
		"profile/(:p1)(/:p2)(/:p3)(/:p4)" : function(p1,p2,p3,p4){
			window.nextDeepRoute = (typeof p1 != 'undefined'  && p1 != null) ? '/'+encodeURIComponent(p1) : '' + 
			(typeof p2 != 'undefined' && p2 != null) ? '/'+encodeURIComponent(p2) : '' + 
			(typeof p3 != 'undefined' && p3 != null) ? '/'+encodeURIComponent(p3) : '' + 
			(typeof p4 != 'undefined' && p4 != null) ? '/'+encodeURIComponent(p4) : '' ;
			app.navigate('profile',true);
		}
		
    },

    initialize: function () {
		
        this.headerView = new HeaderView();
        $('.header').eq(0).html(this.headerView.el);
		
		//Initialize auth
		window.loginView = new LoginView();
		
        $(function(){
			$.ajaxSetup({
				statusCode: {
					401: function(){
						app.navigate('login/'+encodeURIComponent(window.location.pathname+window.location.hash), {trigger: true, replace: true});
					},
					403: function() {
						// 403 -- Access denied
						app.navigate('403/'+encodeURIComponent(window.location.pathname+window.location.hash), {trigger: true, replace: true});
						
					}
				}
			});
			$('body').append(loginView.render().el);
			
		})
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

    home: function (id) {
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#content').html(this.homeView.el);
        this.headerView.selectMenuItem('home-menu');
    },
	
	manage: function(){
		
		var manage = new ManageUser();
		
		if(!window.ManageView){
			getScript('js/views/manage.js', function(){
				utils.loadTemplate(['ManageView'], function() {
					manage.fetch({success: function(){
						$("#content").html(new ManageView({model: manage, collection: manage}).el);
					}});
				})
			});
		}else{
			
			manage.fetch({success: function(){
				$("#content").html(new ManageView({model: manage, collection: manage}).el);
			}});
			
		}
        this.headerView.selectMenuItem('manage-menu');
	},
	
	profile: function(){
		
		var profile = new Profile();
		
		if(!window.ProfileView){
			getScript('js/views/profile.js', function(){
				utils.loadTemplate(['ProfileView'], function() {
					profile.fetch({success: function(){
						$("#content").html(new ProfileView({model: profile, collection: profile}).el);
					}});
				})
			});
		}else{
			
			profile.fetch({success: function(){
				$("#content").html(new ProfileView({model: profile, collection: profile}).el);
			}});
			
		}
		
        this.headerView.selectMenuItem('profile-menu');
		
	},

	listPromo: function() {
        var promoList = new PromoCollection();
        promoList.fetch({success: function(){
            $("#content").html(new PromoListView({model: promoList, collection: promoList}).el);
        }});
        this.headerView.selectMenuItem('browse-menu');
    },
	
	promoDashboard: function(pid){
		
		var promoDetails = new PromoDashboardCollection({id: pid});
        promoDetails.fetch({success: function(){
			getScript('js/views/promodashboard.js', function(){
          	  $("#content").html(new PromoDashboardView({model: promoDetails, collection: promoDetails}).el);
			  getScript('js/application.js', function(){})
			})
        }});
        this.headerView.selectMenuItem('browse-menu');
	},

    promoDetails: function (id) {
        var promo = new Promo({id: id});
        promo.fetch({success: function(){
            $("#content").html(new PromoView({model: promo}).el);
        }});
        this.headerView.selectMenuItem('browse-menu');
    },

	addPromo: function() {
		
        window.promoTypes = new PromoComponent();
		
		promoTypes.comparator = 'seq';
		
        promoTypes.fetch().success(function(){
			
			getScript('js/views/promocomponent.js', function(){
     	 	  $('#content').html(new PromoComponentView({model: promoTypes, collection: promoTypes}).el);
			})
			
		});
        this.headerView.selectMenuItem('add-menu');
	}
});

utils.loadTemplate(['LoginView','HomeView', 'HeaderView', 'PromoListItemView','PromoListView'], function() {
    app = new AppRouter();
    Backbone.history.start();
});