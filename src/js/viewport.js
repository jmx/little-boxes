define([
	'jquery',
	'underscore',
	'matrix',
	'shaderProgram'
], function ($, _, matrix, spGenerator) {

	var gl;
	var self;
	var shaderProgram;

	var mvMatrix = matrix.mat4.create();
	var mvMatrixStack = [];
	var pMatrix = matrix.mat4.create();

	var textures = Array();

	var lastTime = 0;

	var perspective = 45;

	var xRot = 0;

	return {
		viewportWidth:null,
		viewportHeight:null,
		sceneObjects:[],

		pushMatrix: function () {
			var copy = matrix.mat4.create();
			matrix.mat4.set(mvMatrix, copy);
			mvMatrixStack.push(copy);
		},

		popMatrix: function () {
			if (mvMatrixStack.length == 0) {
				throw "Invalid popMatrix";
			}
			mvMatrix = mvMatrixStack.pop();
		},

		deg2Rad: function (deg) {
			return deg*Math.PI/180;
		},

		handleLoadedTexture: function (textures) {
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

			gl.bindTexture(gl.TEXTURE_2D, textures[0]);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[0].image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

			gl.bindTexture(gl.TEXTURE_2D, textures[1]);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[1].image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

			gl.bindTexture(gl.TEXTURE_2D, textures[2]);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textures[2].image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
			gl.generateMipmap(gl.TEXTURE_2D);

			gl.bindTexture(gl.TEXTURE_2D, null);
		},

		loadTexture: function (url) {
			var dfd = $.Deferred();
			var tImage = new Image();

			for (var i=0; i<3; i++) {
				var texture = gl.createTexture();
				texture.image = tImage;
				textures.push(texture);
			}

			tImage.onload = function () {
				self.handleLoadedTexture(textures);
				dfd.resolve();
			}

			tImage.src = 'js/assets/textures/'+url;

			return dfd;
		},

		addChild: function(obj, x, y, z, texture) {
			o = _.clone(obj);
			var dfd;
			if (texture) {
				dfd = this.loadTexture(texture);
			} else {
				dfd = $.Deferred();
				dfd.resolve();
			}
			o.vertexBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);

			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(o.vertices), gl.STATIC_DRAW);

			if (typeof o.textureCoords !== 'undefined') {
				o.textureCoordBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, o.textureCoordBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(o.textureCoords), gl.STATIC_DRAW);
			}

			if (typeof o.vertexIdx !== 'undefined') {
				o.vertexIndexBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.vertexIndexBuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(o.vertexIdx), gl.STATIC_DRAW);
			}
			o.x=x; o.y=y; o.z=z;
			this.sceneObjects.push(o);

			return dfd.promise();
		},
		setMatrixUniforms: function () {
			gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
			gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
		},
		init: function(canvas, width, height) {
			self = this;
			try {
				gl = canvas.getContext('webgl');
				gl.viewportWidth = width;
				gl.viewportHeight = height;
			} catch (e) {
			}
			if (!gl) {
				alert("Could not initialize WebGL");
			}
			shaderProgram = spGenerator.getShaderProgram(gl);

			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.enable(gl.DEPTH_TEST);
			matrix.mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
			return gl;
		},
		animate: function () {
			var timeNow = new Date().getTime();
			if (lastTime != 0) {
				var elapsed = timeNow - lastTime;
			}
			lastTime = timeNow;
			xRot+=0.25;
		},
		tick: function () {
			window.requestAnimFrame(self.tick);
			self.drawScene();
			self.animate();
		},
		drawScene: function() {
			gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			matrix.mat4.identity(mvMatrix);
			matrix.mat4.translate(mvMatrix, [0.0, 0.0, -50.0]);
			matrix.mat4.rotate(mvMatrix, self.deg2Rad(xRot), [1, 0.5, 0]);
			_.each(this.sceneObjects, function (o){
				
	 
				gl.bindBuffer(gl.ARRAY_BUFFER, o.vertexBuffer);
				gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, o.itemSize, gl.FLOAT, false, 0, 0);
				if (o.textureCoordBuffer) {
					gl.bindBuffer(gl.ARRAY_BUFFER, o.textureCoordBuffer);
					gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, o.textureItemSize, gl.FLOAT, false, 0, 0);
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, textures[2]);
					gl.uniform1i(shaderProgram.samplerUniform, 0);
				}
				if (o.vertexIndexBuffer) {
					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, o.vertexIndexBuffer);
				}
				matrix.mat4.translate(mvMatrix, [o.x, o.y, o.z]);
				self.setMatrixUniforms();

				o.draw(gl);
				matrix.mat4.translate(mvMatrix, [-o.x, -o.y, -o.z]);

			});

		}
	}

});