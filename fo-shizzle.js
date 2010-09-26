/*!
 * FoShizzle 0.0.1a - JavaScript CSS3 Media Query Engine
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
	FoShizzle.special_version = 'a';
	FoShizzle.version = '0.0.1a';
	FoShizzle.globals = ['FoShizzle', '$fs'];


	// Public properties
	FoShizzle.native_support;

	FoShizzle.native_test_query = '(min-width: 0), not screen';

	FoShizzle.test_id_prefix = 'FoShizzle-';

	// Public methods

	// Check if the device suports native media queries
	FoShizzle.check_native_support = function(){
		return FoShizzle.native_support === undefined ? (FoShizzle.native_support = test_native(FoShizzle.native_test_query)) : FoShizzle.native_support;
	};

	// Test if the supplied media query would be applied
	FoShizzle.test = function(q){
		return (FoShizzle.check_native_support() ? test_native : test_non_native)(q);
	};


	// Parses the query
	// TODO: handle malformed queries
	FoShizzle.parse = function(q){

		var pq = [], mq, m_mql, m_mq, m_e;

		// Media query list
		r_media_query_list.lastIndex = 0;
		while((m_mql = r_media_query_list.exec(q)) !== null){

			// Media query
			r_media_query.lastIndex = 0;
			// TODO: multiple ands
			if((m_mq = r_media_query.exec(m_mql[1])) !== null){
				mq = {query: m_mql[1], keyword: m_mq[1] || null, media_type: m_mq[2] || null, expression: m_mq[3] || null};

				// Expression
				r_expression.lastIndex = 0;
				if(m_mq[3] && (m_e = r_expression.exec(m_mq[3])) !== null){
					mq.expression = {prefix: m_e[1] || null, media_feature: m_e[2] || null, expr: m_e[3] || null};
				}
				pq.push(mq);
			}
		}

		return pq;

	};

	// Private functions
	var
	
		// Native test
		// TODO: handle devices that don't support getElementsByTagName, createElement, appendChild etc. (would anything that supports MQ NOT support these?)
		test_native = function(query){
			var head = document.getElementsByTagName('head')[0],
					body = document.getElementsByTagName('body')[0],
					style = document.createElement('style'),
					test = document.createElement('div'),
					style_content = '@media ' + query + ' { #' + FoShizzle.test_id_prefix + 'test { ' + test_css_properties + ' } }'
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

		},

		// Non-native test
		// TODO: everything
		test_non_native = function(q){

			return false;
		},


		test_css_properties = 'position: absolute; top: -1337em; left: 0; height: 10px !important;',

		// Regular expressions to match parts of the media query
		r_media_query_list = /([^,]+)(?:\s*,\s*)?/g,
		r_media_query = /(only|not)?\s*([a-z]+[a-z0-9-]*)?\s*(?:and\s*)?(\([^\)]+\))?/gi,
		//r_media_query = /(only|not)?\s*([a-z]+[a-z0-9-]*)?\s*(?:and\s*)?(?:(?:\()([^\)]+)(?:\)))?/gi, // don't capture parens around expression
		r_media_type = /(all|aural|braille|embossed|handheld|print|projection|screen|speech|tty|tv)/gi, // CSS2 media types
		//r_expression = /\(\s*([a-z]+[a-z0-9-]*)\s*(?:(?:\:\s*)([^\)]+)?)?\)/g, // doesn't capture min & max prefixes
		r_expression = /\(\s*(?:(min|max)-)?([a-z]+[a-z0-9-]*)\s*(?:(?:\:\s*)([^\)]+)?)?\)/gi,
		r_media_feature = /(width|height|device-width|device-height|orientation|aspect-ratio|device-aspect-ratio|color|color-index|monochrome|resolution|scan|grid)/gi


	;


	// Expose in globals
	window.FoShizzle = window.$fs = FoShizzle;

})(window, document);
