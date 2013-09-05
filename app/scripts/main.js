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

var game;
require(['game', 'jquery'], function (Game) {
	'use strict';
	game = new Game($('.game'));
});

$(document).ready(function() {
	
	$('.startMenu .newGame').click(function () {
		$('.startMenu').fadeOut('slow', function () {
			
			game.start();
			
		});
	});
	
	$('.startMenu .scores').click(function () {
		// Temp message
		$('.startMenu .scores > div').slideDown('slow', function () {
			
			$('.startMenu .scores > div > div').delay(1500).slideDown('slow');
			
		});
	});
	
	$('.gameOverMenu .submitScore').click(function () {
		// Temp message
		$('.gameOverMenu .submitScore > div').slideDown('slow', function () {
			
			$('.gameOverMenu .submitScore > div > div').delay(1500).slideDown('slow');
			
		});
	});
	$('.gameOverMenu .playAgain').click(function () {
		$('.gameOverMenu').fadeOut('slow', function () {
			
			game.start();
			
		});
	});
	$('.gameOverMenu .exitToMenu').click(function () {
		$('.gameOverMenu').fadeOut('slow', function () {
			
			$('.startMenu').fadeIn('slow');
			
		});
	});
});