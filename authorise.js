function init() {
	clearData();
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
}
$onload(init);
