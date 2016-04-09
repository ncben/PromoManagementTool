 var AddPromoRouter = Backbone.Router.extend({

			routes: {
				"promo/add/component"   : "addComponent",
				"promo/add/title"  : "addTitle",
			},
		
			addComponent :  function(){
			
				app.addPromo();
				
			},
			
			addTitle : function(){
			
				if($(".promoSelection .thumbnails:visible .promoType.active").length < 1){
					
					app.navigate("promo/add/component",{trigger:true});
					return;
					
				}
					
				getScript('js/views/promotitle.js', function(){
					
					var promo = new Promo();
					$(".nextBtn").replaceWith(new PromoTitleView({model: promo}).el);
					
				})
				
			}
		
 })

 new AddPromoRouter();
