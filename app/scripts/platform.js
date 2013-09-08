/*global define */

define(function() {
	
	var Platform = function(rect, type) {
		
		// Default width and height
		if (typeof(rect.width) === 'undefined') rect.width = 64;
		if (typeof(rect.height) === 'undefined') rect.height = 24;
		
		this.rect = rect;
		this.rect.right = rect.x + rect.width;
		
		this.el = $('<div class="platform">');
		this.el.css({
			left: rect.x,
			top: rect.y,
			width: rect.width,
			height: rect.height
		});
		
		this.setType(this.checkPath());
	};
	
	var targetX = 240;
	var counter = 0;
	Platform.prototype.checkPath = function() {
		counter++;
		
		if (((targetX - 100) < this.rect.x && (targetX + 100) > this.rect.x) ) {
			
			targetX = this.rect.x + 12;
			
			if (counter > 25) {
				counter = 0;
				return 3;
			}
			
			return 2;
		}
		return 1;
	};
	
	Platform.prototype.move = function(x, y) {
		
		this.rect.x = x;
		this.rect.y = y;
		this.rect.right = this.rect.x + this.rect.width;
		
		this.setType(this.checkPath());
		
		this.el.css({ left: this.rect.x, top: this.rect.y });
		
	};
	
	Platform.prototype.getPoints = function() {
		
		var retPoints = this.points;
		
		this.el.append('<div class="addPoints">' + this.points + '</div>');
		this.el.find('.addPoints').animate({ top: -30 }, 500, function () {
			$(this).remove();
		});
		
		this.removeClass();
		this.points = 0;
		
		
		return retPoints;
	};
	
	Platform.prototype.setType = function(type) {
		
		this.type = type;
		
		if (this.type == 1) this.points = 1;
		else if (this.type == 2) this.points = 3;
		else if (this.type == 3) this.points = 15;
		
		this.removeClass();
		this.el.addClass('t' + this.type);
	}
	
	Platform.prototype.removeClass = function() {
		this.el.removeClass('t1').removeClass('t2').removeClass('t3');
	}
	
	Platform.prototype.onFrame = function() {};
	
	return Platform;
});
