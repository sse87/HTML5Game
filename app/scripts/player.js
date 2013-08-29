/*global define */

define(['controls'], function(Controls) {
	
	var PLAYER_SPEED = 400;
	var JUMP_VELOCITY = 1250;
	var GRAVITY = 4000;
	//var PLAYER_HALF_WIDTH = 40;
	var PLAYER_WIDTH = 80;
	var PLAYER_OFFSET = 28;
	
	var HELL_Y = 500;
	
	var Player = function(el, game) {
		this.game = game;
		this.el = el;
		
		// temp debug
		// $('.tempDebug').append('<div class="playerPosX">Player pos X: <span></span></div>');
		// $('.tempDebug').append('<div class="playerPosY">Player pos Y: <span></span></div>');
	};
	
	Player.prototype.reset = function() {
		this.pos = { x: 200, y: 400 };// Positions
		this.vel = { x: 0, y: 0 };// Velocity
		this.til = 0;// Tile
	};
	
	Player.prototype.onFrame = function(delta) {
		
		// Player input
		if (Controls.keys.right) {
			this.til = 0;
			this.vel.x = PLAYER_SPEED;
		} else if (Controls.keys.left) {
			this.til = 1;
			this.vel.x = -PLAYER_SPEED;
		} else {
			this.vel.x = 0;
		}
		
		// Jumping
		if (this.vel.y === 0) {
			this.vel.y = -JUMP_VELOCITY;
		}
		
		// Gravity
		this.vel.y += GRAVITY * delta;
		
		var oldY = this.pos.y;
		this.pos.x += delta * this.vel.x;
		this.pos.y += delta * this.vel.y;
		
		// Collision detection
		this.checkPlatforms(oldY);
		
		this.checkGameOver();
		
		// Update UI
		this.el.css('transform', 'translate3d(' + this.pos.x + 'px,' + this.pos.y + 'px,0)');
		
		this.el.toggleClass('right', this.til === 0);
		this.el.toggleClass('left', this.til === 1);
		this.el.toggleClass('jumping', this.vel.y < 0);
		this.el.toggleClass('walking', this.vel.x !== 0);
		
		// Update temp debug
		// $('.tempDebug .playerPosX span').html(this.pos.x);
		// $('.tempDebug .playerPosY span').html(this.pos.y);
	};
	
	Player.prototype.checkGameOver = function() {
		if (this.pos.y > HELL_Y) {
			this.game.gameOver();
		}
	};
	
	Player.prototype.checkPlatforms = function(oldY) {
		var that = this;
		var playerx1 = that.pos.x + PLAYER_OFFSET;
		var playerx2 = that.pos.x - PLAYER_OFFSET + PLAYER_WIDTH;
		
		this.game.forEachPlatform(function(p) {
			
			// PLAYER_WIDTH
			// PLAYER_OFFSET
			
			// Are we crossing Y.
			if (p.rect.y >= oldY && p.rect.y < that.pos.y) {
				
				// Are inside X bounds.
				//if (that.pos.x + PLAYER_HALF_WIDTH >= p.rect.x && that.pos.x - PLAYER_HALF_WIDTH <= p.rect.right) {
				if (playerx2 >= p.rect.x && playerx1 <= p.rect.right) {
					
					// COLLISION. Let's stop gravity.
					that.pos.y = p.rect.y;
					that.vel.y = 0;
				}
			}
		});
	};
	
	return Player;
});
