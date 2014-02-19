// ==UserScript==
// @name           Hatena Bookmark Counter - Yahoo! JAPAN
// @version        0.0.1
// @namespace      https://github.com/narirou/
// @author         narirou
// @description    Adding HatenaBookmark Counter on Yahoo! JAPAN search results.
// @include        http://search.yahoo.co.jp/*
// @include        https://search.yahoo.co.jp/*
// @grant          GM_xmlhttpRequest
// @grant          GM_addStyle
// @run-at         document-end
// @license        MIT Lisense
// ==/UserScript==

(function( window, document ) {

	// Target Element
	var main = document.getElementById( 'mIn' );

	// Counter
	var counter = function( target ) {
		if( ! target ) return;

		var items = target.getElementsByTagName( 'h3' );

		for( var i = 0, len = items.length; i < len; i++ ) {
			var item = items[i]
			  , link = item.childNodes[0]
			  , url = 'http://b.hatena.ne.jp/entry/json/?url=' + encodeURI( link.href );

			// remove tracking
			link.removeAttribute( 'onmousedown' );

			// add HatenaCounter
			requestJson( item, url, addHtml );
		}
	};

	var requestJson = function( item, url, callback ) {
		GM_xmlhttpRequest( {
			method: 'GET',
			url: url,
			onload: function( response ) {
				var data = response.responseText;
				if( data === 'null' ) return;

				var json = JSON.parse( data );

				var count = parseInt( json.count, 10 );
				if( count === 0 ) return;

				if( callback ) {
					callback( item, json.entry_url, count );
				}
			}
		});
	};

	// HTML
	var addHtml = function( item, url, count ) {
		var icon = document.createElement( 'a' );
		icon.title = 'Hatena Bookmark';
		icon.href = url;
		icon.className = counterClassName( count );
		icon.innerHTML = count + ' <span>users</span>';
		item.appendChild( icon );
	};

	// ClassName
	var counterClassName = function( count ) {
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
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
	if( MutationObserver ) {
		var observer = new MutationObserver( function( records ) {
			records.forEach( function( record ) {
				var nodes = record.addedNodes;
				for( var i = 0, len = nodes.length; i < len; i++ ) {
					var node = nodes[i];

					if( node && node.id === 'WS2m' ) {
						counter( node );
					}
				}
			});
		});
		observer.observe( main, { childList: true, subtree: true } );
	}

	// CSS
	GM_addStyle([
		'#WS2m .w{',
			'word-break: normal;',
		'}',
		'#WS2m .w a[class^="_hatenaBookmarkCounter"]{',
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
		'#WS2m .w a[class^="_hatenaBookmarkCounter"] span{',
			'font-weight: normal;',
		'}',
		'#WS2m .w a[class^="_hatenaBookmarkCounter"]:hover{',
			'background-color: #f3cb7e;',
			'color: #c87209 !important;',
		'}',
		'#WS2m .w ._hatenaBookmarkCounter_0{',
			'background-color: #93cfea;',
		'}',
		'#WS2m .w ._hatenaBookmarkCounter_1{',
			'background-color: #74c2e4',
		'}',
		'#WS2m .w ._hatenaBookmarkCounter_2{',
			'background-color: #5bb8df',
		'}',
		'#WS2m .w ._hatenaBookmarkCounter_3{',
			'background-color: #39a9d9',
		'}',
	].join(''));

	// Start
	counter( main );

})( window, document );
