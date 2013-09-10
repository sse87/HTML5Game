/*global define */

define(['controls'], function(Controls) {
	
	var PLAYER_SPEED = 400;
	var JUMP_VELOCITY = 650;
	var GRAVITY = 980;
	
	var PLAYER_WIDTH = 80;
	var PLAYER_OFFSET = 28;
	
	var Player = function(el, game) {
		this.game = game;
		this.el = el;
	};
	
	Player.prototype.reset = function () {
		this.pos = { x: 220, y: 750 };// Positions
		this.vel = { x: 0, y: 1 };// Velocity
		this.til = 0;// Tile
		
		this.maxHeight = 0;
		this.points = 0;
		this.jumps = 0;
	};
	
	Player.prototype.jump = function(force) {
		
		this.vel.y = -force;
		
		this.jumps++;
		this.game.sound.play('jump');
		$('.score .jumps span').html(this.jumps);
	}
	
	Player.prototype.onFrame = function(delta) {
		
		// Player input
		this.vel.x = Controls.inputVec.x * PLAYER_SPEED;
		if (Controls.inputVec.x > 0 && this.til != 0) this.til = 0;
		else if (Controls.inputVec.x < 0 && this.til != 1) this.til = 1;
		
		// Jumping
		// var jumpEnabled = false;
		// var autoJumpEnabled = true;
		// ((Controls.keys.space && jumpEnabled) || autoJumpEnabled) && 
		
		if (this.vel.y === 0) {
			this.jump(JUMP_VELOCITY);
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
		
		if (this.maxHeight < 500)
			$('.score .maxHeight span').html(this.maxHeight);
	};
	
	Player.prototype.checkGameOver = function(oldY) {
		if (oldY > this.game.gameOverY) {
			this.game.gameOver('crashed to death');
		} else if (oldY > this.game.fireY + 100) {
			this.game.gameOver('burned alive');
		}
	};
	
	Player.prototype.checkWorldEndless = function () {
		if (this.pos.x < -40 && this.vel.x < 0) this.pos.x = 460;
		else if (this.pos.x > 440 && this.vel.x > 0) this.pos.x = -40;
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
					if (p.type == 3)
						that.jump(JUMP_VELOCITY * 1.5);
					
					// Collect platform points
					if (p.points > 0) {
						that.points += p.getPoints();
						$('.score .points span').html(that.points);
					}
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
