/*global define, $ */

define(['player', 'platform', 'controls'], function(Player, Platform, Controls) {

	var VIEWPORT_PADDING = 100;

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
	
	Game.prototype.toggleFreezeGame = function () {
		if (this.isPlaying) {
			this.freezeGame();
		}
		else {
			this.unFreezeGame();
		}
	};

	// 64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280
	Game.prototype.createPlatforms = function() {
		// Ground
		this.addPlatform(new Platform({
			x: 100,
			y: 418,
			width: 768,
			height: 24
		}));

		// Floating platforms
		this.addPlatform(new Platform({
			x: 200,
			y: 280,
			width: 128  ,
			height: 24
		}));
		this.addPlatform(new Platform({
			x: 400,
			y: 310,
			width: 128,
			height: 24
		}));
		this.addPlatform(new Platform({
			x: 300,
			y: 180,
			width: 128,
			height: 24
		}));
		this.addPlatform(new Platform({
			x: 650,
			y: 310,
			width: 128,
			height: 24
		}));
	};

	Game.prototype.addPlatform = function(platform) {
		this.platforms.push(platform);
		this.platformsEl.append(platform.el);
	};

	Game.prototype.gameOver = function() {
		this.freezeGame();
		alert('You are game over! Sorry man...');

		var game = this;
		setTimeout(function() {
			game.start();
		}, 0);
	};

	/**
	 * Runs every frame. Calculates a delta and allows each game entity to update itself.
	 */
	Game.prototype.onFrame = function() {
		
		if (Controls.keys.esc || Controls.keys.pause) {
			this.toggleFreezeGame();
		}
		
		if (!this.isPlaying) {
			return;
		}

		var now = +new Date() / 1000,
			delta = now - this.lastFrame;
		this.lastFrame = now;

		this.player.onFrame(delta);

		//this.updateViewport();

		// Request next frame.
		requestAnimFrame(this.onFrame);
	};

	Game.prototype.updateViewport = function() {
		var minX = this.viewport.x + VIEWPORT_PADDING;
		var maxX = this.viewport.x + this.viewport.width - VIEWPORT_PADDING;

		var playerX = this.player.pos.x;

		// Update the viewport if needed.
		if (playerX < minX) {
			this.viewport.x = playerX - VIEWPORT_PADDING;
		} else if (playerX > maxX) {
			this.viewport.x = playerX - this.viewport.width + VIEWPORT_PADDING;
		}

		this.worldEl.css({
			left: -this.viewport.x,
			top: -this.viewport.y
		});
	};

	/**
	 * Starts the game.
	 */
	Game.prototype.start = function() {
		this.platforms = [];
		this.createPlatforms();
		this.player.reset();
		this.viewport = {x: 100, y: 150, width: 480, height: 320};

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