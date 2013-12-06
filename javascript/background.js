/**
 * Trello Boards PRO extension
 *
 * Background page javascript
 */

(function () {
	var NOTIF_CHECK_DELAY_SECONDS = 5,
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
