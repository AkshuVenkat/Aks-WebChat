$(function(){


	var id = Number(window.location.pathname.match(/\/chat\/(\d+)$/)[1]);

	var socket = io.connect('/socket');

	var name = "",
		friend = "";

	
	var section = $(".section"),
		footer = $("footer"),
		onConnect = $(".connect"),
		inviteSomebody = $(".invite"),
		join = $(".join"),
		chatScreen = $(".chatscreen"),
		left = $(".left");

	var chatName = $(".name-chat"),
		leftName = $(".name-left"),
		loginForm = $(".loginForm"),
		yourName = $("#yourName"),
		hisName = $("#hisName"),
		chatForm = $("#chatform"),
		textarea = $("#message"),
		chats = $(".chats");


	
	socket.on('connect', function(){

		socket.emit('load', id);
	});

	
	socket.on('peopleinchat', function(data){

		if(data.number === 0){

			showMessage("connected");

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(yourName.val());
				
				showMessage("inviteSomebody");

				socket.emit('login', {user: name, id: id});
			
			});
		}

		else if(data.number === 1) {

			showMessage("personinchat",data);

			loginForm.on('submit', function(e){

				e.preventDefault();

				name = $.trim(hisName.val());
				socket.emit('login', {user: name, id: id});
			});
		}

	});


	socket.on('startChat', function(data){
		if(data.boolean && data.id == id) {

			chats.empty();

			if(name === data.users[0]) {

				showMessage("youStartedChatWithNoMessages",data);
			}
			else {

				showMessage("heStartedChatWithNoMessages",data);
			}

			chatName.text(friend);
		}
	});

	socket.on('leave',function(data){

		if(data.boolean && id==data.room){

			showMessage("somebodyLeft", data);
			chats.empty();
		}

	});

	socket.on('receive', function(data){

			showMessage('chatStarted');

			createChatMessage(data.msg, data.user);
			scrollToBottom();
	});

	textarea.keypress(function(e){

		if(e.which == 13) {
			e.preventDefault();
			chatForm.trigger('submit');
		}

	});

	chatForm.on('submit', function(e){

		e.preventDefault();

		showMessage("chatStarted");

		createChatMessage(textarea.val(), name);
		scrollToBottom();

		socket.emit('msg', {msg: textarea.val(), user: name});

		textarea.val("");
	});



	function createChatMessage(msg,user){

		var who = '';

		if(user===name) {
			who = 'me';
		}
		else {
			who = 'you';
		}

		var li = $(
			'<li class=' + who + '>'+
			'<div>' +
					'<b></b>' +
			'</div>' +
			'<p></p>' +
			'</li>');

		li.find('p').text(msg);
		li.find('b').text(user);

		chats.append(li);
	}

	function scrollToBottom(){
		$("html, body").animate({ scrollTop: $(document).height()-$(window).height() },1000);
	}

	function showMessage(status,data){

		if(status === "connected"){

			section.children().css('display', 'none');
			onConnect.fadeIn(1200);
		}

		else if(status === "inviteSomebody"){

		
			$("#link").text(window.location.href);

			onConnect.fadeOut(1200, function(){
				inviteSomebody.fadeIn(1200);
			});
		}

		else if(status === "personinchat"){

			onConnect.css("display", "none");
			join.fadeIn(1200);
			chatName.text(data.user);
		}

		else if(status === "youStartedChatWithNoMessages") {

			left.fadeOut(1200, function() {
				inviteSomebody.fadeOut(1200,function(){
		
					footer.fadeIn(1200);
				});
			});

			friend = data.users[1];
		}

		else if(status === "heStartedChatWithNoMessages") {

			join.fadeOut(1200,function(){
				footer.fadeIn(1200);
			});

			friend = data.users[0];
		
		}

		else if(status === "chatStarted"){

			section.children().css('display','none');
			chatScreen.css('display','block');
		}

		else if(status === "somebodyLeft"){

			leftName.text(data.user);

			section.children().css('display','none');
			footer.css('display', 'none');
			left.fadeIn(1200);
		}

	}

});
