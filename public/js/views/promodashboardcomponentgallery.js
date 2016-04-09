
window.PromoDashboardComponentGalleryView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
				
		
    },
	
	
	events: {

		'click .addNewGalleryBttn': 'addNewGalleryBttn',
		'click #deleteGalleryItemModal .confirm' : 'deleteGalleryItem',
		
	},
	
	deleteGalleryItem: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = $.proxy(function(model, response){
			
			if(response && response.galleryItemId){
			
				var deleteObj = $(".galleryItems .dataCache").filter(function(){
					
					return $(this).data('id') == response.galleryItemId;
					
				}).parents('.galleryOptionsContainer');
				
				deleteObj.remove();
				
				$(".galleryItems").empty();
								
				$.proxy(this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.populateGalleryItem(true);
					
				}, this)}), this);
								
				
			}else deleteFail();
			
			
		}, this);
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'galleryItem'});
		
		if($("#deleteGalleryItemModal").data('id')){
			
			this.collection.first().destroy({data: { id: $("#deleteGalleryItemModal").data('id'), pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
			
		}else{
			
			 $(".galleryItems .dataCache").filter(function(){
					
					return !$(this).data('id');
					
				}).parents('.galleryOptionsContainer').remove();
		}
		
		$("#deleteGalleryItemModal").modal('hide');
		
	
		
	},
	
	addNewGalleryBttn: function(event){
		
		event.preventDefault();
					
		$('.galleryItems').append(new PromoDashboardComponentGalleryItemView({model: this.model, collection: this.collection, galleryItem: {el: {'item-per-page': 18, 'gallery-style': 'pinterest', 'comment-plugin': '', 'import-from': 0, 'sort-default': 'random', 'user-sort-type': '', 'user-search-criteria': '', 'screening-required': '1',  'allow-user-search': '0', 'allow-user-sort': '', 'trim-text': 0},  key: ''}, reinit: true}).el);
				
		
		setTimeout(function(){
			
			if($(".galleryOptionsContainer").length > 0){
			
				$(".galleryOptionsContainer:last").scrollintoview();
				
			}
			
		},0);
		
		
	},
	
	populateGalleryItem: function(reinit){
		
		var el = this.$el;	
				
		var galleryItem = this.collection.pluck('galleryItem')[0];
		
		galleryItem = _(galleryItem).sortBy(function(galleryItemEl, key) {
			
			galleryItem[key].key = key;
			return galleryItemEl.key || '0';
		});
		
		_.each(galleryItem, $.proxy(function(galleryItemEl, key){
						
			 $('.galleryItems', el).append(new PromoDashboardComponentGalleryItemView({model: this.model, collection: this.collection, galleryItem: {el: galleryItemEl, key: galleryItemEl.key}, reinit: (reinit ? true : false)}).el);
			
		}), this);
		
		
	},
	
    render: function () {
		
        $(this.el).html(this.template());
				 				
		var el = this.$el;			
		this.populateGalleryItem();
		
		$('.main-content').html(this.el);

		window['genericInit']();	
		
		return this;
    }
	
});



window.PromoDashboardComponentGalleryItemView = Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.render();
		
    },	
		
	events: {
		
		'click .removeGalleryItem' : function(event){
			
			event.preventDefault();
			
			$("#deleteGalleryItemModal")
			.data('id', $(event.target).parents('.galleryOptionsContainer').find('.dataCache').data('id'))
			.modal('show');
			
		},
		'change .galleryAllowUserSearchSwitch' : 'galleryAllowUserSearchSwitch',
		'change .galleryAllowUserSortSwitch' : 'galleryAllowUserSortSwitch',
		'change .galleryScreeningRequiredSwitch' : 'galleryScreeningRequiredSwitch',
		
		
		
		
	},
	
	
	initItemPerPageSlider: function(){
		
		var el = this.$el;	
		var model = this.model;
		
		$(".itemPerPageSlider.ranged-slider-ui.normal", el).slider({
				
			  range: false,
			  min: 1,
   			  max: 48,
  			  step: 1,
			  value: this.options.galleryItem.el['item-per-page'] || 18,
			  slide: function( event, ui ) {
				
				var slider = $(this);  
				
				var updateGalleryItemPerPageSuccess = function(response){
					
					if(response && response.galleryItemId){		
											
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new item per page setting has been saved.'
						});
						
					}else updateThumbHeightFail();
					
				}
				
				var updateGalleryItemPerPageFail = function(response){
					
					$("#gritter-notice-wrapper").remove();						
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
											
				}
				
				var galleryItemPerPage = ui.value;
									
				$(this).parents('.slider-container').find('.slider-value').html(  ui.value );
				
				if(model.updateGalleryItemPerPageDelay)clearTimeout(model.updateGalleryItemPerPageDelay);
				
				var obj = this;
				
				model.updateGalleryItemPerPageDelay = setTimeout(function(){
					
					model.set({'path': '/galleryItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], galleryItemId: $(obj).parents('.galleryOptionsContainer').find('.dataCache').data('id'), update: 'item-per-page', value: galleryItemPerPage}), success: updateGalleryItemPerPageSuccess, fail: updateGalleryItemPerPageFail });
	
					
				},350);
				return this;
				
			  }
		});	
	
	},
	
	galleryScreeningRequiredSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/gallery/galleryItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'screening-required', value: status, pid: window['pid'], galleryItemId: $(event.target).parents('.galleryOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.galleryItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Screening required setting has been updated.'});
					
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
	
	initGalleryScreeningRequiredSwitch: function(){
		var el = this.$el;	
		
		if(this.options.galleryItem.el['screening-required'] == 1){
		
			$(".galleryScreeningRequiredSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	galleryAllowUserSearchSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/gallery/galleryItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'allow-user-search', value: status, pid: window['pid'], galleryItemId: $(event.target).parents('.galleryOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.galleryItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Gallery allow user search setting has been updated.'});
					
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
	
	initGalleryAllowUserSearchSwitch: function(){
		var el = this.$el;	
		
		if(this.options.galleryItem.el['allow-user-search'] == 1){
		
			$(".galleryAllowUserSearchSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	galleryAllowUserSortSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/gallery/galleryItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'allow-user-sort', value: status, pid: window['pid'], galleryItemId: $(event.target).parents('.galleryOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.galleryItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Gallery allow user sort setting has been updated.'});
					
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
	
	initGalleryAllowUserSortSwitch: function(){
		var el = this.$el;	
		
		if(this.options.galleryItem.el['allow-user-sort'] == 1){
		
			$(".galleryAllowUserSortSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	initGalleryImportFrom: function(){
		var el = this.$el;	
				
		$('.galleryImportFrom', el).editable({
			pk: 1,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'import-from';
				params.galleryItemId = $(this).parents('.galleryOptionsContainer').find('.dataCache').data('id');
				return params;
			},
			inputclass: 'input-large',
			savenochange: true,
			url: '/dashboard/gallery/galleryItem',
			source: [
			
				{value: 'video-contest', text: 'Video Contest'},
				{value: 'photo-contest', text: 'Photo Contest'},
				{value: 'essay-contest', text: 'Essay Contest'},
				{value: 'twttier-api-image', text: 'Twitter API - Image'},
				{value: 'twttier-api-video', text: 'Twitter API - Video'},
				{value: 'twttier-api-text', text: 'Twitter API - Tweet Text'},
				{value: 'instagram-api-image', text: 'Instagram API - Image'},
				{value: 'instagram-api-video', text: 'Instagram API - Video'},
				{value: 'instagram-api', text: 'Instagram API - Caption Text'}
			]
		});
		
	},
	
	initSortTypeDefault: function(){
		
		var el = this.$el;	
		$('.gallerySortTypeDefault', el).editable({
			pk: 1,
			limit: 1,
			source: [
				{value: 1, text: 'Random'},
				{value: 2, text: 'Most Recent First'},
				{value: 3, text: 'A-Z By Last Name'}
			],
			url: '/dashboard/gallery/galleryItem',
			showbuttons: false,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'sort-default';
				params.galleryItemId = $(this).parents('.galleryOptionsContainer').find('.dataCache').data('id');
				return params;
			}
			
		});
		
	},
	
	initGalleryStyle: function(){
		
		var el = this.$el;	
		$('.galleryStyle', el).editable({
			pk: 1,
			limit: 1,
			source: [
				{value: 'pinterest', text: 'Pinterest'},
				{value: 'image-layout', text: 'Image Layout'},
				{value: 'fixed-grid', text: 'Fixed-Grid'},
				{value: 'flex-grid', text: 'Flex-Grid'},
				{value: 'dribbble', text: 'Dribbble'},
				{value: 'vinefeed', text: 'Vinefeed'}
				
			],
			url: '/dashboard/gallery/galleryItem',
			showbuttons: false,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'gallery-style';
				params.galleryItemId = $(this).parents('.galleryOptionsContainer').find('.dataCache').data('id');
				return params;
			}
			
		});
		
	},
	
	initCommentPlugin: function(){
		
		var el = this.$el;	
		$('.galleryCommentPlugin', el).editable({
			pk: 1,
			limit: 1,
			source: [
				{value: '', text: 'None'},
				{value: 'disqus', text: 'Disqus'},
				{value: 'facebook-comments', text: 'Facebook Comments Box'}
			],
			url: '/dashboard/gallery/galleryItem',
			showbuttons: false,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'comment-plugin';
				params.galleryItemId = $(this).parents('.galleryOptionsContainer').find('.dataCache').data('id');
				return params;
			}
			
		});
		
	},
	
	initSortTypeAllowed: function(){
		var el = this.$el;	
				
		$('.gallerySortTypeAllowed', el).editable({
			pk: 1,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'user-sort-type';
				params.galleryItemId = $(this).parents('.galleryOptionsContainer').find('.dataCache').data('id');
				return params;
			},
			inputclass: 'input-large',
			savenochange: true,
			url: '/dashboard/gallery/galleryItem',
			source: [
				{value: 1, text: 'Random'},
				{value: 2, text: 'Most Recent First'},
				{value: 3, text: 'A-Z By Last Name'}
			]
		});
		
	},
	
	initGallerySearchCriteria: function(){
		var el = this.$el;	
				
		$('.gallerySearchCriteria', el).editable({
			pk: 1,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'user-search-criteria';
				params.galleryItemId = $(this).parents('.galleryOptionsContainer').find('.dataCache').data('id');
				return params;
			},
			inputclass: 'input-large',
			savenochange: true,
			url: '/dashboard/gallery/galleryItem',
			source: [
				{value: 1, text: 'Random'},
				{value: 2, text: 'Most Recent First'},
				{value: 3, text: 'A-Z By Last Name'}
			]
		});
		
	},
	
	initDisplayOrder: function(){
		
		var el = this.$el;	
		
		$(".grid", el).sortable({
			revert: 'invalid',
			placeholder: 'well placeholder tile',
			forceHelperSize: true
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
		 
		var addNewFlag = false;
			
		if(!this.options.galleryItem.key){
			
			addNewFlag = true;
			var newKey;
			$.ajaxSetup({async:false});
			$.post('/dashboard/gallery/createGalleryItem', {pid: window['pid']}, function(response){
				newKey = response.galleryItemId;
			},'json');
			$.ajaxSetup({async:true});
			
			this.options.galleryItem.key = newKey;
		}
		
		if(!this.options.galleryItem.key){
		
			return;	
			
		}
		
		$(this.el).html(this.template({el: this.options.galleryItem.el, key: this.options.galleryItem.key}));
		var el = this.$el;	
		
		this.initGalleryImportFrom();
		
		this.initDisplayOrder();
		
		this.initGalleryStyle();
		this.initCommentPlugin();
		this.initItemPerPageSlider();
		
		this.initGalleryAllowUserSortSwitch();
		this.initSortTypeDefault();
		this.initSortTypeAllowed();
		
		this.initGalleryAllowUserSearchSwitch();
		this.initGallerySearchCriteria();
	
		this.initGalleryScreeningRequiredSwitch();
		
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

