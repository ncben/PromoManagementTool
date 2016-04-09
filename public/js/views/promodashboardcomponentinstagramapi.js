
window.PromoDashboardComponentInstagramAPIView = Backbone.View.extend({
	
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
				 		
	$('#hashtags').editable({
        inputclass: 'input-large',
        select2: {
            tags: [],
            tokenSeparators: [",", " "]
        }
    });
	$('#handles').editable({
        inputclass: 'input-large',
        select2: {
            tags: [],
            tokenSeparators: [",", " "]
        }
    });
	$('#datatype').editable({
        pk: 1,
        limit: 3,
        source: [
            {value: 1, text: 'Images'},
            {value: 2, text: 'Videos'}
        ]
    });
	
    }
	
});


