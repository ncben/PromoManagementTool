
window.PromoDashboardComponentFBWallAPIView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
				
		
    },
	
	events: {

		
	},
	
    render: function () {
		
		
        $(this.el).html(this.template());
		$('.main-content').html(this.el);

		window['genericInit']();	
				 				
		var el = this.$el;	
				 		
	$('#fanpageurl').editable({
        type: 'text',
        pk: 1,
        name: 'fanpageurl',
        title: 'Enter fanpage URL'
    });
	$('#postid').editable({
        type: 'text',
        pk: 1,
        name: 'postid',
        title: 'Enter Post ID #'
    });
	$('#datatype').editable({
        pk: 1,
        limit: 3,
        source: [
            {value: 1, text: 'Likes'},
            {value: 2, text: 'Comments'}
        ]
    });
	
    }
	
});


