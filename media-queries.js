var MediaQueries = (function(mq, window, document, undefined){

	// Metadata
	mq.type = 'library';
	mq.name = 'CSS3 Media Queries Library';
	mq.major_version = 0;
	mq.minor_version = 0;
	mq.patch_version = 1;
	mq.special_version = '';
	mq.version = '0.0.1';
	mq.globals = ['MediaQueries', 'mq'];

	// Public properties
	mq.native_support;

	// Public methods

	// Check if the device suports native media queries
	mq.check_native_support = function(){
		return mq.native_support === undefined ? (mq.native_support = mq.test_native('(min-width: 0px)')) : mq.native_support;
	};

	// Test if the supplied media query would be applied
	mq.test = function(query){
		return mq.check_native_support() ? mq.test_native(query) : mq.test_non_native(query);
	};

	// Native test
	mq.test_native = function(query){
		var head = document.getElementsByTagName('head')[0],
				body = document.getElementsByTagName('body')[0],
				style = document.createElement('style'),
				test = document.createElement('div'),
				style_content = '@media ' + query + ' { #mq-test { position: absolute; top: -1337em; left: 0; height: 10px; } }'
				applied = false;

		style.setAttribute('id', 'mq-test-style');
		style.innerHTML = style_content;
		head.appendChild(style);

		test.setAttribute('id', 'mq-test');
		body.appendChild(test);

		applied = test.clientHeight === 10;

		head.removeChild(style);
		body.removeChild(test);

		return applied;

	};

	// Non-native test
	// TODO: everything
	mq.test_non_native = function(query){
		return false;
	};

	// Assign self to globals & return
	return (window.MediaQueries = window.mq = mq);

})(MediaQueries || {}, window, document);
