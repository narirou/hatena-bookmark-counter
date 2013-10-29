// ==UserScript==
// @name           Google HatenaBookmark Counter
// @version        0.2.2
// @namespace      https://github.com/narirou/
// @author         narirou
// @description    Add HatenaBookmark Counter on Google search results.
// @include        http://www.google.tld/*
// @include        https://www.google.tld/*
// @grant          GM_xmlhttpRequest
// @grant          GM_addStyle
// @run-at         document-end
// @license        MIT Lisense
// ==/UserScript==

(function( window, document ) {

	// Target Element
	var main = document.getElementById( 'main' );

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
					if( node && (node.id === 'ires' || node.id === 'rso') ) {
						counter( node );
					}
				}
			});
		});
		observer.observe( main, { childList: true, subtree: true } );
	}

	// CSS
	GM_addStyle([
		'#res .r{',
			'overflow-x: visible !important;',
			'display: inline !important;',
		'}',
		'#res .r a[class^="_hatenaBookmarkCounter"]{',
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
		'#res .r a[class^="_hatenaBookmarkCounter"] span{',
			'font-weight: normal;',
		'}',
		'#res .r a[class^="_hatenaBookmarkCounter"]:hover{',
			'background-color: #f3cb7e;',
			'color: #c87209 !important;',
		'}',
		'#res .r ._hatenaBookmarkCounter_0{',
			'background-color: #93cfea;',
		'}',
		'#res .r ._hatenaBookmarkCounter_1{',
			'background-color: #74c2e4',
		'}',
		'#res .r ._hatenaBookmarkCounter_2{',
			'background-color: #5bb8df',
		'}',
		'#res .r ._hatenaBookmarkCounter_3{',
			'background-color: #39a9d9',
		'}',
	].join(''));

	// Start
	counter( main );

})( window, document );
