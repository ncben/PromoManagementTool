window.PromoDashboardSidebarView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },
	

    render: function () {
        $(this.el).html(this.template());
	
        return this;
    },
	
	selectMenuItem: function (menuItem) {
				
        $('.primary-sidebar .nav li').removeClass('active');
        if (menuItem) {
			if(typeof menuItem == 'string'){
           	    $('.primary-sidebar .' + menuItem).addClass('active');
			}else if(typeof menuItem == 'object'){
				
				_.each(menuItem, function(obj){
           		    $('.primary-sidebar .' + obj).addClass('active');
					$('.primary-sidebar .' + obj).find('.collapse').collapse('show');
				})
				
			}
        }
    },
	
	detachComponents: function(types){
			
		if(types){
						
			var el = this.$el;
					
			$(".componentsMenu li",el).show().each(function(){
			
				if(types.indexOf($(this).children('a').data('type-id').toString()) === -1){
				
					$(this).hide();
					
				}	
				
			})
			
		}
		
		if($(".componentsMenu li",el).filter(function(){return $(this).css('display') != 'none'}).length < 1){
			
			$(".components-menu").hide();
			
		}else{
		
			$(".components-menu").show();	
		}
		
	}


});