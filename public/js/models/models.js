window.ManageUser = Backbone.Model.extend({

    urlRoot: "/manage/user",
    idAttribute: "username",
	
	methodToURL: {
		'read': '/manage/user',
		'create': '/manage/user',
		'update': '/manage/user',
		'delete': '/manage/user',
		'suspend': '/manage/user/suspend',
		'group': '/manage/user/groups',
		'reactivate': '/manage/user/reactivate'
	},

	sync: function(method, model, options) {
		
		options = options || {};
		options.url = model.methodToURL[method.toLowerCase()];
	
		return Backbone.sync.apply(this, arguments);
	}
	
})

window.Profile = Backbone.Model.extend({

    urlRoot: "/profile",
    idAttribute: "username",
	
	methodToURL: {
		'read': '/profile',
		'update': '/profile',
		'delete': '/profile',
		'switch-group': '/profile/switch-group',
		'change-password': '/profile/password'
	},

	sync: function(method, model, options) {
		
		options = options || {};
		options.url = model.methodToURL[method.toLowerCase()];
	
		return Backbone.sync.apply(this, arguments);
	}
	
})


window.Promo = Backbone.Model.extend({

    urlRoot: "/promo/add",
    idAttribute: "id"


});


window.PromoDashboard = Backbone.Model.extend({

    urlRoot: "/promo/browse",
    idAttribute: "id"


});

window.PromoDashboardSidebarCollection = Backbone.Collection.extend({

    url: "/dashboard/basic/types"

});




window.PromoDashboardCollection = Backbone.Collection.extend({

    model: PromoDashboard,
    url: "/promo/browse/"

});

window.PromoDashboardBasic = Backbone.Model.extend({

    urlRoot: "/dashboard/basic",
    idAttribute: "path"

});


window.PromoDashboardBasicCollection = Backbone.Collection.extend({

    model: PromoDashboardBasic,
	url: function(){
		
		var urlFragment = (typeof this.pluck('path').slice(-1)[0]  != 'undefined') ? this.pluck('path')[0].slice(-1)[0]  : '';
		
		
		if(urlFragment == '/')urlFragment='';
        return "/dashboard/basic" + urlFragment;
	},
	idAttribute: "path"

});


window.PromoDashboardAnalytics = Backbone.Model.extend({

    urlRoot: "/dashboard/analytics",
    idAttribute: "path"

});


window.PromoDashboardAnalyticsCollection = Backbone.Collection.extend({

    model: PromoDashboardAnalytics,
	url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/dashboard/analytics" + urlFragment;
	},
	idAttribute: "path"

});


window.PromoDashboardToolsDataManager = Backbone.Model.extend({

    urlRoot: "/dashboard/datamanager",
    idAttribute: "path"

});


window.PromoDashboardToolsDataManagerCollection = Backbone.Collection.extend({

    model: PromoDashboardToolsDataManager,
	url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/dashboard/datamanager" + urlFragment;
	},
	idAttribute: "path"

});


window.PromoDashboardRegForm = Backbone.Model.extend({

    urlRoot: "/dashboard/reg-form",
    idAttribute: "path"

});


window.PromoDashboardRegFormCollection = Backbone.Collection.extend({
	
    model: PromoDashboardRegForm,
    url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/dashboard/reg-form" + urlFragment;
	},
	idAttribute: "path"

});



window.PromoDashboardFBTab = Backbone.Model.extend({

    urlRoot: "/dashboard/fb-tab",
    idAttribute: "path"

});


window.PromoDashboardFBTabCollection = Backbone.Collection.extend({
	
    model: PromoDashboardFBTab,
    url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/dashboard/fb-tab" + urlFragment;
	},
	idAttribute: "path"

});


window.PromoDashboardEssayContest = Backbone.Model.extend({

    urlRoot: "/dashboard/essay-contest",
    idAttribute: "path"

});


window.PromoDashboardEssayContestCollection = Backbone.Collection.extend({
	
    model: PromoDashboardEssayContest,
    url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/dashboard/essay-contest" + urlFragment;
	},
	idAttribute: "path"

});



window.PromoDashboardPhotoContest = Backbone.Model.extend({

    urlRoot: "/dashboard/photo-contest",
    idAttribute: "path"

});


window.PromoDashboardPhotoContestCollection = Backbone.Collection.extend({
	
    model: PromoDashboardPhotoContest,
    url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/dashboard/photo-contest" + urlFragment;
	},
	idAttribute: "path"

});


window.PromoDashboardVideoContest = Backbone.Model.extend({

    urlRoot: "/dashboard/video-contest",
    idAttribute: "path"

});


window.PromoDashboardVideoContestCollection = Backbone.Collection.extend({
	
    model: PromoDashboardVideoContest,
    url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/dashboard/video-contest" + urlFragment;
	},
	idAttribute: "path"

});

window.PromoDashboardGallery = Backbone.Model.extend({

    urlRoot: "/dashboard/gallery",
    idAttribute: "path"

});


window.PromoDashboardGalleryCollection = Backbone.Collection.extend({
	
    model: PromoDashboardGallery,
    url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/dashboard/gallery" + urlFragment;
	},
	idAttribute: "path"

});


window.PromoDashboardPages = Backbone.Model.extend({

    urlRoot: "/dashboard/pages",
    idAttribute: "path"

});


window.PromoDashboardPagesCollection = Backbone.Collection.extend({
	
    model: PromoDashboardPages,
    url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/dashboard/pages" + urlFragment;
	},
	idAttribute: "path"

});


window.PromoCollection = Backbone.Collection.extend({

    model: Promo,

    url: "/promo/all"

});


window.PromoComponent = Backbone.Collection.extend({

    model: Promo,

    url: "/promo/add"

});

window.route53 = Backbone.Model.extend({

    urlRoot: "/aws/route53/api",
    idAttribute: "path"
	
})


window.route53Collection = Backbone.Collection.extend({

    model: route53,
    url: function(){
		
		var urlFragment = (typeof this.pluck('path')[0] != 'undefined') ? this.pluck('path')[0] : '';
        return "/aws/route53/api" + urlFragment;
	},
    idAttribute: "path"
	
})