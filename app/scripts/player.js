/*global define */

define(['controls'], function(Controls) {
	
	var PLAYER_SPEED = 400;
	var JUMP_VELOCITY = 1250;
	var GRAVITY = 4000;
	
	var PLAYER_WIDTH = 80;
	var PLAYER_OFFSET = 28;
	
	var Player = function(el, game) {
		this.game = game;
		this.el = el;
	};
	
	Player.prototype.reset = function() {
		this.pos = { x: 220, y: 770 };// Positions
		this.vel = { x: 0, y: 0 };// Velocity
		this.til = 0;// Tile
		
		this.maxHeight = 0;
		this.score = 0;
	};
	
	Player.prototype.onFrame = function(delta) {
		
		// Player input
		this.vel.x = Controls.inputVec.x * PLAYER_SPEED;
		
		// Jumping
		var jumpEnabled = false;
		var autoJumpEnabled = true;
		if (((Controls.keys.space && jumpEnabled) || autoJumpEnabled) && this.vel.y === 0) {
			this.vel.y = -JUMP_VELOCITY;
		}
		
		// Gravity
		this.vel.y += GRAVITY * delta;
		
		var oldY = this.pos.y;
		this.pos.x += delta * this.vel.x;
		this.pos.y += delta * this.vel.y;
		
		// Collision detection
		this.checkPlatforms(oldY);
		
		this.checkWorldEndless();
		
		this.checkGameOver(oldY);
		
		// Update UI
		this.el.css('transform', 'translate3d(' + this.pos.x + 'px,' + this.pos.y + 'px,0)');
		
		this.el.toggleClass('right', this.til === 0);
		this.el.toggleClass('left', this.til === 1);
		this.el.toggleClass('jumping', this.vel.y < 0);
		this.el.toggleClass('walking', this.vel.x !== 0);
		
		// Update temp debug
		var currentHeight = Math.abs(Math.floor(this.pos.y - 800));
		if (currentHeight > this.maxHeight) this.maxHeight = currentHeight;
		
		// Update score board
		$('.score .maxHeight span').html(this.maxHeight);
	};
	
	Player.prototype.checkGameOver = function(oldY) {
		if (oldY > this.game.gameOverY) {
			this.game.gameOver();
		}
	};
	
	Player.prototype.checkWorldEndless = function () {
		if (this.pos.x < -60 && this.vel.x < 0) this.pos.x = 480;
		else if (this.pos.x > 460 && this.vel.x > 0) this.pos.x = -60;
	};
	
	
	Player.prototype.checkPlatforms = function(oldY) {
		var that = this;
		var playerx1 = that.pos.x + PLAYER_OFFSET;
		var playerx2 = that.pos.x - PLAYER_OFFSET + PLAYER_WIDTH;
		
		var platformCounter = 0;
		var lowestY = 0;
		var garbagePlatforms = 0;
		this.game.forEachPlatform(function(p) {
			
			// Are we crossing Y.
			if (p.rect.y >= oldY && p.rect.y < that.pos.y) {
				
				// Are inside X bounds.
				if (playerx2 >= p.rect.x && playerx1 <= p.rect.right) {
					
					// COLLISION. Let's stop gravity.
					that.pos.y = p.rect.y;
					that.vel.y = 0;
				}
			}
			
			if (p.rect.y > lowestY) lowestY = p.rect.y;
			if (p.rect.y > that.game.gameOverY) {
				that.game.movePlatform(p);
				garbagePlatforms++;
			}
			platformCounter++;
		});
	};
	
	return Player;
});
