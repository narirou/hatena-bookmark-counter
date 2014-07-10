// ==UserScript==
// @name           Hatena Bookmark Counter
// @version        0.3.0
// @namespace      https://github.com/narirou/
// @author         narirou
// @description    Add hatena bookmark count to the search results.
// @include        http://www.google.tld/*
// @include        https://www.google.tld/*
// @include        http://search.yahoo.co.jp/*
// @include        https://search.yahoo.co.jp/*
// @grant          GM_xmlhttpRequest
// @grant          GM_addStyle
// @run-at         document-end
// @license        MIT Lisense
// ==/UserScript==


(function( window, document ) {

	'use strict';

	var dataSet = {
		google: {
			match: /^https?:\/\/www\.google\..+/,
			mainId: 'main',
			contentId: [ 'ires', 'rso' ],
			selector: '#res h3',
		},

		yahooJapan: {
			match: /^https?:\/\/search\.yahoo\.co\.jp\/.+/,
			mainId: 'mIn',
			contentId: 'WS2m',
			selector: '#WS2m h3',
		}
	};


	// Counter
	var counter = function( target ) {
		if( counter.loadData() ) {
			var main = document.getElementById( counter.data.mainId );

			window.onload = function() {
				counter.count( main );
			};
			counter.addCss();
			counter.observe( main );
		}
	};

	counter.loadData = function() {
		var url = window.location.href;

		for( key in dataSet ) {
			var data = dataSet[ key ];

			if( data.match.test( url ) ) {
				counter.data = data;
				return true;
			}
		}
		return false;
	};

	counter.data = null;

	counter.count = function( target ) {
		if( ! target ) return;

		var items = target.getElementsByTagName( 'h3' );

		for( var i = 0, len = items.length; i < len; i++ ) {
			var item = items[i],
				link = item.childNodes[0];

			if( link.tagName && link.tagName.toLowerCase() === 'a' ) {
				var url = 'http://b.hatena.ne.jp/entry/jsonlite/?url=' + encodeURI( link.href );

				// remove tracking
				link.removeAttribute( 'onmousedown' );

				// add HatenaCounter
				counter.requestJson( item, url );
			}
		}
	};

	counter.requestJson = function( item, url ) {
		GM_xmlhttpRequest( {
			method: 'GET',
			url: url,
			onload: function( response ) {
				var data = response.responseText;
				if( data === 'null' ) return;

				counter.addHtml( item, JSON.parse( data ) );
			}
		});
	};

	// HTML
	counter.addHtml = function( item, json ) {
		var count = parseInt( json.count, 10 );
		if( count === 0 ) return;

		var icon = document.createElement( 'a' );
		icon.title = 'Hatena Bookmark';
		icon.href = json.entry_url;
		icon.className = counter.className( count );
		icon.innerHTML = count + ' <span>users</span>';
		item.appendChild( icon );
	};

	// ClassName
	counter.className = function( count ) {
		var baseClassName = '_hatenaBookmarkCounter';
		switch( false ) {
			case !(count < 4):
				return baseClassName + '_0';
			case !(count < 10):
				return baseClassName + '_1';
			case !(count < 50):
				return baseClassName + '_2';
			default:
				return baseClassName + '_3';
		}
	};

	// Insert Event
	counter.observe = function( main ) {
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
		if( MutationObserver ) {
			var contentId = counter.data.contentId;

			var recorder = function( records ) {
				records.forEach( function( record ) {
					var nodes = record.addedNodes;

					for( var i = 0, len = nodes.length; i < len; i++ ) {
						var node = nodes[i];
						if( ! node ) continue;

						if( Array.isArray( contentId ) && contentId.indexOf( node.id ) !== -1 ) {
							window.onload = null;
							counter.count( node );
						}
						else if( typeof contentId === 'string' && contentId === node.id ) {
							window.onload = null;
							counter.count( node );
						}
					}
				});
			};

			var observer = new MutationObserver( recorder );
			observer.observe( main, { childList: true, subtree: true } );
		}
	};

	// CSS
	counter.addCss = function() {
		var selector = counter.data.selector
		GM_addStyle([
			selector, '{',
				'overflow-x: visible !important;',
				'display: inline !important;',
			'}',
			selector, ' a[class^="_hatenaBookmarkCounter"]{',
				'color: #fff !important;',
				'font-size: 11px;',
				'font-weight: bold;',
				'padding: 2px 7px;',
				'position: relative;',
				'top: -2px;',
				'left: 7px;',
				'text-decoration: none;',
				'border-radius: 2px;',
			'}',
			selector, ' a[class^="_hatenaBookmarkCounter"] span{',
				'font-weight: normal;',
			'}',
			selector, ' a[class^="_hatenaBookmarkCounter"]:hover{',
				'background-color: #f3cb7e;',
				'color: #c87209 !important;',
				'text-decoration: none !important;',
			'}',
			selector, ' ._hatenaBookmarkCounter_0{',
				'background-color: #93cfea;',
			'}',
			selector, ' ._hatenaBookmarkCounter_1{',
				'background-color: #74c2e4',
			'}',
			selector, ' ._hatenaBookmarkCounter_2{',
				'background-color: #5bb8df',
			'}',
			selector, ' ._hatenaBookmarkCounter_3{',
				'background-color: #39a9d9',
			'}',
		].join(''));
	};

	// Start
	counter();

})( window, document );
