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

	// Public methods

	// Check if the device suports native media queries
	FoShizzle.check_native_support = function(){
		return FoShizzle.native_support === undefined ? (FoShizzle.native_support = FoShizzle.test_native('(min-width: 0px)')) : FoShizzle.native_support;
	};

	// Test if the supplied media query would be applied
	FoShizzle.test = function(query){
		return FoShizzle.check_native_support() ? FoShizzle.test_native(query) : FoShizzle.test_non_native(query);
	};

	// Native test
	// TODO: handle devices that don't support getElementsByTagName, createElement, appendChild etc.
	FoShizzle.test_native = function(query){
		var head = document.getElementsByTagName('head')[0],
				body = document.getElementsByTagName('body')[0],
				style = document.createElement('style'),
				test = document.createElement('div'),
				style_content = '@media ' + query + ' { #FoShizzle-test { position: absolute; top: -1337em; left: 0; height: 10px; } }'
				applied = false;

		style.setAttribute('id', 'FoShizzle-test-style');
		style.innerHTML = style_content;
		head.appendChild(style);

		test.setAttribute('id', 'FoShizzle-test');
		body.appendChild(test);

		applied = test.clientHeight === 10;

		head.removeChild(style);
		body.removeChild(test);

		return applied;

	};

	// Non-native test
	// TODO: everything
	FoShizzle.test_non_native = function(query){
		return false;
	};


	// Assign self to globals & return
	return (window.FoShizzle = window.$fs = FoShizzle);

})(window, document);
