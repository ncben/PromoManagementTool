
window.ProfileView = Backbone.View.extend({
	
    initialize: function () {
		var ProfileRouter = Backbone.Router.extend({

			routes: {
				"profile/edit"  : "editProfile",
				"profile/change-password"  : "changePassword"
			},
			
			
			editProfile : function(){
			
				var profile = new Profile();
				$("#content").html(new ProfileEditView({model: profile}).el);	
				
			},
			
			changePassword : function(){
			
				var profile = new Profile();
				$("#content").html(new ProfileChangePasswordView({model: profile}).el);	
				
			}
		})
		
		var view = this;
		
		utils.loadTemplate(['ProfileView','ProfileEditView','ProfileChangePasswordView'], function() {
			
			new ProfileRouter();
			if(window['nextDeepRoute']){
				app.navigate('profile'+window['nextDeepRoute'], {trigger:true});	
				window['nextDeepRoute'] = '';
			}else{
      		    view.render();
			}
			
		})
		
    },
	
	events: {
		
		'click .editProfileBttn' : function(event){ app.navigate('profile/edit', {trigger: true});},
		'click .editPasswordBttn' : function(event){ app.navigate('profile/change-password', {trigger: true});},
		'click .logOutBttn' : function(event){ window.top.location = '/logout'; },
		'click .user-group-menu li a' : function(event){
			event.preventDefault();
			$(".user-group .btn:first-child").text($(event.target).text());
    		$(".user-group .btn:first-child").val($(event.target).data('id'));	
		 },
		 'click .switchUserGroup' : 'switchUserGroup',
		 'click .take-photo' : 'takePhoto'
		 
		
	},
	
	takePhoto: function(event){
		event.preventDefault();
		getScript("//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js", function(){
					
					getScript("assets/webcam.js", function(){
						
						$("#takePhotoModal").modal('show');
						
						webcam.embed('assets/webcam.swf', 300, 225, {
							mirror: true,
							smoothing: true,
							framerate: 20,
							shutterSound: 'assets/shutter.mp3'
						});
						
						
						webcam.onError = function (e) {
							switch (e.flag || false) {
				
							case 'CAMNOTFOUND':
								console.error('No webcam detected!');
								break;
				
							case 'CAMDISABLED':
								console.warn('We need permission to access the webcam.');
								break;
				
							case 'NOFLASHPLAYER':
								console.error('No up-to-date flash player installed. (min. 11.1.0)');
								break;
				
							default:
							}
						};
						
						 $(".take-photo-btn").off("click").on("click", function () {
							 
							var result = webcam.save('window');
							var img = new Image();
							img.src = result;
							$("#webcam-result").html(img);
							
						});
						
						
					})
					
				})
		
	},
	
	switchUserGroup: function(event){
		event.preventDefault();
		
		var switchGroupSuccess = function(response, status, xHr){	
		
			if(!response.error){
								
				$(".alert").remove();
				
				_.delay(function(){
					
				 	editUserSuccessAlert = $('<div class="alert alert-success fade in" id="switchGroupSuccess" />')
					.append('<button type="button" class="close" data-dismiss="alert">×</button>')
					.append('Successfully updated.')
					.prependTo($('.user-group').parents('.panel-body'));
					
				}, 300);
				
				_.delay(function(){
						
						$(".alert").fadeTo(500, 0).slideUp(500, function(){
							$(this).remove(); 
						});
						
				}, 1500);
				
		
				
			}else{
					
				$(".alert").remove();
				var errorAlert = $('<div class="alert alert-danger" id="switchGroupError" />')
				.append('<button type="button" class="close" data-dismiss="alert">×</button>')
				.append(response.error)
				.prependTo($('.user-group').parents('.panel-body'));
				
					
			}
			
		}
		
		this.model.sync('switch-group', this.model, { data: $.param({group: $(".user-group .btn:first-child").val()}), success: switchGroupSuccess});

		
	},

    render: function () {
				
        $(this.el).html(this.template({user: this.collection.toJSON()}));
				 				
		var el = this.$el;	
				 		
        return this;
    }
	
});




window.ProfileChangePasswordView = Backbone.View.extend({
	
    initialize: function (options) {
		this.options = options || {};	
        this.render();
	},
	
	events: {
		'click #editPassword' : 'editPassword'
	},
	
	editPassword: function(event){
				
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
		
		var editPasswordSuccess = function(response, status, xHr){
			$("#editPasswordForm .form-group").removeClass('has-error');
		
		
			if(!response.error && response.username){
				
				app.navigate('profile', {trigger: true});
				
				$(".alert").remove();
				
				_.delay(function(){
					
				 	editUserSuccessAlert = $('<div class="alert alert-success fade in" id="editPasswordSuccess" />')
					.append('<button type="button" class="close" data-dismiss="alert">×</button>')
					.append('Your password has been successfully updated.')
					.insertAfter($('.wrapper .page-header'));
					
				}, 300);
				
				_.delay(function(){
						
						$(".alert").fadeTo(500, 0).slideUp(500, function(){
							$(this).remove(); 
						});
						
				}, 1500);
				
		
				
			}else{
					
				$(".alert").remove();
				var errorAlert = $('<div class="alert alert-danger" id="editPasswordError" />')
				.append('<button type="button" class="close" data-dismiss="alert">×</button>')
				.append(response.error)
				.prependTo($('#editPasswordForm'));
				
				var errFields = response.field.split(',');
				for(i=0;i< errFields.length; i++){
				
					$("#editPasswordForm").find('[name="'+errFields[i]+'"]').parents('.form-group').addClass('has-error');
					
				}
					
			}
			
		}
		
		this.model.sync('change-password', this.model, { data: $.param($("#editPasswordForm").serializeObject()), success: editPasswordSuccess});
		
	},
	

	render: function () {
		
		var model = this.model;
		var view = this;
				
		var fetchUserSuccess = function(model, response){
													
			$(view.el).html(view.template(model.toJSON()));
			$('input[name=email]', view.el).tooltip({title: 'Please ask an administrator to change your email address.', placement: 'bottom', delay: 500})

					
			var el = view.$el;	
			
     		return view;
							
					
		}
				
				
		model.fetch({success: fetchUserSuccess});
	
		 
	}
	
});




window.ProfileEditView = Backbone.View.extend({
	
    initialize: function (options) {
		this.options = options || {};	
        this.render();
	},
	
	events: {
		'click #editProfile' : 'editProfile',
		'click #deleteAccount' : function(){$("#deleteAccountModal").modal('show');},
		'click #deleteProfileConfirm' : 'deleteProfile',
	},
	
	editProfile: function(event){
				
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
		
		var editProfileSuccess = function(response, status, xHr){
			$("#editProfileForm .form-group").removeClass('has-error');
		
		
			if(!response.error && response.username){
				
				app.navigate('profile', {trigger: true});
				
				$(".alert").remove();
				
				_.delay(function(){
					
				 	editUserSuccessAlert = $('<div class="alert alert-success fade in" id="editProfileSuccess" />')
					.append('<button type="button" class="close" data-dismiss="alert">×</button>')
					.append('Your profile has been successfully updated.')
					.insertAfter($('.wrapper .page-header'));
					
				}, 300);
				
				_.delay(function(){
						
						$(".alert").fadeTo(500, 0).slideUp(500, function(){
							$(this).remove(); 
						});
						
				}, 1500);
				
		
				
			}else{
					
				$(".alert").remove();
				var errorAlert = $('<div class="alert alert-danger" id="editProfileError" />')
				.append('<button type="button" class="close" data-dismiss="alert">×</button>')
				.append(response.error)
				.prependTo($('#editProfileForm'));
				
				var errFields = response.field.split(',');
				for(i=0;i< errFields.length; i++){
				
					$("#editProfileForm").find('[name="'+errFields[i]+'"]').parents('.form-group').addClass('has-error');
					
				}
					
			}
			
		}
		
		this.model.sync('update', this.model, { data: $.param($("#editProfileForm").serializeObject()), success: editProfileSuccess});
		
	},
	
	deleteProfile: function(event){
		
		event.preventDefault();
				
		var deleteAccountSuccess = function(model, response){
			
			window.top.location = '/logout';
				
		}
		
		var deleteAccountFail = function(model, response){
			
					$("#deleteAccountModal").modal('hide');				
					$(".alert").remove();
					
					$('<div class="alert alert-danger fade in" id="deleteAccountFail" />')
						.append('<button type="button" class="close" data-dismiss="alert">×</button>')
						.append('You cannot delete your account. You may have certain adminstrative roles that prevented this action.')
						.insertAfter($('.wrapper .page-header'));
						
					app.once("all", function(event){
					
						$("#deleteAccountFail").remove();
															
					});
			
		}
				
		this.model.set({username: 'me'});
		this.model.destroy({processData: true, success: deleteAccountSuccess, error: deleteAccountFail, wait: true});

		
	},


	render: function () {
		
		var model = this.model;
		var view = this;
				
		var fetchUserSuccess = function(model, response){
													
			$(view.el).html(view.template(model.toJSON()));
			$('input[name=email]', view.el).tooltip({title: 'Please ask an administrator to change your email address.', placement: 'bottom', delay: 500})

					
			var el = view.$el;	
			
     		return view;
							
					
		}
				
				
		model.fetch({success: fetchUserSuccess});
	
		 
	}
	
});

