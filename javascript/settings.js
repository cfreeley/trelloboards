function loadHiddenBoards() {
	var hidden = JSON.parse(localStorage.trello_hidden || "[]");
	if(!hidden.length) {
		return [];
	}

	var i, l, board;
	var boards = JSON.parse(localStorage.trello_boards || "[]");
	var hidden_boards = [];

	for(i = 0, l = boards.length; i < l; ++i) {
		board = boards[i];
		if(hidden.indexOf(board.id) > -1) {
			hidden_boards.push(board);
		}
	}

	return hidden_boards;
}

/**
 * Settings Angular JS controller
 *
 * @param $scope
 * @constructor
 */
function SettingsCtl($scope) {
	// Setup close action
	$scope.unhideBoard = function($event, board_id) {
		$event.preventDefault();
		toggleHidden(board_id);
		$scope.hidden_boards = loadHiddenBoards();
	};

	$scope.hidden_boards = loadHiddenBoards();
}

function init() {
	Trello.authorize({
		'name':	"Boards for Trello",
		'expiration': "never",
		'success': function() {
			// Close this window and open the popup
			$hide('auth');
			$show('success');
		},
		'error': function () {
			$hide('auth');
			$show('error');
		}
	});

	// show the hidden boards list
	$show('loading_wrapper');
}
$onload(init);
