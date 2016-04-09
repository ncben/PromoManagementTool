
window.PromoDashboardComponentVideoContestView = Backbone.View.extend({
	
    initialize: function () {
	
		this.render();
				
		
    },
	
	
	events: {

		'click .addNewVideoBttn': 'addNewVideoBttn',
		'click #deleteVideoItemModal .confirm' : 'deleteVideoItem',
		
	},
	
	deleteVideoItem: function(event){
		
		event.preventDefault();
		
		var deleteSuccess = $.proxy(function(model, response){
			
			if(response && response.videoItemId){
			
				var deleteObj = $(".videoItems .dataCache").filter(function(){
					
					return $(this).data('id') == response.videoItemId;
					
				}).parents('.videoOptionsContainer');
				
				deleteObj.remove();
				
				$(".videoItems").empty();
								
				$.proxy(this.collection.fetch({ data: $.param({pid: window['pid']}), success: $.proxy(function(){
				
					this.populateVideoItem(true);
					
				}, this)}), this);
								
				
			}else deleteFail();
			
			
		}, this);
		
		var deleteFail = function(){
			
			return Growl.error({
				title: 'An error occurred!',
				text: 'Please refresh this page and try again.'
			});
			
		};
		
		this.collection.set({path: 'videoItem'});
		
		if($("#deleteVideoItemModal").data('id')){
			
			this.collection.first().destroy({data: { id: $("#deleteVideoItemModal").data('id'), pid: window['pid'] }, processData: true, success: deleteSuccess, error: deleteFail, wait: true});
			
		}else{
			
			 $(".videoItems .dataCache").filter(function(){
					
					return !$(this).data('id');
					
				}).parents('.videoOptionsContainer').remove();
		}
		
		$("#deleteVideoItemModal").modal('hide');
		
	
		
	},
	
	addNewVideoBttn: function(event){
		
		event.preventDefault();
					
		$('.videoItems').append(new PromoDashboardComponentVideoContestItemView({model: this.model, collection: this.collection, videoItem: {el: {'video-aspect-ratio-min': 0, 'video-aspect-ratio-max': 17, 'video-length-min': 0, 'video-length-max': 3605,  'video-quantity-min': 1, 'video-quantity-max': 1,  'video-required': 1,  'video-size-min': 0, 'video-size-max': 250, 'video-description': '', 'video-file-type': '.mpg,.mpeg,.wmv,.mpeg4,.mpe,.ogv,.ogm,.3gpp,.3g2,.3gp,.flv,.f4v,.mp4,.mov,.m4v', 'video-file-source': 'local', 'video-preview-image': 0},  key: ''}, reinit: true}).el);
				
		
		setTimeout(function(){
			
			if($(".videoOptionsContainer").length > 0){
			
				$(".videoOptionsContainer:last").scrollintoview();
				
			}
			
		},0);
		
		
	},
	
	populateVideoItem: function(reinit){
		
		var el = this.$el;	
				
		var videoItem = this.collection.pluck('videoItem')[0];
		
		videoItem = _(videoItem).sortBy(function(videoItemEl, key) {
			
			videoItem[key].key = key;
			return videoItemEl.key || '0';
		});
		
		_.each(videoItem, $.proxy(function(videoItemEl, key){
						
			 $('.videoItems', el).append(new PromoDashboardComponentVideoContestItemView({model: this.model, collection: this.collection, videoItem: {el: videoItemEl, key: videoItemEl.key}, reinit: (reinit ? true : false)}).el);
			
		}), this);
		
		
	},
	
    render: function () {
		
        $(this.el).html(this.template());
				 				
		var el = this.$el;			
		this.populateVideoItem();
		
		$('.main-content').html(this.el);

		window['genericInit']();	
		
		return this;
    }
	
});



window.PromoDashboardComponentVideoContestItemView = Backbone.View.extend({
	
    initialize: function (options) {
	
		this.options = options || {};	
		
		this.render();
		
    },	
		
	events: {
		
		'click .removeVideoItem' : function(event){
			
			event.preventDefault();
			
			$("#deleteVideoItemModal")
			.data('id', $(event.target).parents('.videoOptionsContainer').find('.dataCache').data('id'))
			.modal('show');
			
		},
		'change .videoRequiredSwitch' : 'videoRequiredSwitch',
		'change .videoPreviewImageSwitch' : 'videoPreviewImageSwitch',
		'click .videoDescriptionItem .saveBttn' : 'saveVideoDescription'
		
		
	},
	
	initVideoDescription: function(){
		var el = this.$el;	
		
		if(this.options.videoItem.el['video-description']){
			
			$(".videoDescription", el).val(this.options.videoItem.el['video-description']);
			$(".videoDescriptionDisplay", el).html(this.options.videoItem.el['video-description']);
		}
		
		$(".videoDescriptionDisplay", el).on("click", function() {
						
		  $(this).hide();
		  $(this).closest(".closable-chat-box").addClass("open");
		  
		  
		  $(this).parents('.videoDescriptionItem').find('.actions').show();
		  $(this).siblings('.videoDescription').show().wysihtml5({
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
	
	saveVideoDescription: function(event){
		
		event.preventDefault();
		
		
		$.ajax({
			url: '/dashboard/video-contest/videoItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'video-description', value: $(event.target).parents('.videoDescriptionItem').find('.videoDescription').val(), pid: window['pid'], videoItemId: $(event.target).parents('.videoOptionsContainer').find('.dataCache').data('id')},
			success: $.proxy(function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.videoItemId){
					
					
					 $(event.target).parents('.videoDescriptionItem').find('.wysihtml5-toolbar, .wysihtml5-sandbox').remove().end().find('.actions').hide().end().find('.videoDescriptionDisplay').show().html($(event.target).parents('.videoDescriptionItem').find('.videoDescription').val());
					 
					return Growl.success({title: 'Successfully updated!', text: 'Video description has been updated.'});
					
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
	
	initVideoSizeSlider: function(){
		
		var el = this.$el;	
		var model = this.model;
		
		$(".videoSizeSlider.ranged-slider-ui.normal", el).slider({
			
			  range: true,
			  min: 0,
			  max: 1024,
			  step: 2,
			  values: [this.options.videoItem.el['video-size-min'] || 0, this.options.videoItem.el['video-size-max'] || 250],
			  slide: function( event, ui ) {
				  
				var slider = $(this);  
				
				var updateVideoSizeSuccess = function(response){
					
					if(response && response.videoItemId){		
											
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new video file size range has been saved.'
						});
						
					}else updateVideoSizeFail();
					
				}
				
				var updateVideoSizeFail = function(response){
					
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
				
				if(model.updateVideoSizeDelay)clearTimeout(model.updateVideoSizeDelay);
				
				var obj = this;
				
				model.updateVideoSizeDelay = setTimeout(function(){
					
					model.set({'path': '/videoItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], videoItemId: $(obj).parents('.videoOptionsContainer').find('.dataCache').data('id'), update: 'video-size', 'video-size-min': sizeMin, 'video-size-max': sizeMax}), success: updateVideoSizeSuccess, fail: updateVideoSizeFail });
	
					
				},350);
				
				return this;
				
			  }
		});
	
	},
	
	videoPreviewImageSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/video-contest/videoItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'video-preview-image', value: status, pid: window['pid'], videoItemId: $(event.target).parents('.videoOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.videoItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Video preview setting has been updated.'});
					
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
	
	initVideoPreviewImageSwitch: function(){
		var el = this.$el;	
		
		if(this.options.videoItem.el['video-preview-image'] == 1){
		
			$(".videoPreviewImageSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	
	videoRequiredSwitch: function(event){
		
		var status = ($(event.target).is(":checked")) ? 1 : 0;
		
		$.ajax({
			url: '/dashboard/video-contest/videoItem',
			type: 'PUT',
			dataType: 'json',
			data: {update: 'video-required', value: status, pid: window['pid'], videoItemId: $(event.target).parents('.videoOptionsContainer').find('.dataCache').data('id')},
			success: function(response) {
								
				if(response.error){
					
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
					
				}
				
				if(response.videoItemId){
					
					
					return Growl.success({title: 'Successfully updated!', text: 'Video required setting has been updated.'});
					
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
	
	initVideoRequiredSwitch: function(){
		var el = this.$el;	
		
		if(this.options.videoItem.el['video-required'] == 1){
		
			$(".videoRequiredSwitch", el).prop('checked', true);
			
		}
		
		
	},
	
	initVideoQuantitySlider:  function(){
		var el = this.$el;	
		var model = this.model;
		$(".videoQuantitySlider.ranged-slider-ui.normal", el).slider({
			
			  range: true,
			  min: 1,
			  max: 101,
			  values: [this.options.videoItem.el['video-quantity-min'] || 1, this.options.videoItem.el['video-quantity-max'] || 1],
			  slide: function( event, ui ) {
				  				
				var slider = $(this);  
				
				var updateVideoQuantSuccess = function(response){
					
					if(response && response.videoItemId){		
											
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new video quantity range has been saved.'
						});
						
					}else updateVideoQuantFail();
					
				}
				
				var updateVideoQuantFail = function(response){
					
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
				
				if(model.updateVideoQuantDelay)clearTimeout(model.updateVideoQuantDelay);
				
				var obj = this;
				
				model.updateVideoQuantDelay = setTimeout(function(){
					
					model.set({'path': '/videoItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], videoItemId: $(obj).parents('.videoOptionsContainer').find('.dataCache').data('id'), update: 'video-quantity', 'video-quantity-min': sizeMin, 'video-quantity-max': sizeMax}), success: updateVideoQuantSuccess, fail: updateVideoQuantFail });
	
					
				},350);
				
				return this;
				
			  }
		});
		
	},
	
	initVideoAspectRatioSlider: function(){
		
		var el = this.$el;	
		var model = this.model;
		
		var values = ['1:999','1:3','3:7','9:16','3:5','2:3','3:4','6:7','8:9','1:1','9:8','7:6','4:3','3:2','5:3','16:9','21:9','3:1','999:1'];
				
		$(".videoAspectRatioSlider.ranged-slider-ui.normal", el).slider({
			
			  range: true,
			  min: 0,
			  max: 17,
			  values: [values.indexOf(this.options.videoItem.el['video-aspect-ratio-min']) || 0, values.indexOf(this.options.videoItem.el['video-aspect-ratio-max']) || 17],
			  step: 1,
			  slide: function( event, ui ) {
				  
				  console.log('here');
				 
				var slider = $(this);  
				
				var updateVideoAspectRatioSuccess = function(response){
					
					if(response && response.videoItemId){		
											
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new video aspect ratio range has been saved.'
						});
						
					}else updateVideoAspectRatioFail();
					
				}
				
				var updateVideoAspectRatioFail = function(response){
					
					$("#gritter-notice-wrapper").remove();						
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
											
				}
				
				var aspectRatioMin = values[parseInt(ui.values[0])], aspectRatioMax =values[parseInt(ui.values[1])];
				
				if(ui.values[1] == '0')ui.values[1] = 'Any';
				if(ui.values[0] == '0')  ui.values[0] = 'Any';
				if(ui.values[1] == '17')  ui.values[1] = 'Any';
				if(ui.values[0] == '17')  ui.values[0] = 'Any';
				
				if(ui.values[0] !='Any')ui.values[0] = values[parseInt(ui.values[0])];	
				if(ui.values[1] !='Any')ui.values[1] = values[parseInt(ui.values[1])];	
				
					
				$(this).parents('.slider-container').find('.slider-value').html(  (ui.values[ 0 ] != 'Any' ? ui.values[ 0 ] : ui.values[ 0 ]) + " - " + (ui.values[ 1 ] != 'Any' ? ui.values[ 1 ]  : ui.values[ 1 ]) );
				if(model.updateVideoAspectRatioDelay)clearTimeout(model.updateVideoAspectRatioDelay);
				var obj = this;
				model.updateVideoAspectRatioDelay = setTimeout(function(){
					model.set({'path': '/videoItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], videoItemId: $(obj).parents('.videoOptionsContainer').find('.dataCache').data('id'), update: 'video-aspect-ratio', 'video-aspect-ratio-min': aspectRatioMin, 'video-aspect-ratio-max': aspectRatioMax}), success: updateVideoAspectRatioSuccess, fail: updateVideoAspectRatioFail });
	
					
				},350);
				return this;
				
			  }
		});
		
	},
	
	initVideoLengthSlider: function(){
		
		var el = this.$el;	
		var model = this.model;	
	
			
		
		$(".videoLengthSlider.ranged-slider-ui.normal", el).slider({
			
			  range: true,
			  min: 0,
			  max: 3605,
			  values: [this.options.videoItem.el['video-length-min'] || 0, this.options.videoItem.el['video-length-max'] || 3605],
			  step: 5,
			  slide: function( event, ui ) {
				  
				
				var slider = $(this);  
				
				var updateVideoLengthSuccess = function(response){
					
					if(response && response.videoItemId){		
											
						$("#gritter-notice-wrapper").remove();						
						return Growl.success({
							title: 'Successfully updated!',
							text: 'The new video length range has been saved.'
						});
						
					}else updateVideoLengthFail();
					
				}
				
				var updateVideoLengthFail = function(response){
					
					$("#gritter-notice-wrapper").remove();						
					return Growl.error({
						title: 'An error occurred!',
						text: 'Please refresh this page and try again.'
					});
											
				}
				
				var lengthMin = ui.values[0], lengthMax = ui.values[1];
				
				if(ui.values[1] == 3605)  ui.values[1] = 'Any';
				if(ui.values[0] == 3605)  ui.values[0] = 'Any';
				if(ui.values[1] == 0)  ui.values[1] = 'Any';
				if(ui.values[0] == 0)  ui.values[0] = 'Any';
				
				String.prototype.toHHMMSS = function () {
					var sec_num = parseInt(this, 10); // don't forget the second parm
					var hours   = Math.floor(sec_num / 3600);
					var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
					var seconds = sec_num - (hours * 3600) - (minutes * 60);
				
					if (hours   < 10) {hours   = "0"+hours;}
					if (minutes < 10) {minutes = "0"+minutes;}
					if (seconds < 10) {seconds = "0"+seconds;}
					var time    = hours+':'+minutes+':'+seconds;
					return time;
			}
					
				
			
				$(this).parents('.slider-container').find('.slider-value').html(  (ui.values[ 0 ] != 'Any' ? ui.values[ 0 ].toString().toHHMMSS() : ui.values[ 0 ]) + " - " + (ui.values[ 1 ] != 'Any' ? ui.values[ 1 ].toString().toHHMMSS() : ui.values[ 1 ]) );
				if(model.updateVideoLengthDelay)clearTimeout(model.updateVideoLengthDelay);
				var obj = this;
				model.updateVideoLengthDelay = setTimeout(function(){
					model.set({'path': '/videoItem' });
					
					model.sync('update', model, { data: $.param({pid: window['pid'], videoItemId: $(obj).parents('.videoOptionsContainer').find('.dataCache').data('id'), update: 'video-length', 'video-length-min': lengthMin, 'video-length-max': lengthMax}), success: updateVideoLengthSuccess, fail: updateVideoLengthFail });
	
					
				},350);
				return this;
				
			  }
		});
	},
	
	initVideoFileTypes: function(){
		var el = this.$el;	
		
		$('.videoFileTypes', el).editable({
			showbuttons: false,
			inputclass: 'input-large',
			savenochange: true,
			url: '/dashboard/video-contest/videoItem',
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'video-file-type';
				params.videoItemId = $(this).parents('.videoOptionsContainer').find('.dataCache').data('id');
				return params;
			},
			savenochange: true,
			display: function(value) {
					  			  
				if(typeof value == 'undefined')value = [];	
				$(this).siblings('.popover').css("opacity","1");
				if(typeof value != 'object')value = value.split(',');
				if(value == null)value = [];
				
				$(this).text(value.join(', '));
				  
				  
			} ,
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
			select2: {
				placeholder: "",
				//width: 'copy',
				multiple: true,
				containerCss: {'min-width':'800px'},
				dropdownAutoLength: true,
				data: function(){
					
					setTimeout(function(){
										
						if($(".select2-choices")[0].scrollHeight > parseInt($(".select2-choices").css("max-height"))){
							$(".select2-choices").css("overflow-y","auto");
							
						}  
						  
				 	},0);
					
					return {
						more: false,
						results: [
						{ text: "Video Formats", children: [
							{id: '.3g2', text: '3g2 (Mobile Video)'},
							{id: '.3gp', text: '3gp (Mobile Video)'},
							{id: '.3gpp', text: '3gpp (Mobile Video)'},
							{id: '.asf', text: 'asf (Windows Media Video)'},
							{id: '.avi', text: 'avi (AVI Video)'},
							{id: '.dat', text: 'dat (MPEG Video)'},
							{id: '.divx', text: 'divx (DIVX Video)'},
							{id: '.dv', text: 'dv (DV Video)'},
							{id: '.f4v', text: 'f4v (Flash Video)'},
							{id: '.flv', text: 'flv (Flash Video)'},
							{id: '.m2ts', text: 'm2ts (M2TS Video)'},
							{id: '.m4v', text: 'm4v (MPEG-4 Video)'},
							{id: '.mkv', text: 'mkv (Matroska Format)'},
							{id: '.mod', text: 'mod (MOD Video)'},
							{id: '.mov', text: 'mov (QuickTime Movie)'},
							{id: '.mp4', text: 'mp4 (MPEG-4 Video)'},
							{id: '.mpe', text: 'mpe (MPEG Video)'},
							{id: '.mpeg', text: 'mpeg (MPEG Video)'},
							{id: '.mpeg4', text: 'mpeg4 (MPEG-4 Video)'},
							{id: '.mpg', text: 'mpg (MPEG Video)'},
							{id: '.mts', text: 'mts (AVCHD Video)'},
							{id: '.nsv', text: 'nsv (Nullsoft Video)'},
							{id: '.ogm', text: 'ogm (Ogg Media Format)'},
							{id: '.ogv', text: 'ogv (Ogg Video Format)'},
							{id: '.qt', text: 'qt (QuickTime Movie)'},
							{id: '.tod', text: 'tod (TOD Video)'},
							{id: '.ts', text: 'ts (MPEG Transport Stream)'},
							{id: '.vob', text: 'vob (DVD Video)'},
							{id: '.wmv', text: 'wmv (Windows Media Video)'}
							]
						}
						]
					}
				}
				
			},
			success: function(response, newValue) {
        		if(response.status == 'error') return response.msg;
				$(this).data('value', newValue);	
				
			}
 	   });
	},
	
	initVideoFileSource: function(){
		var el = this.$el;	
				
		$('.videoFileSource', el).editable({
			pk: 1,
			params: function(params) {
				params.pid = window['pid'];
				params.update = 'video-file-source';
				params.videoItemId = $(this).parents('.videoOptionsContainer').find('.dataCache').data('id');
				return params;
			},
			inputclass: 'input-large',
			savenochange: true,
			url: '/dashboard/video-contest/videoItem',
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
			
		if(!this.options.videoItem.key){
			
			addNewFlag = true;
			var newKey;
			$.ajaxSetup({async:false});
			$.post('/dashboard/video-contest/createVideoItem', {pid: window['pid']}, function(response){
				newKey = response.videoItemId;
			},'json');
			$.ajaxSetup({async:true});
			
			this.options.videoItem.key = newKey;
		}
		
		if(!this.options.videoItem.key){
		
			return;	
			
		}
		
		$(this.el).html(this.template({el: this.options.videoItem.el, key: this.options.videoItem.key}));
		var el = this.$el;	
		
		this.initVideoDescription();
		this.initVideoSizeSlider();
		this.initVideoQuantitySlider();
		this.initVideoAspectRatioSlider();
		this.initVideoLengthSlider();
		this.initVideoFileTypes();
		this.initVideoFileSource();
		this.initVideoPreviewImageSwitch();
		this.initVideoRequiredSwitch();
		this.initHelpers();
		

		if(addNewFlag || this.options.reinit == true){
		
		
			setTimeout(function(){
			
				$(".iButton-icons-tab", el).each(function() {
					$(this).iButton({
					  labelOn: "<i class='icon-ok'></i>",
					  labelOff: "<i class='icon-remove'></i>",
					  handleLength: 30
					});
				});
			}, 0);
				
		}
								 					 		
        return this;
    }
});



