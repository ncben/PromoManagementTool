
window.PromoDashboardComponentEssayContestView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
				
		
    },
	
	
	events: {

		'click .addNewEssayBttn': 'addNewEssayBttn',
		'click #deleteEssayItemModal .confirm' : 'deleteEssayItem',
		
	},
	
	deleteEssayItem: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = $.proxy(function(model, response){
			
			if(response && response.essayItemId){
			
				var deleteObj = $(".essayItems .dataCache").filter(function(){
					
					return $(this).data('id') == response.essayItemId;
					
				}).parents('.essayOptionsContainer');
				
				deleteObj.remove();
				
				$(".essayItems").empty();
								
				$.proxy(this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.populateEssayItem(true);
					
				}, this)}), this);
								
				
			}else deleteFail();
			
			
		}, this);
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'essayItem'});
		
		if($("#deleteEssayItemModal").data('id')){
			
			this.collection.first().destroy({data: { id: $("#deleteEssayItemModal").data('id'), pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
			
		}else{
			
			 $(".essayItems .dataCache").filter(function(){
					
					return !$(this).data('id');
					
				}).parents('.essayOptionsContainer').remove();
		}
		
		$("#deleteEssayItemModal").modal('hide');
		
	
		
	},
	
	addNewEssayBttn: function(event){
		
		event.preventDefault();
					
		$('.essayItems').append(new PromoDashboardComponentEssayContestItemView({model: this.model, collection: this.collection, essayItem: {el: {'essay-height': 150, 'essay-height-adjustable': 0, 'essay-required': 1, 'essay-description': '', 'limit-type': 'character', 'limit-number-min': '0',  'limit-number-max': '0', 'essay-counter': 'desc', 'trim-text': 0},  key: ''}, reinit: true}).el);
				
		
		setTimeout(function(){
			
			if($(".essayOptionsContainer").length > 0){
			
				$(".essayOptionsContainer:last").scrollintoview();
				
			}
			
		},0);
		
		
	},
	
	populateEssayItem: function(reinit){
		
		var el = this.$el;	
				
		var essayItem = this.collection.pluck('essayItem')[0];
		
		essayItem = _(essayItem).sortBy(function(essayItemEl, key) {
			
			essayItem[key].key = key;
			return essayItemEl.key || '0';
		});
		
		_.each(essayItem, $.proxy(function(essayItemEl, key){
						
			 $('.essayItems', el).append(new PromoDashboardComponentEssayContestItemView({model: this.model, collection: this.collection, essayItem: {el: essayItemEl, key: essayItemEl.key}, reinit: (reinit ? true : false)}).el);
			
		}), this);
		
		
	},
	
    render: function () {
		
        $(this.el).html(this.template());
				 				
		var el = this.$el;			
		this.populateEssayItem();
		
		$('.main-content').html(this.el);

		window['genericInit']();	
		
		return this;
    }
	
});



window.PromoDashboardComponentEssayContestItemView = Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.render();
		
    },	
		
	events: {
		
		'click .removeEssayItem' : function(event){
			
			event.preventDefault();
			
			$("#deleteEssayItemModal")
			.data('id', $(event.target).parents('.essayOptionsContainer').find('.dataCache').data('id'))
			.modal('show');
			
		},
		'change .essayRequiredSwitch' : 'essayRequiredSwitch',
		'change .essayHeightAdjustableSwitch' : 'essayHeightAdjustableSwitch',
		'change .essayTrimTextSwitch' : 'essayTrimTextSwitch',
		'click .essayDescriptionItem .saveBttn' : 'saveEssayDescription'
		
		
	},
	
	initEssayDescription: function(){
		var el = this.$el;	
		
		if(this.options.essayItem.el['essay-description']){
			
			$(".essayDescription", el).val(this.options.essayItem.el['essay-description']);
			$(".essayDescriptionDisplay", el).html(this.options.essayItem.el['essay-description']);
		}
		
		$(".essayDescriptionDisplay", el).on("click", function() {
						
		  $(this).hide();
		  $(this).closest(".closable-chat-box").addClass("open");
		  
		  
		  $(this).parents('.essayDescriptionItem').find('.actions').show();
		  $(this).siblings('.essayDescription').show().wysihtml5({
			"font-styles": true,
			"emphasis": true,
			"lists": true,
			"html": false,
			"link": true,
			"image": true,
			"color": true,
			"stylesheets": ['/css/wysiwyg-color.css']
		  });
		});
		
		
	},
	
	saveEssayDescription: function(event){
		
		event.preventDefault();
		
		
		$.ajax({
			url: '/dashboard/essay-contest/essayItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'essay-description', value: $(event.target).parents('.essayDescriptionItem').find('.essayDescription').val(), pid: window['pid'], essayItemId: $(event.target).parents('.essayOptionsContainer').find('.dataCache').data('id')},
			success: $.proxy(function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.essayItemId){
					
					
					 $(event.target).parents('.essayDescriptionItem').find('.wysihtml5-toolbar, .wysihtml5-sandbox').remove().end().find('.actions').hide().end().find('.essayDescriptionDisplay').show().html($(event.target).parents('.essayDescriptionItem').find('.essayDescription').val());
					 
					return Growl.success({title: 'Successfully updated!', text: 'Essay description has been updated.'});
					
				}
				
				
				
			}, event),
			 statusCode: {
				500: function(xhr) {
				  	return Growl.error({
						title: 'An error occurred!',
						text: xhr.responseJSON.error
					});
				}
			  }
		})
		
	},
	
	initEssaySizeSlider: function(){
		
		var el = this.$el;	
		var model = this.model;
		
		$(".essaySizeSlider.ranged-slider-ui.normal", el).slider({
			
			  range: false,
			  min: 30,
   			  max: 700,
  			  step: 10,
			  value: this.options.essayItem.el['essay-height'],
			  slide: function( event, ui ) {
				  
				
				var slider = $(this);  
				
				var updateEssaySizeSuccess = function(response){
					
					if(response && response.essayItemId){		
					
						slider.parents('.essaySizeItem').data('id',response.essaysizeId);
						
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new essay height has been saved.'
						});
						
					}else updateEssaySizeFail();
					
				}
				
				var updateEssaySizeFail = function(response){
					
					$("#gritter-notice-wrapper").remove();						
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
											
				}
				
				var essayHeight = ui.value;
									
				$(this).parents('.slider-container').find('.slider-value').html(  ui.value );
				
				if(model.updateEssaySizeDelay)clearTimeout(model.updateEssaySizeDelay);
				
				var obj = this;
				
				model.updateEssaySizeDelay = setTimeout(function(){
					
					model.set({'path': '/essayItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], essayItemId: $(obj).parents('.essayOptionsContainer').find('.dataCache').data('id'), update: 'essay-height', value: essayHeight}), success: updateEssaySizeSuccess, fail: updateEssaySizeFail });
	
					
				},200);
				return this;
				
			  }
		});
	
	},
	
	initEssayLimitType: function(){
		var el = this.$el;	
		
		$('.essayLimitType', el).editable({
			pk: 1,
			limit: 1,
			source: [
				{value: 'character', text: 'Characters'},
				{value: 'word', text: 'Words'}
			],
			url: '/dashboard/essay-contest/essayItem',
			showbuttons: false,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'limit-type';
				params.essayItemId = $(this).parents('.essayOptionsContainer').find('.dataCache').data('id');
				return params;
			}
			
		});
		
	},
	
	initEssayLimitCounter: function(){
		
		var el = this.$el;	
		$('.essayLimitCounter', el).editable({
			pk: 1,
			limit: 1,
			source: [
				{value: '', text: 'Do not display counter'},
				{value: 'asc', text: 'Display in ascending order'},
				{value: 'desc', text: 'Display in descending order'}
			],
			url: '/dashboard/essay-contest/essayItem',
			showbuttons: false,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'essay-counter';
				params.essayItemId = $(this).parents('.essayOptionsContainer').find('.dataCache').data('id');
				return params;
			}
			
		});
		
		
	},
	
	initEssayLimitQuantity: function(){
		var el = this.$el;	
		
		$('.essayMinLimitQuantity', el).editable({
			pk: 1,
			title: 'Enter quantity',
			validate: function(newValue) {
								
				if(!/^[0-9]+$/.test(newValue) && newValue != 'custom'){
					
					return 'Please only enter numbers';	
				}
				
				if(isNaN(parseInt(newValue), 10)){
					
					return 'Please only a valid number';	
				}
				
				
			},
			success: function(response, newValue){
				
				$(this).data('value', response.newValue);	
					
			},
			clear: false,
			inputclass: 'essayLimitQuantityBox',
			url: '/dashboard/essay-contest/essayItem',
			showbuttons: true,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'limit-number-min';
				params.value = parseInt(params.value, 10);
				params.essayItemId = $(this).parents('.essayOptionsContainer').find('.dataCache').data('id');
				return params;
			},
			display: function(value){
				
				if(value <= 0 || !/^[0-9]+$/.test(value)){
				
					$(this).text('No Minimum');	
					
				}else{
					
					$(this).text(parseInt(value, 10));	
					
					}
				
			}
			
			
		}).on("click", function(){
		
			
			setTimeout($.proxy(function(){
				$(this).siblings('.popover').find('.popover-title').append('<div style="font-size: .7em;">(enter 0 for no limit)</div>');
			
			},this),0);		
			
		})
		
		
		$('.essayMaxLimitQuantity', el).editable({
			pk: 1,
			title: 'Enter quantity',
			validate: function(newValue) {
								
				if(!/^[0-9]+$/.test(newValue) && newValue != 'custom'){
					
					return 'Please only enter numbers';	
				}
				
				if(isNaN(parseInt(newValue), 10)){
					
					return 'Please only a valid number';	
				}
				
				
			},
			success: function(response, newValue){
				
				$(this).data('value', response.newValue);	
					
			},
			clear: false,
			inputclass: 'essayLimitQuantityBox',
			url: '/dashboard/essay-contest/essayItem',
			showbuttons: true,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'limit-number-max';
				params.value = parseInt(params.value, 10);
				params.essayItemId = $(this).parents('.essayOptionsContainer').find('.dataCache').data('id');
				return params;
			},
			display: function(value){
				
				if(value <= 0 || !/^[0-9]+$/.test(value)){
				
					$(this).text('Unlimited');	
					
				}else{
					
					$(this).text(parseInt(value, 10));	
					
					}
				
			}
			
			
		}).on("click", function(){
		
			
			setTimeout($.proxy(function(){
				$(this).siblings('.popover').find('.popover-title').append('<div style="font-size: .7em;">(enter 0 for no limit)</div>');
			
			},this),0);		
			
		})
		
		
	},
	
	essayRequiredSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/essay-contest/essayItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'essay-required', value: status, pid: window['pid'], essayItemId: $(event.target).parents('.essayOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.essayItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Essay required setting has been updated.'});
					
				}
				
				
				
			},
			 statusCode: {
				500: function(xhr) {
				  	return Growl.error({
						title: 'An error occurred!',
						text: xhr.responseJSON.error
					});
				}
			  }
		})
		
		
		
	},
	
	initEssayRequiredSwitch: function(){
		var el = this.$el;	
		
		if(this.options.essayItem.el['essay-required'] == 1){
		
			$(".essayRequiredSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	essayTrimTextSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/essay-contest/essayItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'trim-text', value: status, pid: window['pid'], essayItemId: $(event.target).parents('.essayOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.essayItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Essay trim text setting has been updated.'});
					
				}
				
				
				
			},
			 statusCode: {
				500: function(xhr) {
				  	return Growl.error({
						title: 'An error occurred!',
						text: xhr.responseJSON.error
					});
				}
			  }
		})
		
		
		
	},
	
	initEssayTrimTextSwitch: function(){
		var el = this.$el;	
		
		if(this.options.essayItem.el['trim-text'] == 1){
		
			$(".essayTrimTextSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	essayHeightAdjustableSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/essay-contest/essayItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'essay-height-adjustable', value: status, pid: window['pid'], essayItemId: $(event.target).parents('.essayOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.essayItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Essay box height adjustable setting has been updated.'});
					
				}
				
				
				
			},
			 statusCode: {
				500: function(xhr) {
				  	return Growl.error({
						title: 'An error occurred!',
						text: xhr.responseJSON.error
					});
				}
			  }
		})
		
		
		
	},
	
	initEssayHeightAdjustableSwitch: function(){
		var el = this.$el;	
		
		if(this.options.essayItem.el['essay-height-adjustable'] == 1){
		
			$(".essayHeightAdjustableSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	initHelpers: function(){
		var el = this.$el;	
		
		$('.learnMore', el).popover({
			html: true,
			trigger: 'click'
			
			
		});
		
	},
	
	
	render: function () {
		 
		var addNewFlag = false;
			
		if(!this.options.essayItem.key){
			
			addNewFlag = true;
			var newKey;
			$.ajaxSetup({async:false});
			$.post('/dashboard/essay-contest/createEssayItem', {pid: window['pid']}, function(response){
				newKey = response.essayItemId;
			},'json');
			$.ajaxSetup({async:true});
			
			this.options.essayItem.key = newKey;
		}
		
		if(!this.options.essayItem.key){
		
			return;	
			
		}
		
		$(this.el).html(this.template({el: this.options.essayItem.el, key: this.options.essayItem.key}));
		var el = this.$el;	
		
		this.initEssayDescription();
		this.initEssaySizeSlider();
		this.initEssayHeightAdjustableSwitch();
		this.initEssayLimitQuantity();
		this.initEssayLimitType();
		this.initEssayTrimTextSwitch();
		this.initEssayRequiredSwitch();
		this.initEssayLimitCounter();
		this.initHelpers();
				
		if(addNewFlag || this.options.reinit == true){
		
		
			setTimeout(function(){
			
				$(".iButton-icons-tab", el).each(function() {
					$(this).iButton({
					  labelOn: "<i class='icon-ok'></i>",
					  labelOff: "<i class='icon-remove'></i>",
					  handleWidth: 30
					});
				});
			}, 0);
				
		}
								 					 		
        return this;
    }
});