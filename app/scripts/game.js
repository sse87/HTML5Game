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
		this.version = '0.10.0';
		
		this.el = el;
		this.player = new Player(this.el.find('.player'), this);
		this.platformsEl = el.find('.platforms');
		this.worldEl = el.find('.world');
		this.isPlaying = false;
		this.gameOverY = 800;
		
		this.platformSteps = 24;
		this.specialPlatformInterval = 25;
		this.randomMin = 0;
		
		this.fireSpeed = 1;
		this.fireY = 1000;
		this.fireEl = this.worldEl.find('.fires');
		
		this.sound = new Howl({
			urls: ['/sounds/jump.mp3', '/sounds/jump.ogg'],
			sprite: {
				jump: [0,337]
			}
		});
		
		$('.version').html('v. ' + this.version);
		
		// Cache a bound onFrame since we need it each frame.
		this.onFrame = this.onFrame.bind(this);
	};
	
	Game.prototype.freezeGame = function () {
		this.isPlaying = false;
	};
	
	Game.prototype.unFreezeGame = function () {
		if (!this.isPlaying) {
			this.isPlaying = true;
			
			// Restart the onFrame loop
			this.lastFrame = +new Date() / 1000;
			requestAnimFrame(this.onFrame);
		}
	};
	
	// 64, 128, 192, 256, 320, 384, 448, 512, 576, 640, 704, 768, 832, 896, 960, 1024, 1088, 1152, 1216, 1280
	Game.prototype.createPlatforms = function () {
		
		// Start platform
		this.addPlatform(new Platform({ x: 228, y: 776, width: 96, height: 24 }, 2));
		
		// Random floating platforms
		for (var i = 0; i < 24; i++) {
			this.addPlatform(new Platform( this.getNextPlatformPos(), 1 ));
		}
	};
	
	Game.prototype.getNextPlatformPos = function () {
		
		var semiRandomY = (this.getRandomInt(this.randomMin, (this.randomMin + this.platformSteps) ));
		this.randomMin = semiRandomY + 50;//so they can never overleap
		
		var newX = this.getRandomInt(0, 384);
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
	
	var moveCounter = 0;
	Game.prototype.movePlatform = function(platform)
	{
		moveCounter++;
		
		var nextPos = this.getNextPlatformPos();
		
		if (moveCounter >= this.specialPlatformInterval)
		{
			moveCounter = 0;
			platform.move(nextPos.x, nextPos.y, 3);
		}
		else
		{
			platform.move(nextPos.x, nextPos.y, 0);
		}
	};
	
	Game.prototype.createFire = function (fireY) {
		
		$('.fires').css('display', 'block');
		this.fireY = fireY;
	};
	
	Game.prototype.updateFire = function () {
		
		if ((this.gameOverY + 500) < this.fireY)
			this.fireY = this.gameOverY;
		
		this.fireY -= this.fireSpeed;
		this.fireEl.css('transform', 'translate3d(0,' + this.fireY + 'px,0)');
	};
	
	Game.prototype.gameOver = function (killMsg) {
		this.freezeGame();
		
		$('.gameOverMenu .scores .deathBy').html('You ' + killMsg);
		$('.gameOverMenu .scores .maxHeight').html(this.player.maxHeight);
		$('.gameOverMenu .scores .points').html(this.player.points);
		$('.gameOverMenu .scores .jumps').html(this.player.jumps);
		
		$('.game').animate({ 'background-position-y': '100%' }, 2000);
		$('.score').fadeOut('slow');
		$('.gameOverMenu').fadeIn('slow', function () {
			$('.gameOverMenu .submitScore').slideDown('slow');
		});
		
		var game = this;
		Controls.keys = {};
		this.worldEl.css({ top: 0 });
	};
	
	Game.prototype.checkForTriggers = function () {
		
		var playerY = this.player.pos.y;
		var playerMaxY = this.player.maxHeight;
		
		// Fire starts
		if (this.fireY == 1000 && playerMaxY > 5000) {
			this.createFire( (playerY + 400) );
		}
		
		// Fire speed
		if (this.fireSpeed < 15)
		{
			if (playerMaxY > 40000 && this.fireSpeed < 10) {
				this.fireSpeed = 10;
			} else if (playerMaxY > 35000 && this.fireSpeed < 9) {
				this.fireSpeed = 9;
			} else if (playerMaxY > 30000 && this.fireSpeed < 8) {
				this.fireSpeed = 8;
			} else if (playerMaxY > 25000 && this.fireSpeed < 7) {
				this.fireSpeed = 7;
			} else if (playerMaxY > 20000 && this.fireSpeed < 6) {
				this.fireSpeed = 6;
				this.specialPlatformInterval = 5;
			} else if (playerMaxY > 15000 && this.fireSpeed < 5) {
				this.fireSpeed = 5;
				this.specialPlatformInterval = 10;
			} else if (playerMaxY > 12500 && this.fireSpeed < 4) {
				this.fireSpeed = 4;
			} else if (playerMaxY > 10000 && this.fireSpeed < 3) {
				this.fireSpeed = 3;
				this.specialPlatformInterval = 15;
			} else if (playerMaxY > 7500 && this.fireSpeed < 2) {
				this.fireSpeed = 2;
				this.specialPlatformInterval = 20;
			}
		}
		
		// Platform steps
		if (this.platformSteps < 150)
		{
			if (playerMaxY > 10000 && this.platformSteps < 150) {
				this.platformSteps = 150;
			} else if (playerMaxY > 5000 && this.platformSteps < 75) {
				this.platformSteps = 75;
			} else if (playerMaxY > 2500 && this.platformSteps < 50) {
				this.platformSteps = 50;
			}
		}
		
	};
	
	/**
	 * Runs every frame. Calculates a delta and allows each game entity to update itself.
	 */
	var updateFireNext = true;
	Game.prototype.onFrame = function () {
		
		if (!this.isPlaying) {
			return;
		}
		
		var now = +new Date() / 1000;
		var delta = now - this.lastFrame;
		this.lastFrame = now;
		
		Controls.onFrame(delta);
		this.player.onFrame(delta);
		
		this.checkForTriggers();
		
		if (this.fireY != 1000 && updateFireNext) {
			this.updateFire();
		}
		updateFireNext = !updateFireNext;
		
		//Enable when function has change for vertical update not for horizontal.
		this.updateViewport();
		
		// Request next frame.
		requestAnimFrame(this.onFrame);
	};
	
	Game.prototype.updateViewport = function () {
		
		var maxY = this.viewport.y + this.viewport.height - VIEWPORT_PADDING;
		var playerMaxY = this.player.maxHeight;
		
		// Update the viewport if needed.
		if (playerMaxY > maxY) {
			this.viewport.y = playerMaxY - this.viewport.height + VIEWPORT_PADDING;
			this.gameOverY = 800 - this.viewport.y;
			this.worldEl.css({ top: this.viewport.y });
			
			$('.score .maxHeight span').html(this.player.maxHeight);
			
			var backgroundPosY = (1 + this.viewport.y / 25000) * 100;
			$('.game').css('background-position-y', backgroundPosY + '%');
		}
	};
	
	/**
	 * Starts the game.
	 */
	Game.prototype.start = function () {
		// Clear all existing platforms
		this.platforms = [];
		this.platformsEl.html('');
		this.randomMin = 0;
		this.platformSteps = 24;
		this.specialPlatformInterval = 25;
		this.gameOverY = 800;
		this.fireY = 1000;
		$('.fires').css('display', 'none');
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
	var requestAnimFrame = (function () {
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