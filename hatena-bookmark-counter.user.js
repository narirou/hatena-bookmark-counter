// ==UserScript==
// @name        Hatena Bookmark Counter
// @version     0.4.1
// @namespace   https://github.com/narirou/
// @author      narirou
// @description Add hatena bookmark count to the search results.
// @include     http://www.google.tld/*
// @include     https://www.google.tld/*
// @include     http://search.yahoo.co.jp/*
// @include     https://search.yahoo.co.jp/*
// @include     http://www.bing.com/search*
// @include     https://www.bing.com/search*
// @updateURL   https://raw.githubusercontent.com/narirou/hatena-bookmark-counter/master/hatena-bookmark-counter.meta.js
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @run-at      document-end
// @noframes
// @license     MIT Lisense
// ==/UserScript==


(function( window, document ) {

	'use strict';

	// Site Data
	var dataSet = {
		google: {
			match: /^https?:\/\/www\.google\..+$/,
			mainId: 'main',
			contentIds: [ 'ires', 'rso' ],
			contentClasses: [ 'g' ],
			contentAttrs: [ 'data-ved' ],
			selector: '#res h3',
		},

		yahooJapan: {
			match: /^https?:\/\/search\.yahoo\.co\.jp\/.+$/,
			mainId: 'mIn',
			contentIds: [ 'WS2m' ],
			selector: '#WS2m h3',
		},

		bing: {
			match: /^https?:\/\/www\.bing\.com\/search\?.+$/,
			mainId: 'b_content',
			contentClasses: [ 'b_algo' ],
			selector: '.b_algo h2'
		}
	};

	// Hatena Boockmark API
	var HATENA = {
		TITLE: 'Hatena Bookmark',
		ENTRY_URL: 'http://b.hatena.ne.jp/entry/',
		COUNT_URL: 'http://api.b.st-hatena.com/entry.counts',
		COUNT_LIMIT: 50,
	};

	var BASE_CLASS = '__hbc';

	// Counter
	var counter = function() {
		if( counter.loadData() ) {
			var main = document.getElementById( counter.data.mainId );

			var listener = function() {
				counter.count( main );
				window.removeEventListener( 'load', listener, false );
			};
			window.addEventListener( 'load', listener, false );

			counter.addCss();
			counter.observe( main );
		}
	};

	counter.loadData = function() {
		var url = window.location.href;

		for( var key in dataSet ) {
			if( dataSet[ key ].match.test( url ) ) {
				counter.data = dataSet[ key ];
				return true;
			}
		}
		return false;
	};

	counter.data = null;

	counter.count = function( target ) {
		if( ! target ) return;

		var items    = target.querySelectorAll( counter.data.selector ),
			itemData = {},
			params   = '';

		for( var index = 0, len = items.length; index < len; index++ ) {
			var item = items[ index ],
				link = item.childNodes[ 0 ];

			if( link.tagName && link.tagName.toLowerCase() === 'a' ) {

				// check
				if( link.getAttribute( BASE_CLASS ) ) continue;

				link.setAttribute( BASE_CLASS, true );

				// remove tracking
				link.removeAttribute( 'onmousedown' );

				// set items
				itemData[ link.href ] = item;

				// set params
				params += ( index === 0 ) ? '?url=' : '&url=';
				params += encodeURI( link.href );

				// request when limit
				if( (index + 1) % HATENA.COUNT_LIMIT === 0 ) {
					counter.request( itemData, params );
					itemData = {};
					params = '';
				}
			}
		}

		if( params ) {
			counter.request( itemData, params );
		}
	};

	counter.request = function( itemData, params ) {
		var parseData = function( response ) {
			counter.addHtml( itemData, JSON.parse( response.responseText ) );
		};

		GM_xmlhttpRequest({ // jshint ignore:line
			method: 'GET',
			url: HATENA.COUNT_URL + params,
			onload: parseData
		});
	};

	counter.addHtml = function( itemData, json ) {
		for( var url in itemData ) {
			var count = json[ url ];
			if( ! count ) continue;

			var icon = document.createElement( 'a' );
			icon.title = HATENA.TITLE;
			icon.href = HATENA.ENTRY_URL + url.replace( /^https?:\/\/(.*)$/, '$1' );
			icon.className = counter.className( count );
			icon.innerHTML = count + ' <span>users</span>';

			itemData[ url ].appendChild( icon );
		}
	};

	counter.className = function( count ) {
		if( count < 4 ) {
			return BASE_CLASS + '_0';
		}
		else if( count < 10 ) {
			return BASE_CLASS + '_1';
		}
		else if( count < 50 ) {
			return BASE_CLASS + '_2';
		}
		else {
			return BASE_CLASS + '_3';
		}
	};

	// Insert Event
	counter.observe = function( main ) {
		var MutationObserver = window.MutationObserver ||
		                       window.WebKitMutationObserver ||
		                       window.MozMutationObserver;

		if( ! MutationObserver ) return;

		var eachMutations = function( mutations ) {
			mutations.forEach( eachRecords );
		};

		var eachRecords = function( record ) {
			var nodes = record.addedNodes;

			for( var index = 0, len = nodes.length; index < len; index++ ) {
				var node = nodes[ index ];

				if( node.nodeType === 1 ) {
					eachNode( node );
				}
			}
		};

		var eachNode = function( node ) {
			var ids     = counter.data.contentIds,
				classes = counter.data.contentClasses,
				attrs   = counter.data.contentAttrs;

			// Search Id & Class
			if( ( ids && ids.indexOf( node.id ) !== -1 ) ||
				( classes && classes.indexOf( node.className ) !== -1 ) ) {
				return counter.count( node );
			}

			// Search Attribute
			if( attrs ) {
				attrs.forEach( function( attr ) {
					if( node.getAttribute( attr ) ) {
						counter.count( node );
					}
				});
			}
		};

		var observer = new MutationObserver( eachMutations );

		observer.observe( main, { childList: true, subtree: true } );
	};

	// CSS
	counter.addCss = function() {
		var selector = counter.data.selector;

		GM_addStyle([ // jshint ignore:line
			selector, '{',
				'overflow-x: visible !important;',
				'display: inline !important;',
			'}',
			selector, ' a[class^="', BASE_CLASS, '"]{',
				'color: #fff !important;',
				'font-size: 11px;',
				'font-weight: bold;',
				'padding: 2px 7px;',
				'position: relative;',
				'top: -2px;',
				'left: 7px;',
				'text-decoration: none;',
				'border-radius: 2px;',
				'white-space: nowrap;',
			'}',
			selector, ' a[class^="', BASE_CLASS, '"] span{',
				'font-weight: normal;',
			'}',
			selector, ' a[class^="', BASE_CLASS, '"]:hover{',
				'background-color: #f3cb7e;',
				'color: #c87209 !important;',
				'text-decoration: none !important;',
			'}',
			selector, ' .', BASE_CLASS, '_0{',
				'background-color: #93cfea;',
			'}',
			selector, ' .', BASE_CLASS, '_1{',
				'background-color: #74c2e4',
			'}',
			selector, ' .', BASE_CLASS, '_2{',
				'background-color: #5bb8df',
			'}',
			selector, ' .', BASE_CLASS, '_3{',
				'background-color: #39a9d9',
			'}',
		].join(''));
	};

	// Start
	counter();

})( window, document );
