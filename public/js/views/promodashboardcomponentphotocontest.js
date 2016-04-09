
window.PromoDashboardComponentPhotoContestView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
				
		
    },
	
	
	events: {

		'click .addNewPhotoBttn': 'addNewPhotoBttn',
		'click #deletePhotoItemModal .confirm' : 'deletePhotoItem',
		
	},
	
	deletePhotoItem: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = $.proxy(function(model, response){
			
			if(response && response.photoItemId){
			
				var deleteObj = $(".photoItems .dataCache").filter(function(){
					
					return $(this).data('id') == response.photoItemId;
					
				}).parents('.photoOptionsContainer');
				
				deleteObj.remove();
				
				$(".photoItems").empty();
								
				$.proxy(this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.populatePhotoItem(true);
					
				}, this)}), this);
								
				
			}else deleteFail();
			
			
		}, this);
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'photoItem'});
		
		if($("#deletePhotoItemModal").data('id')){
			
			this.collection.first().destroy({data: { id: $("#deletePhotoItemModal").data('id'), pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
			
		}else{
			
			 $(".photoItems .dataCache").filter(function(){
					
					return !$(this).data('id');
					
				}).parents('.photoOptionsContainer').remove();
		}
		
		$("#deletePhotoItemModal").modal('hide');
		
	
		
	},
	
	addNewPhotoBttn: function(event){
		
		event.preventDefault();
					
		$('.photoItems').append(new PromoDashboardComponentPhotoContestItemView({model: this.model, collection: this.collection, photoItem: {el: {'photo-height-min': 0, 'photo-height-max': 4880, 'photo-width-min': 0, 'photo-width-max': 4880,  'photo-quantity-min': 1, 'photo-quantity-max': 1,  'photo-required': 1,  'photo-size-min': 0, 'photo-size-max': 10, 'photo-description': '', 'photo-file-type': '.jpg,.jpeg,.png,.gif,.bmp', 'photo-file-source': 'local', 'photo-preview-image': 0},  key: ''}, reinit: true}).el);
				
		
		setTimeout(function(){
			
			if($(".photoOptionsContainer").length > 0){
			
				$(".photoOptionsContainer:last").scrollintoview();
				
			}
			
		},0);
		
		
	},
	
	populatePhotoItem: function(reinit){
		
		var el = this.$el;	
				
		var photoItem = this.collection.pluck('photoItem')[0];
		
		photoItem = _(photoItem).sortBy(function(photoItemEl, key) {
			
			photoItem[key].key = key;
			return photoItemEl.key || '0';
		});
		
		_.each(photoItem, $.proxy(function(photoItemEl, key){
						
			 $('.photoItems', el).append(new PromoDashboardComponentPhotoContestItemView({model: this.model, collection: this.collection, photoItem: {el: photoItemEl, key: photoItemEl.key}, reinit: (reinit ? true : false)}).el);
			
		}), this);
		
		
	},
	
    render: function () {
		
        $(this.el).html(this.template());
				 				
		var el = this.$el;			
		this.populatePhotoItem();
		
		$('.main-content').html(this.el);

		window['genericInit']();	
		
		return this;
    }
	
});



window.PromoDashboardComponentPhotoContestItemView = Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.render();
		
    },	
		
	events: {
		
		'click .removePhotoItem' : function(event){
			
			event.preventDefault();
			
			$("#deletePhotoItemModal")
			.data('id', $(event.target).parents('.photoOptionsContainer').find('.dataCache').data('id'))
			.modal('show');
			
		},
		'change .photoRequiredSwitch' : 'photoRequiredSwitch',
		'change .photoPreviewImageSwitch' : 'photoPreviewImageSwitch',
		'click .photoDescriptionItem .saveBttn' : 'savePhotoDescription'
		
		
	},
	
	initPhotoDescription: function(){
		var el = this.$el;	
		
		if(this.options.photoItem.el['photo-description']){
			
			$(".photoDescription", el).val(this.options.photoItem.el['photo-description']);
			$(".photoDescriptionDisplay", el).html(this.options.photoItem.el['photo-description']);
		}
		
		$(".photoDescriptionDisplay", el).on("click", function() {
						
		  $(this).hide();
		  $(this).closest(".closable-chat-box").addClass("open");
		  
		  
		  $(this).parents('.photoDescriptionItem').find('.actions').show();
		  $(this).siblings('.photoDescription').show().wysihtml5({
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
	
	savePhotoDescription: function(event){
		
		event.preventDefault();
		
		
		$.ajax({
			url: '/dashboard/photo-contest/photoItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'photo-description', value: $(event.target).parents('.photoDescriptionItem').find('.photoDescription').val(), pid: window['pid'], photoItemId: $(event.target).parents('.photoOptionsContainer').find('.dataCache').data('id')},
			success: $.proxy(function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.photoItemId){
					
					
					 $(event.target).parents('.photoDescriptionItem').find('.wysihtml5-toolbar, .wysihtml5-sandbox').remove().end().find('.actions').hide().end().find('.photoDescriptionDisplay').show().html($(event.target).parents('.photoDescriptionItem').find('.photoDescription').val());
					 
					return Growl.success({title: 'Successfully updated!', text: 'Photo description has been updated.'});
					
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
	
	initPhotoSizeSlider: function(){
		
		var el = this.$el;	
		var model = this.model;
		
		$(".photoSizeSlider.ranged-slider-ui.normal", el).slider({
			
			  range: true,
			  min: 0,
			  max: 25,
			  values: [this.options.photoItem.el['photo-size-min'] || 0, this.options.photoItem.el['photo-size-max'] || 10],
			  slide: function( event, ui ) {
				  
				var slider = $(this);  
				
				var updatePhotoSizeSuccess = function(response){
					
					if(response && response.photoItemId){		
											
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new photo file size range has been saved.'
						});
						
					}else updatePhotoSizeFail();
					
				}
				
				var updatePhotoSizeFail = function(response){
					
					$("#gritter-notice-wrapper").remove();						
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
											
				}
								
				var sizeMin = ui.values[0], sizeMax = ui.values[1];
				
				if(ui.values[1] == 0)  ui.values[1] = 'Any';
				if(ui.values[0] == 0)  ui.values[0] = 'Any';
				
				if(ui.values[0] !='Any')ui.values[0]+='MB';
				if(ui.values[1] !='Any')ui.values[1]+='MB';
									
				$(this).parents('.slider-container').find('.slider-value').html(  ui.values[0] + ' - ' + ui.values[1]  );
				
				if(model.updatePhotoSizeDelay)clearTimeout(model.updatePhotoSizeDelay);
				
				var obj = this;
				
				model.updatePhotoSizeDelay = setTimeout(function(){
					
					model.set({'path': '/photoItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], photoItemId: $(obj).parents('.photoOptionsContainer').find('.dataCache').data('id'), update: 'photo-size', 'photo-size-min': sizeMin, 'photo-size-max': sizeMax}), success: updatePhotoSizeSuccess, fail: updatePhotoSizeFail });
	
					
				},350);
				
				return this;
				
			  }
		});
	
	},
	
	photoPreviewImageSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/photo-contest/photoItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'photo-preview-image', value: status, pid: window['pid'], photoItemId: $(event.target).parents('.photoOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.photoItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Photo preview setting has been updated.'});
					
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
	
	initPhotoPreviewImageSwitch: function(){
		var el = this.$el;	
		
		if(this.options.photoItem.el['photo-preview-image'] == 1){
		
			$(".photoPreviewImageSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	
	photoRequiredSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/photo-contest/photoItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'photo-required', value: status, pid: window['pid'], photoItemId: $(event.target).parents('.photoOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.photoItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Photo required setting has been updated.'});
					
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
	
	initPhotoRequiredSwitch: function(){
		var el = this.$el;	
		
		if(this.options.photoItem.el['photo-required'] == 1){
		
			$(".photoRequiredSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	initPhotoQuantitySlider:  function(){
		var el = this.$el;	
		var model = this.model;
		$(".photoQuantitySlider.ranged-slider-ui.normal", el).slider({
			
			  range: true,
			  min: 1,
			  max: 101,
			  values: [this.options.photoItem.el['photo-quantity-min'] || 1, this.options.photoItem.el['photo-quantity-max'] || 1],
			  slide: function( event, ui ) {
				  				
				var slider = $(this);  
				
				var updatePhotoQuantSuccess = function(response){
					
					if(response && response.photoItemId){		
											
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new photo quantity range has been saved.'
						});
						
					}else updatePhotoQuantFail();
					
				}
				
				var updatePhotoQuantFail = function(response){
					
					$("#gritter-notice-wrapper").remove();						
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
											
				}
				
				var sizeMin = ui.values[0], sizeMax = ui.values[1];
				
				if(ui.values[1] == 101)  ui.values[1] = 'No Limit';
				if(ui.values[0] == 101)  ui.values[0] = 'No Limit';
									
				if(ui.values[0] == ui.values[1]){
					$(this).parents('.slider-container').find('.slider-value').html(  ui.values[0] );
				}else{
					$(this).parents('.slider-container').find('.slider-value').html(  ui.values[0] + ' - ' + ui.values[1]  );
				}
				
				if(model.updatePhotoQuantDelay)clearTimeout(model.updatePhotoQuantDelay);
				
				var obj = this;
				
				model.updatePhotoQuantDelay = setTimeout(function(){
					
					model.set({'path': '/photoItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], photoItemId: $(obj).parents('.photoOptionsContainer').find('.dataCache').data('id'), update: 'photo-quantity', 'photo-quantity-min': sizeMin, 'photo-quantity-max': sizeMax}), success: updatePhotoQuantSuccess, fail: updatePhotoQuantFail });
	
					
				},350);
				
				return this;
				
			  }
		});
		
	},
	
	initPhotoHeightSlider: function(){
		
		var el = this.$el;	
		var model = this.model;
		
		$(".photoHeightSlider.ranged-slider-ui.normal", el).slider({
			
			  range: true,
			  min: 0,
			  max: 4880,
			  values: [this.options.photoItem.el['photo-height-min'] || 0, this.options.photoItem.el['photo-height-max'] || 4880],
			  step: 80,
			  slide: function( event, ui ) {
				  
				
				var slider = $(this);  
				
				var updatePhotoHeightSuccess = function(response){
					
					if(response && response.photoItemId){		
											
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new photo height range has been saved.'
						});
						
					}else updatePhotoHeightFail();
					
				}
				
				var updatePhotoHeightFail = function(response){
					
					$("#gritter-notice-wrapper").remove();						
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
											
				}
				
				var heightMin = ui.values[0], heightMax = ui.values[1];
				
				if(ui.values[1] == 4880)  ui.values[1] = 'Any';
				if(ui.values[0] == 4880)  ui.values[0] = 'Any';
				if(ui.values[1] == 0)  ui.values[1] = 'Any';
				if(ui.values[0] == 0)  ui.values[0] = 'Any';
					
				$(this).parents('.slider-container').find('.slider-value').html(  (ui.values[ 0 ] != 'Any' ? ui.values[ 0 ] + 'px' : ui.values[ 0 ]) + " - " + (ui.values[ 1 ] != 'Any' ? ui.values[ 1 ] + 'px' : ui.values[ 1 ]) );
				if(model.updatePhotoHeightDelay)clearTimeout(model.updatePhotoHeightDelay);
				var obj = this;
				model.updatePhotoHeightDelay = setTimeout(function(){
					model.set({'path': '/photoItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], photoItemId: $(obj).parents('.photoOptionsContainer').find('.dataCache').data('id'), update: 'photo-height', 'photo-height-min': heightMin, 'photo-height-max': heightMax}), success: updatePhotoHeightSuccess, fail: updatePhotoHeightFail });
	
					
				},350);
				return this;
				
			  }
		});
		
	},
	
	initPhotoWidthSlider: function(){
		
		var el = this.$el;	
		var model = this.model;		
		
		$(".photoWidthSlider.ranged-slider-ui.normal", el).slider({
			
			  range: true,
			  min: 0,
			  max: 4880,
			  values: [this.options.photoItem.el['photo-width-min'] || 0, this.options.photoItem.el['photo-width-max'] || 4880],
			  step: 80,
			  slide: function( event, ui ) {
				  
				
				var slider = $(this);  
				
				var updatePhotoWidthSuccess = function(response){
					
					if(response && response.photoItemId){		
											
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new photo width range has been saved.'
						});
						
					}else updatePhotoWidthFail();
					
				}
				
				var updatePhotoWidthFail = function(response){
					
					$("#gritter-notice-wrapper").remove();						
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
											
				}
				
				var widthMin = ui.values[0], widthMax = ui.values[1];
				
				if(ui.values[1] == 4880)  ui.values[1] = 'Any';
				if(ui.values[0] == 4880)  ui.values[0] = 'Any';
				if(ui.values[1] == 0)  ui.values[1] = 'Any';
				if(ui.values[0] == 0)  ui.values[0] = 'Any';
					
				$(this).parents('.slider-container').find('.slider-value').html(  (ui.values[ 0 ] != 'Any' ? ui.values[ 0 ] + 'px' : ui.values[ 0 ]) + " - " + (ui.values[ 1 ] != 'Any' ? ui.values[ 1 ] + 'px' : ui.values[ 1 ]) );
				if(model.updatePhotoWidthDelay)clearTimeout(model.updatePhotoWidthDelay);
				var obj = this;
				model.updatePhotoWidthDelay = setTimeout(function(){
					model.set({'path': '/photoItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], photoItemId: $(obj).parents('.photoOptionsContainer').find('.dataCache').data('id'), update: 'photo-width', 'photo-width-min': widthMin, 'photo-width-max': widthMax}), success: updatePhotoWidthSuccess, fail: updatePhotoWidthFail });
	
					
				},350);
				return this;
				
			  }
		});
	},
	
	initPhotoFileTypes: function(){
		var el = this.$el;	
		
		$('.photoFileTypes', el).editable({
			showbuttons: false,
			inputclass: 'input-large',
			savenochange: true,
			url: '/dashboard/photo-contest/photoItem',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'photo-file-type';
				params.photoItemId = $(this).parents('.photoOptionsContainer').find('.dataCache').data('id');
				return params;
			},
			validate: function(newValue) {
											
				var err=0;
												
				_.each(newValue, function(value){
										
					if(!/^\.[a-zA-Z0-9]{1,10}$/.test($.trim(value))){
						
						err++;
						
					}
				
				})
				
				if(err)return 'Please enter a valid extension starting with a dot.';
				
				
			},
			value: '',
			mode: 'inline',
			select2: {
				tags: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff']
			},
			success: function(response, newValue) {
        		if(response.status == 'error') return response.msg;
				$(this).data('value', newValue);	
				
			}
 	   });
	},
	
	initPhotoFileSource: function(){
		var el = this.$el;	
				
		$('.photoFileSource', el).editable({
			pk: 1,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'photo-file-source';
				params.photoItemId = $(this).parents('.photoOptionsContainer').find('.dataCache').data('id');
				return params;
			},
			inputclass: 'input-large',
			savenochange: true,
			url: '/dashboard/photo-contest/photoItem',
			source: [
				{value: 'webcam', text: 'Webcam'},
				{value: 'facebook', text: 'Facebook'},
				{value: 'instagram', text: 'Instagram'},
				{value: 'local', text: 'Local (Desktop/Device)'},
				{value: 'url', text: 'URL'}
			]
		});
		
	},
		
	initHelpers: function(){
		var el = this.$el;	
		
		$('.learnMore', el).popover({
			html: true,
			trigger: 'click'
			
			
		});
		
	},
	
	render: function () {
		 
		var model = this.model;
		var addNewFlag = false;
			
		if(!this.options.photoItem.key){
			
			addNewFlag = true;
			var newKey;
			$.ajaxSetup({async:false});
			$.post('/dashboard/photo-contest/createPhotoItem', {pid: window['pid']}, function(response){
				newKey = response.photoItemId;
			},'json');
			$.ajaxSetup({async:true});
			
			this.options.photoItem.key = newKey;
		}
		
		if(!this.options.photoItem.key){
		
			return;	
			
		}
		
		$(this.el).html(this.template({el: this.options.photoItem.el, key: this.options.photoItem.key}));
		var el = this.$el;	
		
		this.initPhotoDescription();
		this.initPhotoSizeSlider();
		this.initPhotoQuantitySlider();
		this.initPhotoHeightSlider();
		this.initPhotoWidthSlider();
		this.initPhotoFileTypes();
		this.initPhotoFileSource();
		this.initPhotoPreviewImageSwitch();
		this.initPhotoRequiredSwitch();
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



