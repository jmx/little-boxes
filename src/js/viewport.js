define([], function () {
	return {
		viewportWidth:null,
		viewportHeight:null,
		init: function(canvas, width, height) {
			var gl;
			try {
				gl = canvas.getContext('experimental-webgl');
				gl.viewportWidth = width;
				gl.viewportHeight = height;
			} catch (e) {
			}
			if (!gl) {
				alert("Could not initialize WebGL");
			}
			return gl;
		}
	}
});