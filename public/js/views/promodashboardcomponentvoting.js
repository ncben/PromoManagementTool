
window.PromoDashboardComponentVotingView = Backbone.View.extend({
	
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
				 		
        
	$('#votetext').editable({
        type: 'text',
        pk: 1,
        name: 'votetext',
        title: 'Enter vote button text'
    });
	
	
	
	
    }
	
});


