/*global define, $ */

define(['player', 'platform', 'controls'], function(Player, Platform, Controls) {
	
	var VIEWPORT_PADDING = 250;
	var PLATFORM_STARTING_POINT = 740;
	
	/**
	 * Main game class.
	 * @param {Element} el DOM element containig the game.
	 * @constructor
	 */
	var Game = function(el) {
		this.el = el;
		this.player = new Player(this.el.find('.player'), this);
		this.platformsEl = el.find('.platforms');
		this.worldEl = el.find('.world');
		this.isPlaying = false;
		
		// TODO: change this when player reach higher
		this.platformSteps = 24;
		
		// For debug
		$('.score').append('<div>&nbsp;</div>');
		$('.score').append('<div class="currentHeight">Current height: <span></span></div>');
		$('.score').append('<div class="currentX">Current X: <span></span></div>');
		$('.score').append('<div class="maxY">maxY: <span></span></div>');
		$('.score').append('<div class="playerMaxY">playerMaxY: <span></span></div>');
		$('.score').append('<div class="viewportY">viewportY: <span></span></div>');
		$('.score').append('<div class="gameoverY">gameoverY: <span></span></div>');
		$('.score').append('<div class="totalPlatforms">Total platforms: <span></span></div>');
		$('.score').append('<div class="lowestPlatformY">Lowest platform Y: <span></span></div>');
		
		// Cache a bound onFrame since we need it each frame.
		this.onFrame = this.onFrame.bind(this);
	};
	
	Game.prototype.freezeGame = function() {
		this.isPlaying = false;
	};
	
	Game.prototype.unFreezeGame = function() {
		if (!this.isPlaying) {
			this.isPlaying = true;
			
			// Restart the onFrame loop
			this.lastFrame = +new Date() / 1000;
			requestAnimFrame(this.onFrame);
		}
	};
	
	// 64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280
	Game.prototype.createPlatforms = function() {
		
		// Start platform
		this.addPlatform(new Platform({ x: 228, y: 776, width: 64, height: 24 }));
		
		// Random floating platforms
		
		
		var randomX = 0;
		var semiRandomY = 0;
		
		var randomMin = 0;
		for (var i = 0; i < 100; i++) {
			randomX = this.getRandomInt(0, 416);
			semiRandomY = (this.getRandomInt(randomMin, (randomMin + this.platformSteps) ));
			randomMin = semiRandomY + 28;
			this.addPlatform(new Platform({ x: randomX, y: (PLATFORM_STARTING_POINT - semiRandomY) }));
		}
	};
	
	Game.prototype.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	
	Game.prototype.addPlatform = function(platform) {
		this.platforms.push(platform);
		this.platformsEl.append(platform.el);
	};
	
	Game.prototype.gameOver = function() {
		this.freezeGame();
		
		alert('You are game over! Sorry man...');
		
		var game = this;
		Controls.keys = {};
		this.worldEl.css({ top: 0 });
		
		// setTimeout so this frame will finish before start() is executed
		setTimeout(function() {
			game.start();
		}, 0);
	};
	
	/**
	 * Runs every frame. Calculates a delta and allows each game entity to update itself.
	 */
	Game.prototype.onFrame = function() {
		
		if (!this.isPlaying) {
			return;
		}
		
		var now = +new Date() / 1000;
		var delta = now - this.lastFrame;
		this.lastFrame = now;
		
		this.player.onFrame(delta);
		
		//Enable when function has change for vertical update not for horizontal.
		this.updateViewport();
		
		// Request next frame.
		requestAnimFrame(this.onFrame);
	};
	
	Game.prototype.updateViewport = function() {
		
		var maxY = this.viewport.y + this.viewport.height - VIEWPORT_PADDING;
		var playerMaxY = this.player.maxHeight;
		
		// Update the viewport if needed.
		if (playerMaxY > maxY) {
			this.viewport.y = playerMaxY - this.viewport.height + VIEWPORT_PADDING;
			this.player.gameoverY = 800 - this.viewport.y;
			this.worldEl.css({ top: this.viewport.y });
		}
		
		// Debug stats
		$('.score .maxY span').html(maxY);
		$('.score .playerMaxY span').html(playerMaxY);
		$('.score .viewportY span').html(this.viewport.y);
	};
	
	/**
	 * Starts the game.
	 */
	Game.prototype.start = function() {
		// Clear all existing platforms
		this.platforms = [];
		this.platformsEl.html('');
		// Create new platforms
		this.createPlatforms();
		// Restart player attributes
		this.player.reset();
		// Restart camera attributes
		this.viewport = { x: 0, y: 0, width: 960, height: 540 };
		
		this.unFreezeGame();
	};
	
	Game.prototype.forEachPlatform = function(handler) {
		this.platforms.forEach(handler);
	};
	
	/**
	 * Cross browser RequestAnimationFrame
	 */
	var requestAnimFrame = (function() {
		return window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function(/* function */ callback) {
					window.setTimeout(callback, 1000 / 60);
				};
	})();
	
	return Game;
});