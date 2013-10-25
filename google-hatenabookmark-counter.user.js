// ==UserScript==
// @name           Google HatenaBookmark Counter
// @version        0.1
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
	var rso = document.getElementById( 'rso' ),
		res = document.getElementById( 'res' );

	// Counter
	var counter = function( target ) {
		if( ! target ) return;

		var items = target.getElementsByTagName( 'h3' );

		for( var i = 0, len = items.length; i < len; i++ ) {
			var item = items[i];
			var link = item.childNodes[0];
			var url = 'http://b.hatena.ne.jp/entry/json/?url=' + encodeURI( link.href );

			// remove tracking (ついでに)
			link.removeAttribute( 'onmousedown' );

			// http request
			(function( item, url ) {
				GM_xmlhttpRequest( {
					method: 'GET',
					url: url,
					onload: function( response ) {
						var data = response.responseText;
						if( data === 'null' ) {
							return;
						}

						var json = JSON.parse( data );

						var count = json.count;
						if( count === '0' ) {
							return;
						}
						addHtml( item, json.entry_url, count );
					}
				});
			})( item, url );
		}
	};

	// Start
	counter( rso );

	// Insert Event
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	var observer = new MutationObserver( function( mutations ){
		mutations.forEach( function( mutation ) {
			var nodes = mutation.addedNodes;
			for( var i = 0, len = nodes.length; i < len; i++ ) {
				if( nodes[i].id === 'ires' || nodes[i].id === 'rso' ) {
					counter( nodes[i] );
				}
			}
		});
	});

	observer.observe( res, { childList: true, subtree: true } );

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
		var n = parseInt( count, 10 );
		switch( false ) {
			case !(n < 4):
				return baseClassName + '_0';
			case !(n < 10):
				return baseClassName + '_1';
			case !(n < 50):
				return baseClassName + '_2';
			default:
				return baseClassName + '_3';
		}
	};

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

})( window, document );
