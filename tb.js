;(function() {

	var Module = {
		APP_KEY: "d8c65fac278e6cfc05f5ef3a88aea5c3"
	};

	// Check if a user is authorised
	function isAuthorised() {
		return !!getToken();
	}

	// Get the authentication token
	function getToken() {
		return localStorage["trelloboards_auth_token"];
	}

	// Clear the auth token
	function wipeToken() {
		localStorage.removeItem("trelloboards_auth_token");
	}

	// Get the locally stored boards list
	function getBoardsList() {
		var list = localStorage["trelloboards_board_list"];
		if(!list) {
			return [];
		}
		return JSON.parse(list);
	}

	// Set the local cache of the boards list
	function setBoardsList(list) {
		localStorage["trelloboards_board_list"] = JSON.stringify(list);
	}

	// Set the auth token
	function setToken(token) {
		localStorage["trelloboards_auth_token"] = token;
	}

	// Handle successful login
	function loginSuccess() {
		$('#cetb__logged_out').hide();
		$('#cetb__logged_in').show();
		$('#cetb__logout_button').show();
		loadBoardList();
	}

	// Handle login failure
	function loginFailed() {
		$('#cetb__login_error').show();
	}

	// Clear the cached boards list
	function wipeBoardCache() {
		localStorage.removeItem("trelloboards_board_list");
	}

	function renderBoardList(boards) {
		var lis = '';
		$.each(boards, function(i, board) {
			if(board.closed) {
				return;
			}
			lis +=
				'<li>' +
				'	<span class="board-name">' +
				'		<a href="' + board.url + '" target="_blank">' + board.name + '</a>' +
				'	</span>' +
				'</li>';
		});
		$('#cetb__boards_list').html(lis);
	}

	// Login
	function login() {
		$('#cetb__login_error').hide();

		var token = $('#cetb__k').val();

		// Try a call to Trello to validate the token
		$.get(
			'https://api.trello.com/1/members/me/?key=' + Module.APP_KEY + '&token=' + token,
			function(data) {
				if(data.id) {
					// Success!
					setToken(token);
					loginSuccess();
				} else {
					// Fail :(
					loginFailed();
				}
			}
		).error(loginFailed);
	}

	// Logout
	function logout() {
		wipeToken();
		wipeBoardCache();
		$('#cetb__logged_in').hide();
		$('#cetb__logout_button').hide();
		$('#cetb__logged_out').show();
	}

	// Bring up the Trello Auth window
	function authoriseAppPopup() {
		window.open(
			"https://trello.com/1/authorize?&name=Trello+Boards+Chrome+Extension&expiration=never&response_type=token&key=" + Module.APP_KEY,
			"trello", "width=480,height=470,left=400,top=100"
		);
	}

	function loadBoardList() {
		$('#cetb__updating').show();
		renderBoardList(getBoardsList());
		$.getJSON(
			'https://api.trello.com/1/members/me/boards/?key=' + Module.APP_KEY + '&token=' + getToken(),
			function(data) {
				$('#cetb__updating').hide();
				if(!$.isArray(data)) {
					alert("Sorry, an error occured trying to load your boards.");
					return;
				}
				setBoardsList(data);
				renderBoardList(data);
			}
		);
	}

	$(function() {
		if(isAuthorised()) {
		    loginSuccess();
		} else {
			$('#cetb__auth').click(authoriseAppPopup);
			$('#cetb__login').click(login);
		    $('#cetb__logged_out').show();
		}
		$('#cetb__logout_button').click(logout);
	});
})();
