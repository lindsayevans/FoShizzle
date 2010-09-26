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
	// TODO:
	// - add convenience chaining methods for setting properties & returning self
	// - events?
	FoShizzle.debug = false;
	FoShizzle.native_support;
	FoShizzle.native_test_query = '(min-width: 0), not screen';
	FoShizzle.test_id_prefix = 'FoShizzle-';
	FoShizzle.ignore_unsupported_media_types = true;
	FoShizzle.ignore_unsupported_media_features = true;

	// Public methods

	// Check if the device suports native media queries
	FoShizzle.check_native_support = function(){
		return FoShizzle.native_support === undefined ? (FoShizzle.native_support = test_native(FoShizzle.native_test_query)) : FoShizzle.native_support;
	};

	// Test if the supplied media query would be applied
	FoShizzle.test = function(q){
		return (FoShizzle.check_native_support() ? test_native : test_non_native)(q);
	};

	// Check if a query is in the cache
	FoShizzle.is_cached = function(q){
		return query_parser_cache[q.toLowerCase()] !== undefined;
	};

	// Clears the query cache
	FoShizzle.clear_cache = function(q){
		if(q !== undefined){
			q = q.toLowerCase();
			query_parser_cache[q.toLowerCase()] = undefined;
		}else{
			query_parser_cache = {};
		}
		
		return FoShizzle;
	};


	// Parses the query
	// TODO:
	// - handle malformed queries
	FoShizzle.parse = function(q){

		var q = q.toLowerCase(), pq = [], mq, m_mql, m_mq, m_e;

		if(FoShizzle.is_cached(q)){
			return query_parser_cache[q];
		}

		// Media query list
		r_media_query_list.lastIndex = 0;
		while((m_mql = r_media_query_list.exec(q)) !== null){

			// Media query
			mq = null;
			r_media_query.lastIndex = 0;
			while((m_mq = r_media_query.exec(m_mql[1])) !== null){
log(m_mq);
				if(m_mq[0] === '' && m_mq[3] === undefined) break;
				if(m_mq[2] !== 'and'){
					r_media_type.lastIndex = 0;
					if(m_mq[2] === undefined || (!FoShizzle.ignore_unsupported_media_types || (FoShizzle.ignore_unsupported_media_types && r_media_type.exec(m_mq[2]) !== null))){
						mq = {query: m_mql[1], keyword: m_mq[1] || null, media_type: m_mq[2] || null, expressions: []};
					}
				}

				// Expression
				r_expression.lastIndex = 0;
				r_media_feature.lastIndex = 0;
				if(mq !== null && m_mq[3] && (m_e = r_expression.exec(m_mq[3])) !== null && (!FoShizzle.ignore_unsupported_media_features || (FoShizzle.ignore_unsupported_media_features && r_media_feature.exec(m_e[2]) !== null))){
					mq.expressions.push({prefix: m_e[1] || null, media_feature: m_e[2] || null, expr: m_e[3] || null});
				}

			}

			if(mq !== null) pq.push(mq);
		}

		return query_parser_cache[q] = pq;

	};

	// Private functions
	var

		log = function(m){
			if(FoShizzle.debug && console.log) console.log(m);
		},

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

			var pq = FoShizzle.parse(q);

			return false;
		},

		query_parser_cache = {};

		test_css_properties = 'position: absolute; top: -1337em; left: 0; height: 10px !important;',

		// Regular expressions to match parts of the media query
		r_media_query_list = /([^,]+)(?:\s*,\s*)?/g,
		r_media_query = /(only|not)?\s*([a-z]+[a-z0-9-]*)?\s*(?:and\s+)?(\([^\)]+\))?/gi,
		//r_media_query = /(only|not)?\s*([a-z]+[a-z0-9-]*)?\s*(?:and\s*)?(?:(?:\()([^\)]+)(?:\)))?/gi, // don't capture parens around expression
		r_media_type = /^(all|aural|braille|embossed|handheld|print|projection|screen|speech|tty|tv)$/gi, // CSS2 media types
		//r_expression = /\(\s*([a-z]+[a-z0-9-]*)\s*(?:(?:\:\s*)([^\)]+)?)?\)/g, // doesn't capture min & max prefixes
		r_expression = /\(\s*(?:(min|max)-)?([a-z]+[a-z0-9-]*)\s*(?:(?:\:\s*)([^\)]+)?)?\)/gi,
		r_media_feature = /^(width|height|device-width|device-height|orientation|aspect-ratio|device-aspect-ratio|color|color-index|monochrome|resolution|scan|grid)$/gi


	;


	// Expose in globals
	window.FoShizzle = window.$fs = FoShizzle;

})(window, document);
