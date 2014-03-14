requirejs.config({
	paths: {
		'jquery': 'libs/jquery-2.1.0',
		'underscore': 'libs/underscore',
		'matrix': 'libs/glMatrix-0.9.5.min',
		'utils': 'libs/webgl-utils'
	},
	shim: {
		'underscore': {
			exports: '_'
		}
	}
});

requirejs([
	'game'
], function (game) {
	"use strict";
	var gameCanvas = document.getElementById('paintball');
	game.init(gameCanvas);

});