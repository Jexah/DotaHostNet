var Templates = window.Templates || {};

Templates.Chat = (function(){

	var chatbox;
	var messagesBox;
	var sendChatButton;
	var chatTextbox;
	var userControlsContainer;

	chatbox = $('<div>').attr({
		'id':'lodLobbyChat',
		'class':'well well-sm',
		'style':'height:300px;'
	});

	messagesBox = $('<div>').attr({
		'id':'lodLobbyChatMessages',
		'style':'width:100%;height;calc(100% - 24px);overflow-y:auto;'
	});

	chatTextbox = $('<input>').attr({
		'id':'lodLobbyChatText', 
		'type':'text', 
		'class':'form-control', 
		'style':'-webkit-border-top-left-radius:0;-moz-border-radius-topleft:0;border-top-left-radius:0;'
	}).keyup(function(event){
		if(event.keyCode == 13){
			sendChatButton.click();
		}
	});

	sendChatButton = $('<button>').attr({
		'id':'lodLobbyChatButton', 
		'tabindex':'-1', 
		'class':'btn btn-default', 
		'type':'button', 
		'style':'-webkit-border-top-right-radius:0;-moz-border-radius-topright:0;border-top-right-radius:0;'
	}).text('Send').click(function(){
		var chatText = chatTextbox.val();
		if(chatText != ''){
			addMessage(Main.user['personaname'], chatText, user['cosmetics']);
			Main.wsClientLobby.send(Helpers.packArguments('chat', chatText));
			chatTextbox.val('');
		}
	}).focus(function(){
		chatTextbox.focus(); 
	});

	userControlsContainer = $('<div>').attr({
		'class':'input-group',
		'style':'margin:0 -11px 0 -10px;'
	});

	var addMessage = function(personaname, chat, cosmetics){
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


	return{

		'getTemplate':function(){
			userControlsContainer.html(chatTextbox).append(sendChatButton);
			chatbox.html(messagesBox).append(userControlsContainer)
		},

		'addMessage':function(personaname, chat, cosmetics){
			addMessage(personaname, chat, cosmetics);
		}

	}

})();