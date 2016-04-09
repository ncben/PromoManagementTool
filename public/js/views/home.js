window.HomeView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },
	
	events: {
		
		'click .loginBttn' : function(){app.navigate('login', {trigger:true});}
		
	},

    render: function () {
        $(this.el).html(this.template());
        return this;
    }

});