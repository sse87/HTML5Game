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

$(document).ready(function () {
	
	$('.startMenu .newGame').click(function () {
		$('.startMenu').fadeOut('slow', function () { game.start(); });
	});
	$('.startMenu .newGame').click();
	
	$('.gameOverMenu .submitScore').click(function () {
		
		var name = (getCookie('name') != null ? getCookie('name') : '');
		
		if (name == '') name = 'anonymous';
		$('.gameOverMenu .newName input').val(name);
		
		$('.gameOverMenu .submitScore').slideUp('slow');
		$('.gameOverMenu .newName').slideDown('slow', function () {
			$('.gameOverMenu .submit').slideDown('slow');
		});
		
	});
	
	$('.gameOverMenu .newName input').click(function () {
		$('.gameOverMenu .newName input').select();
	});
	
	$('.gameOverMenu .submit').click(function () {
		
		var name = $('.gameOverMenu .newName input').val();
		var height = $('.gameOverMenu .scores .maxHeight').html();
		var points = $('.gameOverMenu .scores .points').html();
		var jumps = $('.gameOverMenu .scores .jumps').html();
		var killmsg = $('.gameOverMenu .scores .deathBy').html().replace('You ','');
		var version = $('.version').html().replace('v. ','');
		var hash = 'someHash';
		
		if (name == '') {
			name = 'anonymous';
			$('.gameOverMenu .newName input').val(name);
		}
		
		setCookie('name', name);
		$.ajax({
			type: 'POST',
			url: 'http://sse87.1984.is/app/scores/submitScore.php',
			data: 'name='+name+'&height='+height+'&points='+points+'&jumps='+jumps+'&killmsg='+killmsg+'&version='+version+'&hash='+hash+'',
		}).done(function (response) {
			if (response == '0') { console.log('score submited!'); }
			else { console.log('ajax error: ' + response); }
		});
		
		$('.gameOverMenu .newName').slideUp('slow');
		$('.gameOverMenu .submit').slideUp('slow');
		
	});
	
	$('.gameOverMenu .playAgain').click(function () {
		$('.gameOverMenu').fadeOut('slow', function () { game.start(); });
	});
	$('.gameOverMenu .exitToMenu').click(function () {
		$('.gameOverMenu').fadeOut('slow', function () { $('.startMenu').fadeIn('slow'); });
	});
	
});

function clearCookie(_cookie_name)
{
	set_cookie(_cookie_name, '', '/');
}

function getCookie(_cookie_name)
{
	var results = document.cookie.match(_cookie_name + '=(.*?)(;|$)');

	if (results)
		return unescape(results[1]);
	else
		return null;
}

function setCookie(_name, _value)
{
	var cookie_string = _name + '=' + escape(_value);
	
	var date = new Date();
	date.setTime(date.getTime() + (24 * 60 * 60 * 1000));
	cookie_string += '; expires=' + date.toGMTString();
	
	var _path = '/'
	if (_path != '') cookie_string += '; path=' + escape(_path);
	
	document.cookie = cookie_string;
}