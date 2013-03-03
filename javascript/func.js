function clearData() {
	localStorage.removeItem('trello_token');
	localStorage.removeItem('trello_orgs');
}

function $show(element_id) {
	document.getElementById(element_id).style.display = '';
}

function $hide(element_id) {
	document.getElementById(element_id).style.display = 'none';
}

function $click(element_id, func) {
	document.getElementById(element_id).addEventListener('click', func);
}

function $onload(func) {
	document.addEventListener('DOMContentLoaded', func, false);
}


function toggleStarred(board_id) {
	var starred = JSON.parse(localStorage.trello_starred || "[]");
	var i = starred.indexOf(board_id);
	if(i > -1) {
		// Board is already starred
		starred.splice(i, 1);
	} else {
		// Board isn't yet starred!
		starred.push(board_id);
	}
	// Save starred list
	localStorage.trello_starred = JSON.stringify(starred);
}

function toggleHidden(board_id) {
	var hidden = JSON.parse(localStorage.trello_hidden || "[]");
	var i = hidden.indexOf(board_id);
	if(i > -1) {
		// Board is already hidden
		hidden.splice(i, 1);
	} else {
		// Board isn't yet hidden!
		hidden.push(board_id);
	}
	// Save hidden list
	localStorage.trello_hidden = JSON.stringify(hidden);
}


/**
 * Apply i18n to any elements in $scope with a data-message attribute.
 *
 * @param $scope
 */
function translate($scope) {
	var elements = $scope.querySelectorAll('[data-message]');
	for (var i = 0; i < elements.length; ++i) {
		var element = elements[i];
		if(element.dataset && element.dataset.message) {
			//console.log(element, element.dataset.message, chrome.i18n.getMessage(element.dataset.message));
			element.innerHTML = chrome.i18n.getMessage(element.dataset.message);
		}
	}
}

/**
 * Capitalise the first letter of the given string
 *
 * @param str
 */
function capitalise(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}
