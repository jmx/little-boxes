define([
	'underscore',
	'viewport',
	'triangle',
	'cube',
	'utils'
], function(_, viewport, triangle, cube) {
	return {
		init: function (canvas) {
			var gl = viewport.init(canvas, canvas.width, canvas.height);
			for (var x = 0; x<75; x++) {
				for (var y=0; y<75; y++) {
					var height = Math.random() * 100;
					viewport.addChild(cube, 2*x-25, 2*y-25, height, 'crate.gif');
				}
			}

			viewport.tick();
			
		}
	};
});