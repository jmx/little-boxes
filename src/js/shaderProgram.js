define([
	'underscore',
	'libs/text!assets/shaders/shader.vert',
	'libs/text!assets/shaders/shader.frag'
], function (_, vertexShader, fragmentShader) {
	return {
		getShaderProgram: function(gl) {
			var shaderProgram = gl.createProgram();

			_.each([
				{ type: gl.VERTEX_SHADER, data: vertexShader	},
				{ type: gl.FRAGMENT_SHADER,	data: fragmentShader }
			], function (s) {
				var shader = gl.createShader(s.type);
				gl.shaderSource(shader, s.data);
				gl.compileShader(shader);
				gl.attachShader(shaderProgram, shader);
			});

			gl.linkProgram(shaderProgram);

			if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
				alert("Could not initialize shaders");
				return;
			}

			gl.useProgram(shaderProgram);

			shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
			gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

			shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
			shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");

			return shaderProgram;
		}
	}
});