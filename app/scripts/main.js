require.config({
	paths: {
		jquery: '../bower_components/jquery/jquery',
		bootstrap: 'vendor/bootstrap'
	},
	shim: {
		bootstrap: {
			deps: ['jquery'],
			exports: 'jquery'
		}
	}
});

require(['game', 'jquery'], function (Game) {
	'use strict';
	var game = new Game($('.game'));
	game.start();
});

/*$(document).ready(function() {
	$('.game').click(function (e) {
		console.log('x:' + e.clientX + ' y:' + e.clientY)
	});
});*/