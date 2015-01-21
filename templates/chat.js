var Templates = window.Templates || {};

Templates.Chat = (function(){

	var chatbox;
	var messagesBox;
	var sendChatButton;
	var chatTextbox;
	var userControlsContainer;

	var createChatbox = function(){
		if(!chatbox){
			chatbox = $('<div>').attr({
				'id':'lodLobbyChat',
				'class':'well well-sm',
				'style':'height:300px;'
			});
		}
		return chatbox;
	}

	var createMessagesBox = function(){
		if(!messagesBox){
			messagesBox = $('<div>').attr({
				'id':'lodLobbyChatMessages',
				'style':'width:100%;height;calc(100% - 24px);overflow-y:auto;'
			});
		}
		return messagesBox;
	}

	var createSendButton = function(){
		if(!sendChatButton){
			sendChatButton = $('<button>').attr({
				'id':'lodLobbyChatButton', 
				'tabindex':'-1', 
				'class':'btn btn-default', 
				'type':'button', 
				'style':'-webkit-border-top-right-radius:0;-moz-border-radius-topright:0;border-top-right-radius:0;'
			}).text('Send');
		}
		return sendChatButton;
	}

	var bindChatButton = function(){
		sendChatButton.click(function(){
			var chatText = chatTextbox.val();
			if(chatText != ''){
				addChat(, user['personaname'], chatText, user['cosmetics']);
				wsClientLobby.send(packArguments('chat', chatText));
				chatTextbox.val('');
			}
		}).focus(function(){
			chatTextbox.focus(); 
		});
		return sendChatButton;
	}

	var createTextbox = function(){
		chatTextbox = $('<input>').attr({
			'id':'lodLobbyChatText', 
			'type':'text', 
			'class':'form-control', 
			'style':'-webkit-border-top-left-radius:0;-moz-border-radius-topleft:0;border-top-left-radius:0;'
		})
		return chatTextbox;
	}

	var bindTextbox = function(){
		chatTextbox.keyup(function(event){
			if(event.keyCode == 13){
				sendChatButton.click();
			}
		});
		return chatTextbox;
	}

	var createUserControlsContainer = function(){
		if(!userControlsContainer){
			userControlsContainer = $('<div>').attr({
				'class':'input-group',
				'style':'margin:0 -11px 0 -10px;'
			})
		}
		return userControlsContainer;
	}

	var createUserControls = function(){

		createUserControlsContainer().append(
			createTextbox()
		).append(
			createSendButton()
		);
		
		bindTextbox();
		bindChatButton();

		return userControlsContainer;
	}

	var createWholeChat = function(){

		createChatbox().append(
			createMessagesBox()
		).append(
			createUserControls()
		);

	}


	return{

		'create':function(){
			createChatBox().append(createMessagesBox());

		}

		'addMessage':function(personaname, chat, cosmetics){
			var scrollDown = messagesBox.scrollTop() + messagesBox.innerHeight() + 10 >= messagesBox.prop('scrollHeight');

			$('<span>').attr({'style':'white-space:nowrap;display:block;width:100%;padding:5px;', 'class':Cosmetics.getStyle(cosmetics)}).append(
				$('<strong>').text(personaname + ': ')
			).append(
				$('<span>').text(text).attr('style', 'white-space:normal;word-wrap:break-word;')
			).append('<br />')

			if(scrollDown){
				messagesBox.scrollTop(messagesBox.prop('scrollHeight'));
			}
		}

	}

})();