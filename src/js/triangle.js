define([
	'underscore',
	'glObject'
], function(_, glObject) {
	return _.extend( _.clone(glObject), {
		vertices: [
			 0.0,  1.0,  0.0,
			-1.0, -1.0,  0.0,
			 1.0, -1.0,  0.0
		],
		itemSize: 3,
		numItems: 3,
		draw: function (gl) {
			gl.drawArrays(gl.TRIANGLES, 0, this.numItems);
		}
	});
});