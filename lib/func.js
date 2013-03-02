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
