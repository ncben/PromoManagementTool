$(function(){
	
	$("form").each(function(){
	
		$(this).find('textarea, select, input[type!=button][type!=image][type!=submit][type!=hidden]').each(function(){
			
			var width =  100*$(this).outerWidth()/$(this).parent().width();
			
			$(this).wrap($('<div class="input_wrapper" style="margin-top: '+$(this).css('margin-top')+';margin-right: '+$(this).css('margin-right')+';margin-bottom: '+$(this).css('margin-bottom')+';margin-left: '+$(this).css('margin-left')+'; " />'));
			
			if($(this).is("input[type=checkbox], input[type=radio]")){
				
				$(this, "input[type=checkbox], input[type=radio]")
				.css({'float': 'none', 'margin' : 0});
					
			}else if ($(this).is("select")){
				
				$(this).parent().css("width", width+'%')
				.end().css({'width': (100*($(this).parent().width()-9)/$(this).parent().width()) + '%', 'max-width': '100%', 'margin': 0})
				
				
			}else{
				
				$(this)
				.css({'width': '100%', 'max-width': '100%', 'margin': 0})
				.parent().css("width", ( width > 100 || width <=0 ? 100 : width )+'%');
				
			}
				
			
			if($(this).is("input[type=checkbox], input[type=radio], select")){
			
				$(this).parent().append('<img src="https://fa87bcbdd11ecfc69c9c-2dc64977f17434bd126a05fd8b10abd3.ssl.cf2.rackcdn.com/ClassObjects/resources/images/spacer.gif" width="9" alt="" />');
				
			}
			
			
		})
		
		
		$(this).on("submit", function(e){
						
			err=0;
			
			var obj = $(this).data('submit') == 'entire-page' ? $("body") : $(this);
						
			obj.find("textarea, select, input[type!=button][type!=image][type!=submit][type!=hidden]").each(function(){
				
				$(this).off("change").on("change", function(){$(this).validate()});
				
				if($.trim($(this).val()) || $(this).data('required') == true){
					
					$(this).validate();
					
				}
				
			})
			
			if(err>0){
					
				e.preventDefault();
				
				$(".input_wrapper.error_container").eq(0).find('select, input, textarea').eq(0).focus();
				
				var offset = 0;
				try {
					offset = $(document.activeElement).offset().top;
				}
				catch (e) {}
				if (offset > 50) {
					fbScrollTo(offset - 30);
				}
					
			}else{
			
				e.preventDefault();
				
				var ref = getParameterByName('ref') || window.__refId || '';
																
				var postForm = $.proxy(function(accessToken){
					
					$.ajaxSetup({
						statusCode: {
							404: function(){
		
								window.location = 'https://promocms.dja.com/tpl/404-no-reg-form.html';
							},
							500: function() {
								window.location = 'https://promocms.dja.com/tpl/500.html';
								
							}
						}
					});
					
					$.post($(this).prop('action'), ($(this).data('submit') == 'entire-page' ? $("body").find("textarea, select, input").serialize()+ (typeof postdata != 'undefined' && postdata ?'&'+postdata:'') : ($(this).serialize() + (typeof postdata != 'undefined' && postdata?'&'+postdata:''))) + '&datapath='+(typeof postpath != 'undefined'? encodeURIComponent(postpath) :'')+encodeURIComponent($(this).data('path'))+ '&uid='+(typeof uid != 'undefined'? encodeURIComponent(uid) :'')+ '&access_token='+(typeof accessToken != 'undefined'? encodeURIComponent(accessToken) :'')+ '&__isFacebookTabOn='+(typeof __isFacebookTabOn != 'undefined'? encodeURIComponent(__isFacebookTabOn) :'')+ '&__isFacebookCanvasOn='+(typeof __isFacebookCanvasOn != 'undefined'? encodeURIComponent(__isFacebookCanvasOn) :'')+'&ref='+ref+ '&fpu='+(typeof __fpu != 'undefined'? encodeURIComponent(__fpu) : '' ), $.proxy(function(response){
					
						if(!response.error){
							
							if(response.next){
								var refQueryString = (ref ? (response.next.indexOf('?') === -1 ? '?' : '&')+'ref='+ref : '');
							}

						
							if(response.passData && response.next){
								
								var passData = {};
								
								passData['dataString'] = ($(this).data('submit') == 'entire-page' ? ($("body").find("textarea, select, input").not("[name=recaptcha_challenge_field], [name=recaptcha_response_field]").serialize()+ (typeof postdata != 'undefined' && postdata ?'&'+postdata:'')) : ($(this).find("textarea, select, input").not("[name=recaptcha_challenge_field], [name=recaptcha_response_field]").serialize()+ (typeof postdata != 'undefined' && postdata?'&'+postdata:'')));
								passData['dataPath'] = (typeof postpath != 'undefined'? postpath :'')+$(this).data('path');
								passData['uid'] = ((typeof response.uid != 'undefined'? response.uid :'') || (typeof uid != 'undefined'? uid :''));
								passData['access_token'] = (typeof accessToken != 'undefined'? encodeURIComponent(accessToken) :'');
								passData['ref'] = ref;
								
								(window.__signedRequest && (window.__isFacebookTabOn || window.__isFacebookCanvasOn)) ? passData['signed_request'] =  encodeURIComponent(window.__signedRequest) : '';
								(window.__isFacebookTabOn) ? passData['__isFacebookTabOn'] =  encodeURIComponent(window.__isFacebookTabOn) : '';
								(window.__isFacebookCanvasOn) ? passData['__isFacebookCanvasOn'] =  encodeURIComponent(window.__isFacebookCanvasOn) : '';
								(window.__isFacebookCanvasOn) ? passData['__isFacebookCanvasOn'] =  encodeURIComponent(window.__isFacebookCanvasOn) : '';
								(window.__fpu) ? passData['__fpu'] =  encodeURIComponent(window.__fpu) : '';


								

								
								redirectToNext(response.next+(refQueryString || ''), passData, 'post');
								
							}else if(response.next){
								
								redirectToNext(response.next+(refQueryString || ''), {}, 'get');
								
							}else{
							
									
								
							}
						
							
						}else{
							
							if(typeof response.error == 'object'){
								
								for(key in response.error){
								
									if(response.error.hasOwnProperty(key)){
										
										if(response.error[key] == 'recaptcha_response_field'){
											
											Recaptcha.reload();
											
										}	
																		
										$("#"+response.error[key]).focus().parents('.input_wrapper').addClass('error_container');
										
									}
									
								}
								
							}
							
						}
						
					},this),'json') 
					
				}, this);
				
				if(!window.__fbAllowAccessOn)postForm();
					else{
					
						FB.login(function(response) {
							if (response.authResponse && response.authResponse.accessToken) {
								postForm(response.authResponse.accessToken);
							} 
						});	
						
					}
				
				
				
			}
				
				  
		})
		
		
	
		
	})

	var fbScrollTo = function(y){
	  
 		if (window.self === window.top) {
	 
			$("html, body").animate({ scrollTop: y+"px" });
 
		}else{	  
	  
	  		if(typeof FB != 'undefined' && typeof FB.Canvas != 'undefined' && typeof  FB.Canvas.getPageInfo == 'function'){
				FB.Canvas.getPageInfo(function(pageInfo){
					$({y: pageInfo.scrollTop}).animate(
						{y: y},
							{duration: 500, step: function(offset){
								FB.Canvas.scrollTo(0, offset);
							}
					});
				});
			}
		}
	}


	$.fn.validate = function(){
	
		var type = $(this).data('validation'), regex;
		var value = $.trim($(this).is("input[type=checkbox], input[type=radio]") ? ($(this).is("input[type=radio]") && $("input[type=radio][name='"+$(this).prop('name')+"']").is(":checked") || $(this).is("input[type=checkbox]") && $(this).is(":checked")) ? $(this).val() : '' : $(this).val());
		
		
		if(type == 'match'){
			var matchId = $(this).data('match');
									
			var matchField = $(this).parents('form').find("input, select, textarea").filter(function(){
			
				return matchId && $(this).prop('id') && $(this).prop('id') == matchId;
				
			}).eq(0);
			
			regex = matchField.data('validation');
		}
		
		if(type && type.substring(0,1) == '/'){
			
			type = type.split('/');
			
			flag = type.pop();
			
			type.shift();
			
			regex = new RegExp(type.join('/'), flag);
						
        }else{
         	switch (type){
				case 'email':
					regex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
					break;
				 case 'date':
					regex = /^(0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])[\/\-]((\d{4})|(\d{2}))$/;
					break;
				case 'phone':
					regex = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
					break;
				case 'address':
					regex = / +/;
					break;
				
				case 'name':
                    regex = /^[-'a-zA-ZÀ-ÖØ-öø-ſ ]+$/;
					break;
				case 'city':
					regex = /^[-.a-zA-Z ]+$/;
					break;
				case 'zip':
					regex = /^\d{5}(-\d{4})?$/;
					break;
				case 'zip_ca_only':
					regex = /^([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d)$/;
					break;
				case 'zip_with_ca':
					regex = /^((\d{5}-\d{4})|(\d{5})|([A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d))$/;
					break;
				case 'number':
					regex = /^[0-9]+$/;
					break;
				case 'numeric':
					regex = /^[\d,]+$/;
					break;
				case 'alphanumeric':
					regex = /^[0-9a-zA-Z]+$/;
					break;
				default:
					regex = /^(?!\s*$).+/;
					break;
			}	
		}
		
		if(type == 'match'){
						
			if(matchField.length > 0 && value.toLowerCase() != $.trim(matchField.val().toLowerCase())){

				regex = /^(?!x)x$/;
					
			}
			
		}
		
		if(!regex.test(value)){
			
			err++;
			$(this).parents('.input_wrapper').addClass('error_container');
			
		}else{
			
			if($(this).is("input[type=radio]")){
		
				$("input[type=radio][name='"+$(this).prop('name')+"']").parents('.input_wrapper').removeClass('error_container');
			
			}
			$(this).parents('.input_wrapper').removeClass('error_container');
		}
		
	}
})

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
	results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/*Post to Page*/
function redirectToNext(path, params, method) {
    method = method || "post"; 
 
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);

    for(var key in params) {
        if(params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
         }
    }

    document.body.appendChild(form);
    form.submit();
}