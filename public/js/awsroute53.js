var route53Router = Backbone.Router.extend({

    routes: {
		""		: "ListHostedZones",
		"CreateHostedZone"		: "CreateHostedZone",
		"GetHostedZone/(:HostedZoneId)"		: "GetHostedZone",
		"addResourceRecord/(:HostedZoneId)"		: "addResourceRecord",
        "login/:next" : "loginRedirect",
		"403(/:next)" : "403"
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
						app.navigate('login/'+encodeURIComponent('/'+window.location.hash), {trigger: true, replace: true});
					},
					403: function() {
						app.navigate('403/'+encodeURIComponent('/'+window.location.hash), {trigger: true, replace: true});
						
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
	
	GetHostedZone: function(HostedZoneId){
		
		var awsCollection = new route53Collection();
		
		
		awsCollection.fetch({ data: $.param({'HostedZoneId': HostedZoneId})}).success(function(){
		
			$("#content").html(new Route53ListResourceRecordSetsView({model: awsCollection, collection: awsCollection}).el);

			
		})
		
	},
	
	addResourceRecord:  function(HostedZoneId){
		
		var awsCollection = new route53Collection({path: '/GetHostedZone'});
		var awsModel = new route53();
		
		awsCollection.fetch({ data: $.param({'HostedZoneId': HostedZoneId})}).success(function(){
		
			$("#content").html(new Route53AddResourceRecordView({model: awsModel, collection: awsCollection}).el);

			
		})
		
	},
	
	CreateHostedZone: function(){
		
		var awsModel = new route53();
		$("#content").html(new Route53AddHostedZoneView({model: awsModel}).el);
	},

	ListHostedZones: function () {
		
		var awsCollection = new route53Collection();
		
		awsCollection.fetch({ data: $.param({})}).success(function(){
		
			$("#content").html(new Route53View({model: awsCollection, collection: awsCollection}).el);

			
			
		})
			
    },
	

});

utils.loadTemplate(['LoginView', 'HeaderView','Route53View','Route53HostedZonesView','Route53AddHostedZoneView','Route53ListResourceRecordSetsView','Route53ListResourceRecordSetsItemView','Route53AddResourceRecordView'], function() {
    app = new route53Router();
    Backbone.history.start();
});

