!function($, wysi) {
    "use strict";

    var tpl = {
        "font-styles": function(locale, options) {
            var size = (options && options.size) ? ' btn-'+options.size : '';
            return "<li class='dropdown'>" +
              "<a class='btn btn-default dropdown-toggle" + size + "' data-toggle='dropdown' href='#'>" +
              "<i class='icon-font'></i>&nbsp;<span class='current-font'>" + locale.font_styles.normal + "</span>&nbsp;<b class='caret'></b>" +
              "</a>" +
              "<ul class='dropdown-menu'>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='div' tabindex='-1'>" + locale.font_styles.normal + "</a></li>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h1' tabindex='-1'>" + locale.font_styles.h1 + "</a></li>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h2' tabindex='-1'>" + locale.font_styles.h2 + "</a></li>" +
                "<li><a data-wysihtml5-command='formatBlock' data-wysihtml5-command-value='h3' tabindex='-1'>" + locale.font_styles.h3 + "</a></li>" +
              "</ul>" +
            "</li>";
        },

        "emphasis": function(locale, options) {
            var size = (options && options.size) ? ' btn-'+options.size : '';
            return "<li>" +
              "<div class='btn-group'>" +
                "<a class='btn btn-default" + size + "' data-wysihtml5-command='bold' title='CTRL+B' tabindex='-1'>" + locale.emphasis.bold + "</a>" +
                "<a class='btn btn-default" + size + "' data-wysihtml5-command='italic' title='CTRL+I' tabindex='-1'>" + locale.emphasis.italic + "</a>" +
                "<a class='btn btn-default" + size + "' data-wysihtml5-command='underline' title='CTRL+U' tabindex='-1'>" + locale.emphasis.underline + "</a>" +
              "</div>" +
            "</li>";
        },

        "lists": function(locale, options) {
            var size = (options && options.size) ? ' btn-'+options.size : '';
            return "<li>" +
              "<div class='btn-group'>" +
                "<a class='btn btn-default" + size + "' data-wysihtml5-command='insertUnorderedList' title='" + locale.lists.unordered + "' tabindex='-1'><i class='icon-list'></i></a>" +
                "<a class='btn btn-default" + size + "' data-wysihtml5-command='insertOrderedList' title='" + locale.lists.ordered + "' tabindex='-1'><i class='icon-th-list'></i></a>" +
                "<a class='btn btn-default" + size + "' data-wysihtml5-command='Outdent' title='" + locale.lists.outdent + "' tabindex='-1'><i class='icon-indent-right'></i></a>" +
                "<a class='btn btn-default" + size + "' data-wysihtml5-command='Indent' title='" + locale.lists.indent + "' tabindex='-1'><i class='icon-indent-left'></i></a>" +
              "</div>" +
            "</li>";
        },

        "link": function(locale, options) {
            var size = (options && options.size) ? ' btn-'+options.size : '';
            return "<li>" +
				"<div class=\"external-event-template insertLink\" style=\"display:none;\" data-title=\""+locale.link.insert+"\">"+
				"<form class=\"addLinkToEditorForm\" data-title\""+locale.link.insert+"\" style=\"width: 360px; max-width:100%;\">"+  
					"<div class=\"overlay-field\">"+
						"<input type=\"text\" class=\"fieldLabel\" style=\"width: 100%\" placeholder=\"Link Text\" \/>"+"<\/div>"+
					"<div class=\"overlay-field relative\">"+
						"<input type=\"text\" class=\"fieldURL\" style=\"width: 100%; padding-right: 25px; \" placeholder=\"Link URL\" \/>"+  
						"<button type=\"button\" class=\"close findPage\" title=\"Use an existing page\" data-placement=\"left\" aria-hidden=\"true\" style=\"position: absolute; right: 3px; top: 7px;\"><i class=\"icon-folder-open\"><\/i><\/button>"+
					"<\/div>"+
					"<div class=\"overlay-field\">Open in:"+
						"<select class=\"addLinkOpenOption\">"+
							"<option value=\"_self\">Same Window (Self)<\/option>"+
							"<option value=\"_top\">Same Window (Top)<\/option>"+
							"<option value=\"new\">New Full Page Window<\/option>"+
							"<option value=\"popup\">Popup<\/option>"+
						"<\/select>"+
					"<\/div>"+
					"<div class=\"link-popup-only\" style=\"display:none;\">"+
						"<input type=\"text\" class=\"popupWidth\" placeholder=\"Width\" style=\"width: 50px\" \/>"+  "                            x"+
						"<input type=\"text\" class=\"popupHeight\" placeholder=\"Height\" style=\"width: 50px\" \/>"+  "                    <\/div>"+
						"<div class=\"form-actions\" style=\"white-space: nowrap; \">"+
							"<button type=\"submit\" class=\"btn btn-blue addConfirm\">"+locale.link.insert+"<\/button>"+  "                            <button type=\"button\" class=\"btn btn-default addCancel\">"+locale.link.cancel+"<\/button>"+  "<\/div>"+  
				"<\/form>" +
				"<\/div>" +
              "<a class='btn btn-default" + size + "' data-wysihtml5-command='createLink' title='" + locale.link.insert + "' tabindex='-1'><i class='icon-link'></i></a>" +
            "</li>";
        },

        "image": function(locale, options) {
            var size = (options && options.size) ? ' btn-'+options.size : '';
			
            return "<li>" +
			"<div class=\"external-event-template insertImage\" style=\"display:none;\" data-title=\""+locale.image.insert+"\">"
			+"<form class=\"fill-up addNewImageToEditorForm\" data-title=\""+locale.image.insert+"\">"
 			 	+"<div  style=\"margin-bottom:10px; border: 1px solid #D8D8D8;\">"
 					+"<input type=\"text\" placeholder=\"Link to the image\" class=\"addImageContent\" style=\"border:0;\">"
 				+"<\/div>"
 				+"<div class=\"overlay-field\">"
					+"<div class=\"btn btn-default btn-xs\" style=\"position:relative; overflow:hidden;\">Browse Computer"
 						+"<input type=\"file\" name=\"imageFile\" class=\"browseComputer\" style=\"opacity: 0;bottom: 0;cursor: pointer;left: 0;position: absolute;right: 0;top: 0;z-index: 1;\" \/>"
 					+"<\/div>"
 				+"<\/div>"
 				+"<div class=\"uploadErrorMsg\" style=\"color:red\"><\/div>"
 					+"<div class=\"form-actions\" style=\"white-space: nowrap; \">"
						+"<button type=\"submit\" class=\"btn btn-blue addImageConfirm\">"+locale.image.insert+"<\/button>"
 						+"<button type=\"button\" class=\"btn btn-default addImageCancel\">"+ locale.image.cancel+"<\/button>"
 					+"<\/div>"
 			+"<\/form>"
			+"</div>"
            + "<a class='btn btn-default" + size + "' data-wysihtml5-command='insertImage' title='" + locale.image.insert + "' tabindex='-1'><i class='icon-picture'></i></a>" 
            +"</li>";
        },

        "html": function(locale, options) {
            var size = (options && options.size) ? ' btn-'+options.size : '';
            return "<li>" +
              "<div class='btn-group'>" +
                "<a class='btn btn-default" + size + "' data-wysihtml5-action='change_view' title='" + locale.html.edit + "' tabindex='-1'><i class='icon-pencil'></i></a>" +
              "</div>" +
            "</li>";
        },

        "color": function(locale, options) {
            var size = (options && options.size) ? ' btn-'+options.size : '';
            return "<li class='dropdown'>" +
              "<a class='btn btn-default dropdown-toggle" + size + "' data-toggle='dropdown' href='#' tabindex='-1'>" +
                "<span class='current-color'>" + locale.colours.black + "</span>&nbsp;<b class='caret'></b>" +
              "</a>" +
              "<ul class='dropdown-menu'>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='black'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='black'>" + locale.colours.black + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='silver'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='silver'>" + locale.colours.silver + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='gray'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='gray'>" + locale.colours.gray + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='maroon'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='maroon'>" + locale.colours.maroon + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='red'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='red'>" + locale.colours.red + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='purple'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='purple'>" + locale.colours.purple + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='green'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='green'>" + locale.colours.green + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='olive'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='olive'>" + locale.colours.olive + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='navy'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='navy'>" + locale.colours.navy + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='blue'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='blue'>" + locale.colours.blue + "</a></li>" +
                "<li><div class='wysihtml5-colors' data-wysihtml5-command-value='orange'></div><a class='wysihtml5-colors-title' data-wysihtml5-command='foreColor' data-wysihtml5-command-value='orange'>" + locale.colours.orange + "</a></li>" +
              "</ul>" +
            "</li>";
        }
    };

    var templates = function(key, locale, options) {
        return tpl[key](locale, options);
    };


    var Wysihtml5 = function(el, options) {
        this.el = el;
        var toolbarOpts = options || defaultOptions;
        for(var t in toolbarOpts.customTemplates) {
          tpl[t] = toolbarOpts.customTemplates[t];
        }
        this.toolbar = this.createToolbar(el, toolbarOpts);
        this.editor =  this.createEditor(options);

        window.editor = this.editor;

        $('iframe.wysihtml5-sandbox').each(function(i, el){
            $(el.contentWindow).off('focus.wysihtml5').on({
                'focus.wysihtml5' : function(){
                    $('li.dropdown').removeClass('open');
                }
            });
        });
    };

    Wysihtml5.prototype = {

        constructor: Wysihtml5,

        createEditor: function(options) {
            options = options || {};
            
            // Add the toolbar to a clone of the options object so multiple instances
            // of the WYISYWG don't break because "toolbar" is already defined
            options = $.extend(true, {}, options);
            options.toolbar = this.toolbar[0];

            var editor = new wysi.Editor(this.el[0], options);

            if(options && options.events) {
                for(var eventName in options.events) {
                    editor.on(eventName, options.events[eventName]);
                }
            }
            return editor;
        },

        createToolbar: function(el, options) {
            var self = this;
            var toolbar = $("<ul/>", {
                'class' : "wysihtml5-toolbar",
                'style': "display:none"
            });
            var culture = options.locale || defaultOptions.locale || "en";
            for(var key in defaultOptions) {
                var value = false;

                if(options[key] !== undefined) {
                    if(options[key] === true) {
                        value = true;
                    }
                } else {
                    value = defaultOptions[key];
                }

                if(value === true) {
                    toolbar.append(templates(key, locale[culture], options));

                    if(key === "html") {
                        this.initHtml(toolbar);
                    }

                    if(key === "link") {
                        this.initInsertLink(toolbar);
                    }

                    if(key === "image") {
                        this.initInsertImage(toolbar);
                    }
                }
            }

            if(options.toolbar) {
                for(key in options.toolbar) {
                    toolbar.append(options.toolbar[key]);
                }
            }

            toolbar.find("a[data-wysihtml5-command='formatBlock']").click(function(e) {
                var target = e.target || e.srcElement;
                var el = $(target);
                self.toolbar.find('.current-font').text(el.html());
            });

            toolbar.find("a[data-wysihtml5-command='foreColor']").click(function(e) {
                var target = e.target || e.srcElement;
                var el = $(target);
                self.toolbar.find('.current-color').text(el.html());
            });

            this.el.before(toolbar);

            return toolbar;
        },

        initHtml: function(toolbar) {
            var changeViewSelector = "a[data-wysihtml5-action='change_view']";
            toolbar.find(changeViewSelector).click(function(e) {
                toolbar.find('a.btn').not(changeViewSelector).toggleClass('disabled');
            });
        },

        initInsertImage: function(toolbar) {
			
			var self = this;
            var caretBookmark;
						
			var template = toolbar.find('.external-event-template.insertImage').html();
			var insertImageButton = toolbar.find('a[data-wysihtml5-command=insertImage]');
         
			insertImageButton
			.on("click", function(){
				
				var activeButton = $(this).hasClass("wysihtml5-command-active");

                if (!activeButton) {
                    self.editor.currentView.element.focus(false);
                    caretBookmark = self.editor.composer.selection.getBookmark();
                   
                    return false;
                }
                else {
                    return true;
                }		
				
			})
			
			if(insertImageButton.hasClass('initialized'))return;
			
			insertImageButton.popover({
				
				html: true,
				placement: 'right',
				title: 'Insert Image',
				content: template
				
			})
			.on('shown.bs.popover', function () {
				
				self.editor.currentView.element.focus(false);
				
				//$(this).data('bs.popover')['$arrow'].remove();
		
				$(".popover .browseComputer").fileUpload({
					url: "/dashboard/pages/uploadImage?pid="+window['pid'], 
					progressbar: {
					  url: "/dashboard/pages/uploadImage",
					  barColor: "#62c462",
					  stripSpeed: 2, 
					  moveSpeed: 1.6,
					  width: 106,
					  height: 10
					},
					allowedFileTypes: '.jpg, .jpeg, .gif, .png',
					hiddencallback: $(".popover .addImageContent"),
					maxFileSize: 1, 
					onBeforeUpload: function(){
						$(".popover .uploadErrorMsg").empty();	
						$(".popover .browseComputer").hide();
					  },
					onSuccess: function(){
								
					  }, 
					callback: function(data){	
					
						$(".popover .browseComputer").val('').show();
					
					   },
					error: function(error){
						$(".popover .browseComputer").val('').show();
						$(".popover .uploadErrorMsg").text(error);
					 },
					mobileDetect: false
					
				});
			
					
				$(".popover .addNewImageToEditorForm").on("submit",  function(event){
							
					event.preventDefault();
					
					var url = $(".popover .addNewImageToEditorForm:visible").find('.addImageContent').val();
									
					self.editor.currentView.element.focus();
					
					if (caretBookmark) {
					  self.editor.composer.selection.setBookmark(caretBookmark);
					  caretBookmark = null;
					}
				
					self.editor.composer.commands.exec("insertImage", url);
					
					$('.popover .addNewImageToEditorForm')[0].reset();
					insertImageButton.popover('hide');
									
													
				}); 
				
				$('.popover .addCancel').off("click").on("click", function(event){
					
					event.preventDefault();
					
					$('.popover .addNewImageToEditorForm')[0].reset();
					insertImageButton.popover('hide');
					insertImageButton.removeClass("wysihtml5-command-active");
					
				});
									
			})
			
			.on('hide.bs.popover', function(){
			
				self.editor.currentView.element.focus();	
				
			})
			.addClass('initialized');
			
			
        },
	
        initInsertLink: function(toolbar) {
            var self = this;
            var caretBookmark;
						
			var template = toolbar.find('.external-event-template.insertLink').html();
			var insertLinkButton = toolbar.find('a[data-wysihtml5-command=createLink]');
		
							
			insertLinkButton
			.on("click", function(){
				
				var activeButton = $(this).hasClass("wysihtml5-command-active");

                if (!activeButton) {
                    self.editor.currentView.element.focus(false);
                    caretBookmark = self.editor.composer.selection.getBookmark();
                   
                    return false;
                }
                else {
                    return true;
                }		
				
			})
			
			if(insertLinkButton.hasClass('initialized'))return;
			
			insertLinkButton.popover({
				
				html: true,
				placement: 'right',
				title: 'Insert link',
				content: template
				
			})
			.on('shown.bs.popover', function () {
				
				if(caretBookmark != ''){
				
					$(".popover .addLinkToEditorForm .fieldLabel").hide();
					
				}
				
				self.editor.currentView.element.focus(false);
				
				//$(this).data('bs.popover')['$arrow'].remove();

				$(".popover .addLinkOpenOption").on("change" ,function(){
				
					if($(this).val() == 'popup')$(".popover .link-popup-only").show();
					else $(".popover .link-popup-only").hide();
					
				})
		
				if($(".pagePanelsApplyTo") && $(".pagePanelsApplyTo").data('pages')){
		
					$(".popover .findPage")
					.tooltip()
					.editable({
						showbuttons: false,
						type: 'select',
						display: function(value, sourceData){
						
							
						},
						source: $.proxy(function(){
							
							$(".popover").filter(function(){
						
								return $(this).find('.popover-title').text() == 'Use an existing page'
								
							})
							.find('.arrow').hide();
			
							var choices = [
						
							];
							
							var pages = $(".pagePanelsApplyTo").data('pages');
							
							if(typeof pages == 'object'){
							
								for(key in pages){
								
									if(pages.hasOwnProperty(key)){
									
										choices.push({value: key, text: pages[key].name});
										
									}
									
								}	
								
								
							}
											
							return choices;
							
						},this),
						success: function(response, newValue) {
							$(this).parents('.overlay-field').find('.fieldURL').val(newValue);
						}
						
					});
					
				}else{
				
					$(".popover .findPage").hide();	
					
				}
					
					
				$(".popover .addLinkToEditorForm").on("submit",  function(event){
							
					event.preventDefault();
					
					var url = $(".popover .addLinkToEditorForm:visible").find('.fieldURL').val();
					var text = $(".popover .addLinkToEditorForm:visible").find('.fieldLabel').val();
					var target = $(".popover .addLinkToEditorForm:visible").find('.addLinkOpenOption').val();
					var onclick = "";
					if(target == 'popup'){
						
						var popupWidth = $(".popover .addLinkToEditorForm:visible").find('.popupWidth').val(); 
						var popupHeight = $(".popover .addLinkToEditorForm:visible").find('.popupHeight').val(); 
					
						onclick = 'window.open(\''+((typeof url != 'undefined') ? url : '')+'\', \'\', \'height='+((typeof popupHeight != 'undefined' && popupHeight) ? popupHeight : '800')+',width='+((typeof popupWidth != 'undefined' && popupWidth) ? popupWidth : '800')+'\');return false;';
						target = "_self";
						url="#";	
						
					}
										
					self.editor.currentView.element.focus();
					
					if (caretBookmark) {
					  self.editor.composer.selection.setBookmark(caretBookmark);
					  caretBookmark = null;
					}
					
					var obj = {
						href: url,
						onclick: onclick,
						target: target,
						rel: "nofollow"
					};
					
					if($(".popover .addLinkToEditorForm .fieldLabel").is(":visible")){
											
						obj.text = text;	
						
					}
					
					self.editor.composer.commands.exec("createLink", obj);
					
					$('.popover .addLinkToEditorForm')[0].reset();
					insertLinkButton.popover('hide');
									
													
				}); 
				
				$('.popover .addCancel').off("click").on("click", function(event){
					
					event.preventDefault();
					
					$('.popover .addLinkToEditorForm')[0].reset();
					insertLinkButton.popover('hide');
					insertLinkButton.removeClass("wysihtml5-command-active");
					
				});
									
			})
			
			.on('hide.bs.popover', function(){
			
				self.editor.currentView.element.focus();	
				
			})
			.addClass('initialized');
			
			
        }
		
    };

    // these define our public api
    var methods = {
        resetDefaults: function() {
            $.fn.wysihtml5.defaultOptions = $.extend(true, {}, $.fn.wysihtml5.defaultOptionsCache);
        },
        bypassDefaults: function(options) {
            return this.each(function () {
                var $this = $(this);
                $this.data('wysihtml5', new Wysihtml5($this, options));
            });
        },
        shallowExtend: function (options) {
            var settings = $.extend({}, $.fn.wysihtml5.defaultOptions, options || {});
            var that = this;
            return methods.bypassDefaults.apply(that, [settings]);
        },
        deepExtend: function(options) {
            var settings = $.extend(true, {}, $.fn.wysihtml5.defaultOptions, options || {});
            var that = this;
            return methods.bypassDefaults.apply(that, [settings]);
        },
        init: function(options) {
            var that = this;
            return methods.shallowExtend.apply(that, [options]);
        }
    };

    $.fn.wysihtml5 = function ( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.wysihtml5' );
        }    
    };

    $.fn.wysihtml5.Constructor = Wysihtml5;

    var defaultOptions = $.fn.wysihtml5.defaultOptions = {
        "font-styles": true,
        "color": false,
        "emphasis": true,
        "lists": true,
        "html": false,
        "link": true,
        "image": true,
        events: {},
        parserRules: {
            classes: {
                // (path_to_project/lib/css/wysiwyg-color.css)
                "wysiwyg-color-silver" : 1,
                "wysiwyg-color-gray" : 1,
                "wysiwyg-color-white" : 1,
                "wysiwyg-color-maroon" : 1,
                "wysiwyg-color-red" : 1,
                "wysiwyg-color-purple" : 1,
                "wysiwyg-color-fuchsia" : 1,
                "wysiwyg-color-green" : 1,
                "wysiwyg-color-lime" : 1,
                "wysiwyg-color-olive" : 1,
                "wysiwyg-color-yellow" : 1,
                "wysiwyg-color-navy" : 1,
                "wysiwyg-color-blue" : 1,
                "wysiwyg-color-teal" : 1,
                "wysiwyg-color-aqua" : 1,
                "wysiwyg-color-orange" : 1
            },
            tags: {
                "b":  {},
                "i":  {},
                "br": {},
                "ol": {},
                "ul": {},
                "li": {},
                "h1": {},
                "h2": {},
                "h3": {},
                "blockquote": {},
                "u": 1,
                "img": {
                    "check_attributes": {
                        "width": "numbers",
                        "alt": "alt",
                        "src": "url",
                        "height": "numbers",
						'style': 'allow',
                        'class': 'allow'
                    }
                },
                "a":  {
                    set_attributes: {
                      //  target: "_blank",
                      //  rel:    "nofollow"
                    },
                    check_attributes: {
                        href:   "allow", // important to avoid XSS
						'style': 'allow',
                        'class': 'allow'
                    }
                },
                "span": 1,
                "div": 1,
                // to allow save and edit files with code tag hacks
                "code": 1,
                "pre": 1
            }
        },
        stylesheets: ["./lib/css/wysiwyg-color.css"], // (path_to_project/lib/css/wysiwyg-color.css)
        locale: "en"
    };

    if (typeof $.fn.wysihtml5.defaultOptionsCache === 'undefined') {
        $.fn.wysihtml5.defaultOptionsCache = $.extend(true, {}, $.fn.wysihtml5.defaultOptions);
    }

    var locale = $.fn.wysihtml5.locale = {
        en: {
            font_styles: {
                normal: "Normal text",
                h1: "Heading 1",
                h2: "Heading 2",
                h3: "Heading 3"
            },
            emphasis: {
                bold: "Bold",
                italic: "Italic",
                underline: "Underline"
            },
            lists: {
                unordered: "Unordered list",
                ordered: "Ordered list",
                outdent: "Outdent",
                indent: "Indent"
            },
            link: {
                insert: "Insert link",
                cancel: "Cancel"
            },
            image: {
                insert: "Insert image",
                cancel: "Cancel"
            },
            html: {
                edit: "Edit HTML"
            },
            colours: {
                black: "Black",
                silver: "Silver",
                gray: "Grey",
                maroon: "Maroon",
                red: "Red",
                purple: "Purple",
                green: "Green",
                olive: "Olive",
                navy: "Navy",
                blue: "Blue",
                orange: "Orange"
            }
        }
    };

}(window.jQuery, window.wysihtml5);
