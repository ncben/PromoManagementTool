window.PromoComponentView = Backbone.View.extend({
	
    initialize: function () {
		
		var view = this;
		
		utils.loadTemplate(['PromoComponentView','PromoComponentItemView'], function() {
	
      	  	  view.render();
			
		})
    },
	
	events: {
		'click .promoTypeBtns a' : function(event){
			 event.preventDefault();
			 if($(event.target).hasClass('active'))return;
			 $(event.target).parents('.promoTypeBtns').find('a').removeClass('active');
			 $(event.target).addClass('active');
			 _.delay(function(){
				 if($(".promoSelection .thumbnails:visible .promoType.active").length > 0){
					$(".promoSelection .nextBtn").prop("disabled",false);
				}else{
					$(".promoSelection .nextBtn").prop("disabled",true);
				}
			 }, 0);
		},
		'click .promoTypeBtns .websiteTypeBttn' : function(event){ 
			$('.promoSelection .thumbnails').hide();
			$('.promoSelection .websiteType').show();
		},
		'click .promoTypeBtns .apiTypeBttn' : function(event){ 
			$('.promoSelection .thumbnails').hide();
			$('.promoSelection .apiType').show();
		},
		'click .promoTypeBtns .websiteApiTypeBttn' : function(event){ 
			$('.promoSelection .thumbnails').hide();
			$('.promoSelection .websiteApiType').show();
		},
		'submit .searchPromoForm' : 'searchPromoType',
		'click .clearSearchBttn' : 'clearSearch',
		'click .nextBtn' : 'next'

	},
	
	next: function(event){
		
		var activeElem = $(".promoSelection .thumbnails:visible .promoType.active");
				
		if(activeElem.length > 0){
			
       	    app.navigate('promo/add/title',{trigger: true});	
		}
			
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
		
				 		
		_.each(this.collection.where({'category':'website'}), function(promo,i){
						 
            $('.thumbnails.websiteType', el).append(new PromoComponentItemView({model: promo}).render().el);
            $('.thumbnails.websiteApiType', el).append(new PromoComponentItemView({model: promo}).render().el);
			
			
        });
		
		
		_.each(this.collection.where({'category':'api'}), function(promo,i){
						 
            $('.thumbnails.apiType', el).append(new PromoComponentItemView({model: promo}).render().el);
            $('.thumbnails.websiteApiType', el).append(new PromoComponentItemView({model: promo}).render().el);
        });
			
        return this;
    }

});



window.PromoComponentItemView = Backbone.View.extend({

    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },
	
	events: {
        "click"   : "selectItem"
    },
	
	className: 'well promoType',
	
	
	selectItem: function(event){
		
		
		if($(event.target).hasClass('promoType')){
			
			if($(event.target).hasClass('active'))$(event.target).removeClass('active');
				else $(event.target).addClass('active');
			
		}else{
		
			if($(event.target).parents('.promoType').hasClass('active'))$(event.target).parents('.promoType').removeClass('active');
				else $(event.target).parents('.promoType').addClass('active');
		}
		
		if($(".promoSelection .thumbnails:visible .promoType.active").length > 0){
			
			$(".promoSelection .nextBtn").prop("disabled",false);
			
		}else{
			$(".promoSelection .nextBtn").prop("disabled",true);
		}
		
	},
	
	
	close: function(){
		
		this.unbind();
		this.remove();
		
	},

    render: function () {
						
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});