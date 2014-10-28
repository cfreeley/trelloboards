var TB_APP_KEY = 'd8c65fac278e6cfc05f5ef3a88aea5c3';

/**
 * Load all the board into an array grouped by their organisation
 *
 * @return {Array}
 */
function loadBoards() {
	var i, l, orgs, org, boards, board;

	// Load orgs and boards from local storage
	orgs = JSON.parse(localStorage.trello_orgs || "[]");
	boards = JSON.parse(localStorage.trello_boards || "[]");

	// Hash of orgs, "indexed" by id so boards can be easily sorted
	var orgs_indexed = {'me': {
		'id': 'me',
		'name': 'me',
		'logo': 'me',
		'url': 'https://trello.com/',
		'displayName': capitalise(chrome.i18n.getMessage('my_boards')),
		'sortName': 'aab',
		'boards': []
	}, 'star': {
		'id': 'star',
		'name': 'star',
		'logo': 'star',
		'url': 'https://trello.com/',
		'displayName': capitalise(chrome.i18n.getMessage('favourites')),
		'sortName': 'aaa',
		'boards': []
	}},
	// Array of orgs and their boards, to be filtered ready for display
	org_boards = [];

	// Get our array of starred boards
	var starred = JSON.parse(localStorage.trello_starred || "[]");
	var hidden = JSON.parse(localStorage.trello_hidden || "[]");

	// Load orgs into list
	for(i = 0, l = orgs.length; i < l; ++i) {
		org = orgs[i];
		org.logo = org.logoHash ? 'pic' : 'org';
		org.boards = [];
		orgs_indexed[org.id] = org;
	}

	// Group the boards into their organisation
	for(i = 0, l = boards.length; i < l; ++i) {
		board = boards[i];
		// Don't include closed boards
		if(board.closed) continue;
		// Check if the board is hidden
		if(hidden.indexOf(board.id) > -1) continue;
		// Set the sort name of the board allowing case-insensitive sorting
		board.sortName = board.name.toLowerCase();
		// Check if the board should be added to the starred list
		if(board.starred || (starred.indexOf(board.id) > -1)) {
            board.starred = true;
            orgs_indexed['star'].boards.push(board);
		}
		// Check to see if there is unseen activity
		if(board.dateLastActivity && board.dateLastView) {
			board.unseen = (board.dateLastActivity > board.dateLastView);
		} else {
			board.unseen = false;
		}
		// Push the board onto the list under its parent organisation
		if(board.idOrganization && orgs_indexed[board.idOrganization]) {
			orgs_indexed[board.idOrganization].boards.push(board);
		} else {
			orgs_indexed['me'].boards.push(board);
		}
	}

	// Filter out orgs that have no boards, and add to the orgs list.
	for(i = 0, l = orgs.length; i < l; ++i) {
		org = orgs[i];
		org.sortName = org.displayName.toLowerCase();
		org_boards.push(org);
	}

	// Add "my boards"
	org_boards.push(orgs_indexed['star'], orgs_indexed['me']);

	return org_boards;
}

function apiError(data, status, headers, config) {
	console.log("Trello API Error", data, status, headers);
}

function showSettings() {
	// Close popup and open auth tab
	chrome.tabs.create({url: chrome.extension.getURL('settings.html')});
}

function trelloApiUrl(path) {
	return 'https://api.trello.com/1' + path + '?key=' + TB_APP_KEY + '&token=' + localStorage.trello_token;
}

/**
 * Boards List Angular JS controller
 *
 * @param $scope
 * @param $http
 * @constructor
 */
function BoardsCtl($scope, $http) {
	// Initialise boards list to local boards list
	$scope.orgs = loadBoards();

	// Setup close action
	$scope.hideBoard = function($event, board_id) {
		$event.preventDefault();
		toggleHidden(board_id);
		$scope.orgs = loadBoards();
	};

	// Setup "star" action
	$scope.starBoard = function($event, board_id) {
		$event.preventDefault();
		toggleStarred(board_id);
		$scope.orgs = loadBoards();
	};

	// Send off HTTP request to get organisations for user
	$http
		.get(trelloApiUrl('/members/me/organizations/'))
		.error(apiError)
		.success(function(response_orgs) {
			// Update stored orgs
			localStorage.trello_orgs = JSON.stringify(response_orgs);
			// Send off HTTP request to refresh boards list
			$http
				.get(trelloApiUrl('/members/me/boards/'))
				.error(apiError)
				.success(function(response_boards) {
					// Update stored orgs
					localStorage.trello_boards = JSON.stringify(response_boards);
					// Re-load boards
					$scope.orgs = loadBoards();
				});
		});
}

// Setup form elements
$click('close', function(ev) {
	ev.stopPropagation();
	window.close();
});

// Logout link
$click('logout', function() {
	clearData();
	showSettings();
});

// Settings link
$click('settings', function() {
	showSettings();
});

// Initialise the extension!
function init() {
	if(!localStorage.trello_token) {
		showSettings();
		return;
	}

	// Translate the app!
	translate(document);

	// show the boards list.
	$show('loading_wrapper');

	if(checkForNewVersion() || (localStorage.new_version_ok != '1')) {
		$show('new_version');
		$click('donation_link', function() {
			hideNewVersionDialog();
			chrome.tabs.create({url: "http://www.paulferrett.com/boards-for-trello/#wall"});
		});
		$click('new_version_ok', function() {
			hideNewVersionDialog();
		});
	}
}

$onload(init);
