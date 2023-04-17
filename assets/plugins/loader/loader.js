	$(function() {
		$(document.body).append($('<div class="loader">'));
	})

	function loaderStart() {
		$(document.body).append('<div id="backdrop"></div>');
		$('.loader').show();
	}

	function loaderStop() {
		$('#backdrop').remove();
		$('.loader').hide();
	}
