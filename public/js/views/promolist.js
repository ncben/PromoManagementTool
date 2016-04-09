window.PromoListView = Backbone.View.extend({

    initialize: function (options) {
		this.options = options || {};	
        this.render();
    },
	
	events: {
		
		'submit .searchPromoForm' : 'searchPromoType',
		'click .clearSearchBttn' : 'clearSearch'
		
	},
	
	clearSearch: function(event){
		
		$(event.target).find(".searchPromoType").val('');
		$(".promoSelection .thumbnails:visible .promoType").show();
		$(event.target).hide();
		
	},
	
	searchPromoType: function(event){
		
		event.preventDefault();
		
		var searchKeyword = $.trim($(event.target).find(".searchPromoType").val());
				
		if(searchKeyword.length > 0){
			
			searchKeyword = searchKeyword.split(/\s/);;
			
			$(".promoSelection .thumbnails:visible .promoType").hide();
		
			_.each(searchKeyword, function(keyword, i){
			
				if($.trim(keyword)){
					$(".promoSelection .thumbnails:visible .promoType").filter(function(){
						
						return ($(this).text().toLowerCase().indexOf(keyword) !== -1);
					
					}).show();
					
					$(event.target).find('.clearSearchBttn').show();
					
				}
		
			})
		}else{
			
			$(".promoSelection .thumbnails:visible .promoType").show();
			$(event.target).find('.clearSearchBttn').hide();
		}
		
	 },

    render: function () {
		
        $(this.el).html(this.template());
		 				
		var el = this.$el;	
				 		
		this.collection.each(function(promo,i){
									 
            $('.thumbnails', el).append(new PromoListItemView({model: promo}).render().el);
			
			
        });

        return this;
    }

});

window.PromoListItemView = Backbone.View.extend({

	className: 'well promoType',
	
	events: {
		'click' : function(event){
			event.preventDefault();
			
			var promoId = $(event.target).data('id') || $(event.target).parents('.dataCache').data('id') || $(event.target).find('.dataCache').data('id');
			promoId = promoId.split(':');
			promoId.shift();
			promoId = promoId.join(':');
			
			window.location = '/promo/'+promoId;
			
		}	
	},

    render: function () {
				
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});