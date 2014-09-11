/*
 * Copyright 2010, Wen Pu (dexterpu at gmail dot com)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * Check out http://www.cs.illinois.edu/homes/wenpu1/chatbox.html for document
 *
 * Depends on jquery.ui.core, jquery.ui.widiget, jquery.ui.effect
 *
 * Also uses some styles for jquery.ui.dialog
 *
 */
//TODO: implement destroy()
(function($){
	$.widget("ui.chatbox", {
		options: {
			id: null, //id for the DOM element
			title: null, // title of the chatbox
			user: null, // can be anything associated with this chatbox
			hidden: false,
			offset: 0, // relative to right edge of the browser window
			width: 300, // width of the chatbox
			height: 240, // height of the chatbox
			groupBox: false, //if a group Chatbox?
			video: 0, // height of the videoBox
			messageSent: function(id, user, msg){
//				override this
				this.boxManager.addMsg(user.first_name, msg);
			},
			boxClosed: function(id) {}, // called when the close icon is clicked
			boxManager: {
//				thanks to the widget factory facility
//				similar to http://alexsexton.com/?p=51
				init: function(elem) {
					this.elem = elem;
				},

				addMsg: function(sender, peer, msg) {
					var self = this;
					var box = self.elem.uiChatboxLog;
					var e = document.createElement('div');
					if((peer==null)||($(peer).html()=="")){
						var fContent = msg
					} else {
						var fContent = "<b>" + peer +":</b> " + msg
					}
					$(e).html(fContent)
					.addClass("ui-chatbox-msg");
					box.append(e);
					self._scrollToBottom();
					if(!self.elem.uiChatboxTitlebar.hasClass("ui-state-focus") && !self.highlightLock) {
						self.highlightLock = true;
						self.highlightBox();
					}
				},

				highlightBox: function() {
					this.elem.uiChatbox.addClass("ui-state-highlight");
					var self = this;
//					Get highlight color from css
					var dummy_element = $("<p class=\"chatWindowhighlighted\"></div>");
					var options = {color: $(dummy_element).css("color")};
					self.elem.uiChatboxTitlebar.effect("highlight", options, 300);
					if (((typeof mustBounceBoxForChatWindow == 'function')&&(mustBounceBoxForChatWindow(self)))||((typeof mustBounceBoxForChatWindow != 'function'))) {
						self.elem.uiChatbox.effect("bounce", {times:3}, 300, function(){
							self.highlightLock = false;
							self._scrollToBottom();
						});
					} else {
						self.highlightLock = false;
					}
				},
				toggleBox: function(show) {
					this.elem.uiChatbox.toggle(show);
				},
				_scrollToBottom: function() {
					var box = this.elem.uiChatboxLog;
					box.scrollTop(box.get(0).scrollHeight);
				}
			}
		},
		toggleContent: function(event) {
			this.uiChatboxContent.toggle();
			if(this.uiChatboxContent.is(":visible")) {
				this.uiChatboxInputBox.focus();
			}
		},
		widget: function() {
			return this.uiChatbox
		},
		_create: function(){
			var self = this,
			options = self.options,
			title = options.title || "No Title",
//			chatbox
			uiChatbox = (self.uiChatbox = $('<div></div>'))
			.appendTo(document.body)
			.addClass('ui-widget ' +
					'ui-corner-top ' +
					'ui-chatbox'
			)
			.attr('outline', 0)
			.focusin(function(){
//				ui-state-highlight is not really helpful here
				self.uiChatbox.removeClass('ui-state-highlight');
				self.uiChatboxTitlebar.addClass('ui-state-focus');
			})
			.focusout(function(){
				self.uiChatboxTitlebar.removeClass('ui-state-focus');
			}),
//			titlebar
			uiChatboxTitlebar = (self.uiChatboxTitlebar = $('<div></div>'))
			.addClass('ui-widget-header ' +
					'ui-corner-top ' +
					'ui-chatbox-titlebar ' +
					'ui-dialog-header' // take advantage of dialog header style
			)
			.click(function(event) {
				self.toggleContent(event);
			})
			.appendTo(uiChatbox),
			uiChatboxTitle = (self.uiChatboxTitle = $('<span></span>'))
			.html(title)
			.appendTo(uiChatboxTitlebar),
			uiChatboxTitlebarClose = (self.uiChatboxTitlebarClose = $('<a href="#"></a>'))
			.addClass('ui-corner-all ' +
					'ui-chatbox-icon '
			)
			.attr('role', 'button')
			.hover(function() {uiChatboxTitlebarClose.addClass('ui-state-hover');},
					function() {uiChatboxTitlebarClose.removeClass('ui-state-hover');})
//					.focus(function() {
//					uiChatboxTitlebarClose.addClass('ui-state-focus');
//					})
//					.blur(function() {
//					uiChatboxTitlebarClose.removeClass('ui-state-focus');
//					})
					.click(function(event) {
						uiChatbox.hide();
						self.options.boxClosed(self.options.id);
						return false;
					})
					.appendTo(uiChatboxTitlebar),
					uiChatboxTitlebarCloseText = $('<span></span>')
					.addClass('ui-icon-closethick ' + 'chat-thick ' + 'chat-closethick')
					.text('close')
					.appendTo(uiChatboxTitlebarClose),
					uiChatboxTitlebarMinimize = (self.uiChatboxTitlebarMinimize = $('<a href="#"></a>'))
					.addClass('ui-corner-all ' +
							'ui-chatbox-icon'
					)
					.attr('role', 'button')
					.hover(function() {uiChatboxTitlebarMinimize.addClass('ui-state-hover');},
							function() {uiChatboxTitlebarMinimize.removeClass('ui-state-hover');})
//							.focus(function() {
//							uiChatboxTitlebarMinimize.addClass('ui-state-focus');
//							})
//							.blur(function() {
//							uiChatboxTitlebarMinimize.removeClass('ui-state-focus');
//							})
							.click(function(event) {
								self.toggleContent(event);
								return false;
							})
							.appendTo(uiChatboxTitlebar),
							uiChatboxTitlebarMinimizeText = $('<span></span>')
							.addClass('ui-icon-minusthick ' + 'chat-thick ' + ' chat-minusthick')
							.text('minimize')
							.appendTo(uiChatboxTitlebarMinimize),
//							Video Menu button
							uiChatboxTitlebarVideo = (self.uiChatboxTitlebarVideo = $('<a href="#"></a>'))
							.addClass('ui-corner-all ' +
									'ui-chatbox-icon' + ' ui-videobox-icon'
							)
							.attr('role', 'button')
							.hover(function() {uiChatboxTitlebarVideo.addClass('ui-state-hover');},
									function() {uiChatboxTitlebarVideo.removeClass('ui-state-hover');})
									.click(function(event) {
										toggleVideoBox(self)
										return false;
									})
									.appendTo(uiChatboxTitlebar),
									uiChatboxTitlebarVideoText = $('<span></span>')
									.addClass('ui-icon-circle-triangle-e ' + 'chat-thick ' + ' chat-videothick' )
									.text('video')
									.appendTo(uiChatboxTitlebarVideo),
//									Change video-window Menu button
									uiChatboxTitlebarVideoChange = (self.uiChatboxTitlebarVideoChange = $('<a href="#"></a>'))
									.addClass('ui-corner-all ' +
											'ui-chatbox-icon' + ' ui-videobox-icon-change'
									)
									.attr('role', 'button')
									.hover(function() {uiChatboxTitlebarVideoChange.addClass('ui-state-hover');},
											function() {uiChatboxTitlebarVideoChange.removeClass('ui-state-hover');})
											.click(function(event) {
												toggleVideoBoxChange(self)
												return false;
											})
											.appendTo(uiChatboxTitlebar),
											uiChatboxTitlebarVideoText = $('<span></span>')
											.addClass('ui-icon-newwin ' + 'chat-thick ' + ' chat-videoPublisherthick' )
											.text('')
											.appendTo(uiChatboxTitlebarVideoChange),
//											Games Menu button
											uiChatboxTitlebarGames = (self.uiChatboxTitlebarGames = $('<a href="#"></a>'))
											.addClass('ui-corner-all ' +
													'ui-chatbox-icon' + ' ui-games-icon'
											)
											.attr('role', 'button')
											.hover(function() {uiChatboxTitlebarGames.addClass('ui-state-hover');},
													function() {uiChatboxTitlebarGames.removeClass('ui-state-hover');})
													.click(function(event) {
														pickGamesButton(self)
														return false;
													})
													.appendTo(uiChatboxTitlebar),
													uiChatboxTitlebarGamesText = $('<span></span>')
													.addClass('ui-icon-star ' + 'chat-thick ' + ' chat-gamesthick' )
													.text('')
													.appendTo(uiChatboxTitlebarGames),
//													content
													uiChatboxContent = (self.uiChatboxContent = $('<div></div>'))
													.addClass('ui-widget-content ' +
															'ui-chatbox-content '
													)
													.appendTo(uiChatbox),
//													Notification div
													uiChatboxNotify = (self.uiChatboxNotify = $('<div></div>'))
													.addClass('ui-widget-content ' +
															'ui-chatbox-notify'
													)
													.click(function(event) {
														onClickChatNotification(self.uiChatboxNotify)
													})
													.appendTo(uiChatboxContent),
//													VideoBox div
													uiVideobox = (self.uiVideobox = $('<div></div>'))
													.addClass('ui-widget-content ' +
															'ui-videobox'
													)
													.click(function(event) {
//														anything?
													})
													.appendTo(uiChatboxContent),
//													ChatBoxLog
													uiChatboxLog = (self.uiChatboxLog = self.element)
//													.show()
													.addClass('ui-widget-content '+
															'ui-chatbox-log'
													)
													.appendTo(uiChatboxContent),
													uiChatboxInput = (self.uiChatboxInput = $('<div></div>'))
													.addClass('ui-widget-content ' +
															'ui-chatbox-input'
													)
													.click(function(event) {
//														anything?
													})
													.appendTo(uiChatboxContent),
													uiChatboxInputBox = (self.uiChatboxInputBox = $('<textarea></textarea>'))
													.addClass('ui-widget-content ' +
															'ui-chatbox-input-box ' +
															'ui-corner-all'
													)
													.appendTo(uiChatboxInput)
													.keydown(function(event) {
														if(event.keyCode && event.keyCode == $.ui.keyCode.ENTER) {
															var userChatDataInputControlBoolean = (((typeof userChatDataInputControl == 'function')&&(userChatDataInputControl()))||((typeof userChatDataInputControl != 'function')));
															if (userChatDataInputControlBoolean) {
																msg = $.trim($(this).val());
																if (msg.length > 0) {
																	self.options.messageSent(self.options.id, self.options.user, msg);
																}
																$(this).val('');
															}
															return false;
														}
													})
													.focusin(function() {
														uiChatboxInputBox.addClass('ui-chatbox-input-focus');
														var box = $(this).parent().prev();
														box.scrollTop(box.get(0).scrollHeight);
													})
													.focusout(function() {
														uiChatboxInputBox.removeClass('ui-chatbox-input-focus');
													});
//			disable selection
			uiChatboxTitlebar.find('*').add(uiChatboxTitlebar).disableSelection();
//			switch focus to input box when whatever clicked
			uiChatboxContent.children().click(function(){
//				click on any children, set focus on input box
				self.uiChatboxInputBox.focus();
			});
			self._setWidth(self.options.width);
			self._setHeight(self.options.height);
			self._setVideo(self.options.video);
			self._position(self.options.offset);
			self.options.boxManager.init(self);
			if(!self.options.hidden) {
				uiChatbox.show();
			}
		},
		_setOption: function(option, value) {
			if(value != null){
				switch(option) {
				case "hidden":
					if(value) {
						this.uiChatbox.hide();
					}
					else {
						this.uiChatbox.show();
					}
					break;
				case "offset":
					this._position(value);
					break;
				case "show":
					this.uiChatbox.show();
					break;
				case "width":
					this._setWidth(value);
					break;
				case "height":
					this._setHeight(value);
					break;
				case "video":
					this._setVideo(value);
					break;
				case "groupBox":
					this._setGroupBox(value);
					break;
				}
			}
			$.Widget.prototype._setOption.apply(this, arguments);
		},
		_setWidth: function(width) {
			this.uiChatboxTitlebar.width(width + "px");
			this.uiChatboxLog.width(width + "px");
//			this is a hack, but i can live with it so far
			this.uiChatboxInputBox.css("width", (width - 14) + "px");
		},
		_setHeight: function(height) {
			this.uiChatboxLog.height(height + "px");
		},
		_setGroupBox: function(groupBox) {
			this.uiChatboxLog.groupBox(groupBox);
		},
		_setVideo: function(videoHeight) {
			this.uiVideobox.height(videoHeight + "px");
			if (videoHeight==0){
				this.uiVideobox.hide();
			} else {
				this.uiVideobox.show();
			}
		},
		_position: function(offset) {
			this.uiChatbox.css("right", offset);
		}
	});


	//Video Window Manager functions
	////////////////////

	var getVideoBoxForSlug = function(slug){
		var videoBox = $("#" + slug).parent().find("div.ui-videobox");
		if(videoBox.length == 1){
			return videoBox;
		} else {
			return null;
		}
	}

	var getPublisherVideoBoxForSlug = function(slug){
		var pubDiv = $("#stream_publish_videochat_" + slug);
		if (pubDiv.length > 0) {
			return pubDiv
		} else {
			return null;
		}
	}

	var setVideoBoxContent = function(slug,embed){
		var videoBox = getVideoBoxForSlug(slug);
		if(videoBox!=null){
			videoBox.html(embed);
		}
	}

	var addVideoBoxContent = function(slug,embed){
		var videoBox = getVideoBoxForSlug(slug);
		if(videoBox!=null){
			videoBox.append(embed);
		}
	}

	var showVideoBox = function(chatBox){
		chatBox.chatbox("option", "video",videoBoxHeight);
	}

	var hideVideoBox = function(chatBox){
		chatBox.chatbox("option", "video", 0);
	}

	//Function called from JQuery UI Plugin
	var toggleVideoBox = function(uiElement){
		var slug = $(uiElement.element).attr("id");
		// clickVideoChatButton(slug);


		$(function(event, ui) {
			var box = null;
			if(box) {
				box.videobox("option", "boxManager").toggleBox();
			}else {
				var added=verifyAdded(slug+'_video');
				var el="#"+slug
				if (added=="false") {
					var el = document.createElement('div');
					el.setAttribute('id', slug+'_video');
				}	
				box = $(el).videobox({id:slug+'_video', 
					user:{key : "value"},
					title : "Webcam: "+slug,
					sender: slug,
					camaction: 'view',
					messageSent : function(id, user, msg) {
						verifyPosition(slug);
						$("#"+slug).videobox("option", "boxManager").addMsg(user, msg);
						//webSocket.send("/pm "+suser+","+msg);
					}
				});
				box.videobox("option", "show",1); 
			}
		});
	}

	//Function called from JQuery UI Plugin
	var toggleVideoBoxChange = function(uiElement){
		var slug = $(uiElement.element).attr("id");
		clickVideoChangeChatButton(slug);
	}

	var toggleVideoBoxForSlug = function(slug,force){
		var aux;
		var chatBox = getChatBoxForSlug(slug);

		if(chatBox==null) {
			return null;
		}

		if(typeof force != 'undefined'){
			aux = force;
		} else {
			if (chatBox.chatbox("option", "video")==0){
				aux=true;
			} else {
				aux=false;
			}
		}

		if (aux){
			//Show
			showVideoBox(chatBox);
			return true;
		} else {
			//Hide
			hideVideoBox(chatBox);
			return false;
		}
	}

	////////////////////
	//Videochat button actions
	////////////////////
	var clickVideoChatButton = function(slug){
		var videoBoxVisibility = 1;
		if (videoBoxVisibility) {
			openVideoChatWindow(slug);
		} else {
			closeVideoChatWindow(slug);
		}
	}

	var closeVideoChatWindow = function(slug){
		//Show games button
		$(PRESENCE.WINDOW.getChatBoxButtonForSlug(slug,"games")).show()
		closeVideoSession(slug);
		return;
	}

	//Single variable for all slugs.
	var reconnectAttemptsVideo = 1;

	var openVideoChatWindow = function(slug){

		//Hide games button
		//$(PRESENCE.WINDOW.getChatBoxButtonForSlug(slug,"games")).hide()

		/* if (slug in contactsInfo) {
	   // var connectionStatus = contactsInfo[slug].videoChatStatus;
		  var connectionStatus ="something"
	  } else {
	    var connectionStatus = null;
	  }
		 */
		var connectionStatus = null;
		/*
	  if (TB.checkSystemRequirements() != TB.HAS_REQUIREMENTS) {
	    showNotificationOnVideoBox(slug,I18n.t('chat.videochat.requirements'));
	    if(connectionStatus!=null){
	      contactsInfo[slug].videoChatStatus = "disconnected";
	    }
	    return;
	  }

	  if(! PRESENCE.XMPPClient.isUserConnected()){
	    showNotificationOnVideoBox(slug, I18n.t("chat.videochat.offline"));
	    if(connectionStatus!=null){
	      contactsInfo[slug].videoChatStatus = "disconnected";
	    }
	    return;
	  }

	  if(! PRESENCE.UIMANAGER.isSlugChatConnected(slug)){
	    showNotificationOnVideoBox(slug, I18n.t("chat.videochat.guestOffline", {name: PRESENCE.XMPPClient.getNameFromSlug(slug)}));
	    if(connectionStatus!=null){
	      contactsInfo[slug].videoChatStatus = "disconnected";
	    }
	    return;
	  }
		 */
		if(connectionStatus==null){
			if(reconnectAttemptsVideo > 0){
				reconnectAttemptsVideo--;
				showNotificationOnVideoBox('chat.videochat.connectingWait');
				setTimeout(function() { openVideoChatWindow(slug); }, 5000);
			} else {
				showNotificationOnVideoBox('chat.videochat.unable');
			}
			return;
		} else {
			reconnectAttemptsVideo = 1;
		}

		if(connectionStatus!="disconnected"){
			return;
		}

		//connectionStatus=="disconnected"
		//Start negotiation
		negotiateVideoChatSession(slug);
	}
	var showNotificationOnVideoBox = function(slug,msg){
		setVideoBoxContent(slug,"<p class=\"video-info\"> " + msg +" </p>");
	}

}(jQuery));