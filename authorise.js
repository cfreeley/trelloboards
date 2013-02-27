$(function() {
	clearData();
	Trello.authorize({
		'name':	"Boards for Trello",
		'expiration': "never",
		'success': function() {
			// Close this window and open the popup
			$('#auth').hide();
			$('#success').show();
		},
		'error': function () {
			$('#auth').hide();
			$('#error').show();
		}
	});
});
