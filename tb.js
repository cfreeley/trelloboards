var TB_APP_KEY = 'd8c65fac278e6cfc05f5ef3a88aea5c3';

function BoardsCtl($scope, $http) {
	// Initialise boards list to local boards list
	$scope.boards = JSON.parse(localStorage.boards || "[]");

	// Send off HTTP request to refresh boards list
	$http
		.get('https://api.trello.com/1/members/me/boards/?key=' + TB_APP_KEY + '&token=' + localStorage.trello_token)
		.success(function(response){
			localStorage.boards = JSON.stringify(response);
			$scope.boards = response;
		});
}

// Setup form elements
$('#close').click(function(ev) {
	ev.stopPropagation();
	window.close();
});

$(function() {
	if(!localStorage.trello_token) {
		// Close popup and open auth tab
		setTimeout(function() {
			window.close();
			chrome.tabs.create({url: chrome.extension.getURL('authorise.html')});
		}, 100);
		return;
	}

	// show the boards list.
	$('#loading_wrapper').show();
});
