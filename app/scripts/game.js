/*global define, $ */

define(['player', 'platform', 'controls'], function(Player, Platform, Controls) {
	
	var VIEWPORT_PADDING = 400;
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
		this.gameOverY = 800;
		
		this.platformSteps = 24;// TODO: change this when player reach higher
		this.randomMin = 1;
		
		// For debug
		$('.score').append('<div>&nbsp;</div>');
		// $('.score').append('<div class="bg">Background: <span></span></div>');
		// $('.score').append('<div class="currentX">Current X: <span></span></div>');
		// $('.score').append('<div class="gameOverY">gameOverY: <span></span></div>');
		
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
		this.addPlatform(new Platform({ x: 228, y: 776, width: 64, height: 24 }, 2));
		
		// Random floating platforms
		for (var i = 0; i < 24; i++) {
			this.addPlatform(new Platform( this.getNextPlatformPos(), 1 ));
		}
	};
	
	Game.prototype.getNextPlatformPos = function() {
		
		var semiRandomY = (this.getRandomInt(this.randomMin, (this.randomMin + this.platformSteps) ));
		this.randomMin = semiRandomY + 28;//so they can never overleap
		
		var newX = this.getRandomInt(0, 416);
		var newY = (PLATFORM_STARTING_POINT - semiRandomY);
		
		return { x: newX, y: newY };
	};
	
	Game.prototype.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	
	Game.prototype.addPlatform = function(platform) {
		this.platforms.push(platform);
		this.platformsEl.append(platform.el);
	};
	
	Game.prototype.movePlatform = function(platform)
	{
		var nextPos = this.getNextPlatformPos();
		platform.move(nextPos.x, nextPos.y);
	}
	
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
		
		Controls.onFrame(delta);
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
			this.gameOverY = 800 - this.viewport.y;
			this.worldEl.css({ top: this.viewport.y });
			
			var backgroundPosY = (1 + this.viewport.y / 5000) * 100;
			$('.game').css('background-position-y', backgroundPosY + '%')
		}
	};
	
	/**
	 * Starts the game.
	 */
	Game.prototype.start = function() {
		// Clear all existing platforms
		this.platforms = [];
		this.platformsEl.html('');
		this.randomMin = 0;
		this.platformSteps = 24;
		this.gameOverY = 800;
		// Create new platforms
		this.createPlatforms();
		// Restart player attributes
		this.player.reset();
		// Restart camera attributes
		this.viewport = { x: 0, y: 0, width: 480, height: 800 };
		
		$('.score').fadeIn('slow');
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