window.PromoTitleView = Backbone.View.extend({

    initialize: function (options) {
		this.options = options || {};	
		
        var view = this;
		utils.loadTemplate(['PromoTitleView'], function() {
	
      	  	  view.render();
			  _.delay(function(){
				 $("#promoTitle").focus();
			  },50);
			
		})
    },
	
	events: {
		'keyup #promoTitle' : "promoTitleKeyUp",
        "click .saveBtn"   : "saveNewPromo",
		"submit #addPromoForm" : function(event){event.preventDefault();}
	},
	
	promoTitleKeyUp: function(event){
				
		if($.trim($(event.target).val()).length>0){
			
			$(".saveBtn", this.el).prop("disabled", false);
			
		}else{
			
			$(".saveBtn", this.el).prop("disabled", true);
			
		}
		
	},
	
	saveNewPromo: function(){
		
		$.fn.serializeObject = function()
		{
		   var o = {};
		   var a = this.serializeArray();
		   $.each(a, function() {
			   if (o[this.name]) {
				   if (!o[this.name].push) {
					   o[this.name] = [o[this.name]];
				   }
				   o[this.name].push(this.value || '');
			   } else {
				   o[this.name] = this.value || '';
			   }
		   });
		   return o;
		};
		
		
		var addPromoSuccess = function(model, response){
			
			window.location = '/promo/'+response.id;
			
		};
		
		var addPromoError = function(model, response, xhr, test){
			
			response.responseText = $.parseJSON(response.responseText);
								
			$(".alert").remove();
					
			var errAlert = $('<div class="alert alert-danger fade in" id="addPromoFail" />');
				errAlert.append('<button type="button" class="close" data-dismiss="alert">×</button>')
				errAlert.append(response.responseText.error)
				errAlert.prependTo($('#addPromoForm:eq(0)'));
				
				
			var errFields = response.responseText.field.split(',');
				for(i=0;i< errFields.length; i++){
				
					$("#addPromoForm").find('[name="'+errFields[i]+'"]').parents('.form-group').addClass('has-error');
					
			}
						
			app.once("all", function(event){
				
				$("#addPromoFail").remove();
															
			});
			
		};
		
		var activeElem = $(".promoSelection .thumbnails:visible .promoType.active");
		var promoComponents = [];
		
		if(activeElem.length > 0){
			
			
			activeElem.each(function(){
			 
			 	promoComponents.push($(this).find('div:eq(0)').data('typeid'));
					
			})

		}
		
		var addPromoFormObj = $("#addPromoForm").serializeObject();
		
		addPromoFormObj['promoType'] = promoComponents;
		
		this.model.save(addPromoFormObj, {wait:true, success: addPromoSuccess, error: addPromoError});
		
	},

    render: function () {
		
        $(this.el).html(this.template());
        return this;
    }

});
