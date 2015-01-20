var Templates = window.Templates || {};

Templates.Chat = function(){

	var chatbox;
	var sendChatButton;
	var chatTextbox;

	var createChatbox = function(){
		if(!chatbox){
			chatbox = $('<div>').attr({
				'id':'lodLobbyChat',
				'style':'width:100%;height;calc(100% - 24px);overflow-y:auto;'
			});
		}
		return chatbox;
	}

	var sendButton = function(){
		if(!sendChatButton){
			sendChatButton = $('<button>').attr({
				'id':'lodLobbyChatButton', 
				'tabindex':'-1', 
				'class':'btn btn-default', 
				'type':'button', 
				'style':'-webkit-border-top-right-radius:0;-moz-border-radius-topright:0;border-top-right-radius:0;'
			}).text('Send').click(function(){
				var chatTextElement = $('#lodLobbyChatText')
				var chatText = chatTextElement.val();
				if(chatText != ''){
					addChat(, user['personaname'], chatText, user['cosmetics']);
					wsClientLobby.send(packArguments('chat', chatText));
					chatTextElement.val('');
				}
			}).focus(function(){
				(chatTextbox || $("#lodLobbyChatText")).focus(); 
			});
		}
		return sendChatButton;
	}

	var textbox = function(){
		if(chatTextbox){
			chatTextbox = $('<input>').attr({
				'id':'lodLobbyChatText', 
				'type':'text', 
				'class':'form-control', 
				'style':'-webkit-border-top-left-radius:0;-moz-border-radius-topleft:0;border-top-left-radius:0;'
			}).keyup(function(event){
				if(event.keyCode == 13){
					$('#lodLobbyChatButton').click();
				}
			});
		}
		return chatTextbox;
	}


	var addMessage = function(personaname, chat, cosmetics){
		return $('<span>').attr({'style':'white-space:nowrap;display:block;width:100%;padding:5px;', 'class':Cosmetics.getStyle(cosmetics)}).append(
			$('<strong>').text(personaname + ': ')
		).append(
			$('<span>').text(text).attr('style', 'white-space:normal;word-wrap:break-word;')
		).append('<br />')
	}

}