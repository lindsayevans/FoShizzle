/*!
 * FoShizzle 0.0.1 - JavaScript CSS3 Media Query Engine
 *
 * Copyright (c) 2010 Lindsay Evans <http://linz.id.au/>
 * Licensed under the MIT <http://www.opensource.org/licenses/mit-license.php)> license.
 */
(function(window, document, undefined){

	var FoShizzle = function(q){
		return FoShizzle.test(q);
	};

	// Metadata
	FoShizzle.type = 'library';
	FoShizzle.name = 'FoShizzle';
	FoShizzle.major_version = 0;
	FoShizzle.minor_version = 0;
	FoShizzle.patch_version = 1;
	FoShizzle.special_version = '';
	FoShizzle.version = '0.0.1';
	FoShizzle.globals = ['FoShizzle', '$fs'];


	// Public properties
	FoShizzle.native_support;

	FoShizzle.test_css_properties = 'position: absolute; top: -1337em; left: 0; height: 10px;';

	FoShizzle.test_id_prefix = 'FoShizzle-';

	// Public methods

	// Check if the device suports native media queries
	FoShizzle.check_native_support = function(){
		return FoShizzle.native_support === undefined ? (FoShizzle.native_support = test_native('(min-width: 0px)')) : FoShizzle.native_support;
	};

	// Test if the supplied media query would be applied
	FoShizzle.test = function(q){
		return (FoShizzle.check_native_support() ? test_native : test_non_native)(q);
	};

	// Private functions
	
	// Native test
	// TODO: handle devices that don't support getElementsByTagName, createElement, appendChild etc. (would anything that supports MQ NOT support these?)
	var test_native = function(query){
		var head = document.getElementsByTagName('head')[0],
				body = document.getElementsByTagName('body')[0],
				style = document.createElement('style'),
				test = document.createElement('div'),
				style_content = '@media ' + query + ' { #' + FoShizzle.test_id_prefix + 'test { ' + FoShizzle.test_css_properties + ' } }'
				applied = false;

		style.setAttribute('id', FoShizzle.test_id_prefix + 'test-style');
		style.innerHTML = style_content;
		head.appendChild(style);

		test.setAttribute('id', FoShizzle.test_id_prefix + 'test');
		body.appendChild(test);

		applied = test.clientHeight === 10;

		head.removeChild(style);
		body.removeChild(test);

		return applied;

	};

	// Non-native test
	// TODO: everything
	var test_non_native = function(query){
		return false;
	};


	// Expose in globals
	window.FoShizzle = window.$fs = FoShizzle;

})(window, document);
