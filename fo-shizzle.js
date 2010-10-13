/*!
 * FoShizzle 0.0.1a - JavaScript CSS3 Media Query Engine
 *
 * Copyright (c) 2010 Lindsay Evans <http://linz.id.au/>
 * Licensed under the MIT <http://www.opensource.org/licenses/mit-license.php)> license.
 */

/*jslint eqeqeq: true */
/*global console: false, window: false, document: false, screen: false */

/* TODO:
 * - events?
 * - Extensibility:
 *   - Scope new functions to FoShizzle
 *   - Normalise query & store in private var so new functions can access
 * - handle malformed queries in .parse()
 * - the ignore unsupported features stuff needs to be moved to the test function, as we need to return false as per '3.1. Error Handling'
 * - fully implement check_media_type()
 * - test on different devices
 */
(function(window, document, screen){

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
	FoShizzle.debug = false;
	FoShizzle.native_support = undefined;
	FoShizzle.native_check_query = 'only screen, not screen';
	FoShizzle.check_id_prefix = 'FoShizzle-';
	FoShizzle.ignore_unsupported_media_types = true;
	FoShizzle.ignore_unsupported_media_features = true;
	FoShizzle.user_agent = navigator.userAgent || '';
	FoShizzle.window = window;
	FoShizzle.document = document;
	FoShizzle.screen = screen;

	// Public methods

	// Convenience method for setting properties & returning self, for chaining purposes: FoShizzle.set('debug', true).test(...)
	FoShizzle.set = function(property, value){
		FoShizzle[property] = value;
		return FoShizzle;
	};

	// Check if the device suports native media queries
	FoShizzle.check_native_support = function(){
		return FoShizzle.native_support === undefined ? (FoShizzle.native_support = document.createElement && check_native(FoShizzle.native_check_query)) : FoShizzle.native_support;
	};

	// Test if the supplied media query would be applied
	FoShizzle.test = function(q){
		return (FoShizzle.check_native_support() ? check_native : check_non_native)(q);
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

	// Extensibility - add/replace media type
	FoShizzle.add_type = function(name, f){
		// Add name to feature RegExp if not exist
		if(check_media_type_map[name] === undefined){
			var s = r_media_type.source.split('('),
					m = r_media_type.global ? 'g' : '';
			m += r_media_type.ignoreCase ? 'i' : '';
			r_media_type = new RegExp(s[0] + '(' + name + '|' + s[1], m);
		}
		// Add feature test function to map
		check_media_type_map[name] = f;
		return FoShizzle;
	};

	// Extensibility - add/replace media feature
	FoShizzle.add_feature = function(name, f){
		// Add name to feature RegExp if not exist
		if(check_feature_map[name] === undefined){
			var s = r_media_feature.source.split('('),
					m = r_media_feature.global ? 'g' : '';
			m += r_media_feature.ignoreCase ? 'i' : '';

			// apparently doesn't work in Opera - new RegExp() should, and doesn't incur a significant performance penalty
			//r_media_feature.compile(s[0] + '(' + name + '|' + s[1], m);
			r_media_feature = new RegExp(s[0] + '(' + name + '|' + s[1], m);
		}
		// Add feature test function to map
		check_feature_map[name] = f;
		return FoShizzle;
	};

	// Parses the query
	FoShizzle.parse = function(q){

		var pq = [], mq, m_mql, m_mq, m_e;
		q = q.toLowerCase();

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
				if(m_mq[0] === '' && m_mq[3] === undefined){
					break;
				}
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

			if(mq !== null){
				pq.push(mq);
			}
		}

		return (query_parser_cache[q] = pq);

	};

	// Private functions
	var

		log = function(m){
			if(FoShizzle.debug && console.log){
				console.log(m);
			}
		},

		// Native test
		check_native = function(query){
			var head = document.getElementsByTagName('head')[0],
					body = document.getElementsByTagName('body')[0],
					style = document.createElement('style'),
					test = document.createElement('div'),
					style_content = '@media ' + query + ' { #' + FoShizzle.check_id_prefix + 'test { ' + check_css_properties + ' } }',
					applied = false;

			style.setAttribute('id', FoShizzle.check_id_prefix + 'test-style');
			style.innerHTML = style_content;
			head.appendChild(style);

			test.setAttribute('id', FoShizzle.check_id_prefix + 'test');
			body.appendChild(test);

			applied = test.clientHeight === 10;

			head.removeChild(style);
			body.removeChild(test);

			return applied;

		},

		// Non-native test
		check_non_native = function(q){

			var pq = FoShizzle.parse(q),
					pass = false,
					query_pass,
					type_pass, feature_pass,
					i, ii, pq_l = pq.length, pq_e_l;

			for(i = 0; i < pq_l; i++){
				// Check media type
				query_pass = type_pass = check_media_type(pq[i].media_type);
				if(type_pass){
					// Check expressions
					feature_pass = true;
					pq_e_l = pq[i].expressions.length;
					for(ii = 0; ii < pq_e_l; ii++){
						feature_pass = feature_pass && check_media_feature(pq[i].expressions[ii].prefix, pq[i].expressions[ii].media_feature, pq[i].expressions[ii].expr);
					}
					query_pass = feature_pass;
				}
				pass = pass || (pq[i].keyword === 'not') ? !query_pass : query_pass;
			}

			return pass;
		},

		// Test if the device supports the specified media type
		// TODO: figure out how to detect other devices
		check_media_type = function(media_type){
			if(media_type === null){
				return true;
			}
			if(check_media_type_map[media_type]){
				return check_media_type_map[media_type].call(this, media_type);
			}
			return false;
		},

		check_all_type = function(media_type){
			return true;
		},

		check_screen_type = function(media_type){
			return true;
		},

		check_handheld_type = function(media_type){
			return !!r_handheld_ua.test(FoShizzle.user_agent);
		},

		check_tv_type = function(media_type){
			return !!r_tv_ua.test(FoShizzle.user_agent);
		},

		check_type_unimplemented = function(media_type){
			//throw(media_type + ' media type detection is not implemented');
			return false;
		},


		// Test if the device supports the specified media feature
		check_media_feature = function(prefix, media_feature, expr){			
			return check_feature_map[media_feature].call(this, prefix, expr, media_feature);
		},

		check_number = function(p, e, t){
			var v = parseInt(e, 10);
			if(t === undefined){
				return false;
			}
			if(isNaN(v)){
				return true;
			}
			switch(p){
				case 'min':
					return t >= v;
				case 'max':
					return t <= v;
			}
			return t === v;
		},

		check_float = function(p, e, t){
			var v = parseFloat(e);
			if(t === undefined){
				return false;
			}
			if(isNaN(v)){
				return true;
			}
			switch(p){
				case 'min':
					return t >= v;
				case 'max':
					return t <= v;
			}
			return t === v;
		},

		check_width_feature = function(p, e){
			return check_number(p, e, FoShizzle.window.innerWidth);
		},

		check_height_feature = function(p, e){
			return check_number(p, e, FoShizzle.window.innerHeight);
		},

		check_device_width_feature = function(p, e){
			return check_number(p, e, FoShizzle.screen.width);
		},

		check_device_height_feature = function(p, e){
			return check_number(p, e, FoShizzle.screen.height);
		},

		check_resolution_feature = function(p, e){

			var head = document.getElementsByTagName('head')[0],
					body = document.getElementsByTagName('body')[0],
					style = document.createElement('style'),
					test = document.createElement('div'),
					units = e !== null && e.indexOf('dpi' === -1) ? 'cm' : 'in',
					width = units === 'in' ? '2.54' : '1',
					style_content = '#' + FoShizzle.check_id_prefix + 'dpi-test { width: ' + width + 'cm !important; padding: 0 !important; } }',
					ppu;

			style.setAttribute('id', FoShizzle.check_id_prefix + 'dpi-test-style');
			style.innerHTML = style_content;
			head.appendChild(style);

			test.setAttribute('id', FoShizzle.check_id_prefix + 'dpi-test');
			body.appendChild(test);

			ppu = document.getElementById(FoShizzle.check_id_prefix + 'dpi-test').offsetWidth;

			head.removeChild(style);
			body.removeChild(test);

			return check_number(p, e, ppu);

		},

		check_orientation_feature = function(p, e){
			if(p !== null){
				return false;
			}else if(e === null){
				return true;
			}else if(e === 'portrait' && FoShizzle.window.innerHeight >= FoShizzle.window.innerWidth){
				return true;
			}else if(e === 'landscape' && FoShizzle.window.innerHeight < FoShizzle.window.innerWidth){
				return true;
			}
			return false;
		},

		check_aspect_ratio_feature = function(p, e){

			if(e === null){
				return true;
			}

			var ar = e.split('/');

			if(ar.length !== 2){
				return false;
			}
			return check_float(p, ar[0] / ar[1], FoShizzle.window.innerWidth / FoShizzle.window.innerHeight);
		},

		check_device_aspect_ratio_feature = function(p, e){

			if(e === null){
				return true;
			}

			var ar = e.split('/');

			if(ar.length !== 2){
				return false;
			}
			return check_float(p, ar[0] / ar[1], FoShizzle.screen.width / FoShizzle.screen.height);
		},

		check_color_feature = function(p, e){
			return check_number(p, e, FoShizzle.screen.colorDepth / 8);
		},

		check_color_index_feature = function(p, e){
			return check_number(p, e, Math.pow(2, FoShizzle.screen.colorDepth));
		},

		check_feature_unimplemented = function(p, e, f){
			//throw(f + ' feature detection is not implemented');
			return false;
		},


		check_media_type_map = {
			'all': check_all_type,
			'screen': check_screen_type,
			'handheld': check_handheld_type,
			'tv': check_tv_type,
			'aural': check_type_unimplemented,
			'braille': check_type_unimplemented,
			'embossed': check_type_unimplemented,
			'print': check_type_unimplemented,
			'projection': check_type_unimplemented,
			'speech': check_type_unimplemented,
			'tty': check_type_unimplemented
		},

		check_feature_map = {
			'width': check_width_feature,
			'height': check_height_feature,
			'device-width': check_device_width_feature,
			'device-height': check_device_height_feature,
			'orientation': check_orientation_feature,
			'aspect-ratio': check_aspect_ratio_feature,
			'device-aspect-ratio': check_device_aspect_ratio_feature,
			'color': check_color_feature,
			'color-index': check_color_index_feature,
			'monochrome': check_feature_unimplemented,
			'resolution': check_resolution_feature,
			'scan': check_feature_unimplemented,
			'grid': check_feature_unimplemented
		},

		query_parser_cache = {},

		check_css_properties = 'position: absolute; top: -1337em; left: 0; height: 10px !important;',

		// Regular expressions to match parts of the media query
		r_media_query_list = /([^,]+)(?:\s*,\s*)?/g,
		r_media_query = /(only|not)?\s*([a-z]+[a-z0-9\-]*)?\s*(?:and\s+)?(\([^\)]+\))?/gi,
		r_media_type = /^(all|aural|braille|embossed|handheld|print|projection|screen|speech|tty|tv)$/gi, // CSS2 media types
		r_expression = /\(\s*(?:(min|max)\-)?([a-z]+[a-z0-9\-]*)\s*(?:(?:\:\s*)([^\)]+)?)?\)/gi,
		r_media_feature = /^(width|height|device-width|device-height|orientation|aspect-ratio|device-aspect-ratio|color|color-index|monochrome|resolution|scan|grid)$/gi,

		// Check if User Agent string matches known handheld devices
		r_handheld_ua = /IEMobile|WM5 PIE|Windows Phone|Windows CE|MobileExplorer|Blackberry|UP\.Browser|UP\.Link|NetFront|Smartphone|Opera Mini|Opera Mob|Nokia|Symbian|SymbOS|PalmOS|PalmSource|SonyEricsson|PlayStation Portable/gi,

		// Check if User Agent string matches known TV devices
		r_tv_ua = /Wii|PLAYSTATION 3|Xbox|WebTV|MSNTV|MediaCenter/gi

	;


	// Expose in globals
	window.FoShizzle = window.$fs = FoShizzle;

})(window || this, document || {}, screen || {});
