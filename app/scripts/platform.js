/*global define */

define(function() {
	
	var Platform = function(rect) {
		
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
	};
	
	Platform.prototype.onFrame = function() {};
	
	return Platform;
});
