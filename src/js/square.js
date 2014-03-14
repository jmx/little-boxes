define([], function() {
	return {
		vertices: [
			 1.0,  1.0,  0.0,
			-1.0,  1.0,  0.0,
			 1.0, -1.0,  0.0,
			-1.0, -1.0,  0.0
		],
		itemSize: 3,
		numItems: 4,
		draw: function (gl) {
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numItems);
		}
		
	}
});