/**
 * Trello Boards PRO extension
 *
 * Background page javascript
 */

 var TB_APP_KEY = 'd8c65fac278e6cfc05f5ef3a88aea5c3';

 function trelloApiUrl(path) {
	return 'https://api.trello.com/1' + path + '?key=' + TB_APP_KEY + '&token=' + localStorage.trello_token;
}

 function createCardFromSelection (obj) {
	var description = obj.selectionText;
	localStorage.lastSelected = description;
	chrome.windows.create(
		{
			url: chrome.extension.getURL("new_card.html"), 
			type: "popup",
			width: 600,
			height: 600
		},
		function (window) 
		{

		});
}

function copyAllCards(obj) {
	var regx = /(https:\/\/trello.com\/c\/)([^\/]*)/g;
	var r = regx.exec(obj.pageUrl);
	var cardId = r[2];

    $.ajax({
    	url: trelloApiUrl("/cards/" + cardId + "/list"),
    	type: 'get'
    }).success(function (list) {
    	var lId = list.id;
    	$.ajax({
    		url: trelloApiUrl("/lists/" + lId + "/cards"),
    		type: 'get'
    	}).success(function (cards) {
    		var s = "";
			angular.forEach(cards, function(value, key) {
			  s += value.name + ": " + urlTrim(value.url) + "\n\n";
			});

			window.prompt("Copy to clipboard: Cmd+C, Enter", s);
        });
    });
}

function urlTrim(url)
{
	var regx = /https:\/\/trello.com\/c\/........\/\d\d\d\d/g;
	return regx.exec(url)
}


(function () {

	// Adds 'Create Trello Card' on right-click menu, if text is selected
	chrome.contextMenus.create({"title": "Create Trello card", "contexts":["selection"],
                                       "onclick": createCardFromSelection});

	// Adds 'Copy all card urls in list'
	var id = chrome.contextMenus.create({"title": "Copy all cards in list", 
			   "documentUrlPatterns":["https://trello.com/c/*"],
                                       "onclick": copyAllCards});	

	var NOTIF_CHECK_DELAY_SECONDS = 60,
		APP_API_KEY = "d8c65fac278e6cfc05f5ef3a88aea5c3";

	var getNotificationAPIUrl = function (token) {
		return "https://api.trello.com/1/members/me/notifications/unread?key=" + APP_API_KEY + "&token=" + token;
	};

	var setNotificationCount = function (count) {
		// Update the badge to show the count of notifications
		var badge_text = count ? count.toString() : "";
		chrome.browserAction.setBadgeText({text: badge_text});
	};

	var setNotificationCountAndQueueNextUpdate = function (count) {
		// Set the notif count
		setNotificationCount(count);

		// Queue another check
		setTimeout(updateLiveNotificationCount, NOTIF_CHECK_DELAY_SECONDS * 1000);
	};

	var handleAPIResponse = function(json) {
		try {
			var data = JSON.parse(json);
			setNotificationCountAndQueueNextUpdate(data.length);
		} catch(e) {
			setNotificationCountAndQueueNextUpdate(0);
		}
	};

	/**
	 * Check for notifications function
	 */
	var updateLiveNotificationCount = function () {
		// Get the API Key
		if (!window.localStorage.trello_token) {
			setNotificationCountAndQueueNextUpdate(0);
			return;
		}
		// Check if notif count is enabled
		if (window.localStorage.trello_options_notif_count != 'enabled') {
			setNotificationCountAndQueueNextUpdate(0);
			return;
		}

		// Ajax request to Trello API
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				handleAPIResponse(xhr.responseText);
			}
		};
		xhr.open("GET", getNotificationAPIUrl(window.localStorage.trello_token), true);
		xhr.send();
	};

	// Start Checking!
	updateLiveNotificationCount();
}());
