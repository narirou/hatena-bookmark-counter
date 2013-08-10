// ==UserScript==
// @name           Google HatenaBookmark Counter
// @version        0.1
// @namespace
// @author         nariia
// @description    Add HatenaBookmark Counter on Google search results.
// @include        http://www.google.tld/*
// @include        https://www.google.tld/*
// @grant          GM_xmlhttpRequest
// @grant          GM_addStyle
// @run-at         document-end
// @license        MIT Lisense
// ==/UserScript==

(function( window, document ) {

	// Google HatenaBookmark Counter
	var counter = function( target ) {
		if( ! target ) return;

		var items = target.getElementsByTagName( "h3" );

		for( var i = 0, len = items.length; i < len; i++ ) {
			var item = items[i];
			var link = item.childNodes[0];
			var url = "http://b.hatena.ne.jp/entry/json/?url=" + encodeURI( link.href );

			// remove tracking (ついでに)
			link.removeAttribute( "onmousedown" );

			// http request
			(function( item, url ) {
				GM_xmlhttpRequest( {
					method: "GET",
					url: url,
					onload: function( response ) {
						var data = response.responseText;
						if( data === "null" ) {
							return;
						}

						var json = JSON.parse( data );

						var count = json.count;
						if( count === "0" ) {
							return;
						}
						addHtml( item, json.entry_url, count );
					}
				});
			})( item, url );
		}
	};

	// Start
	counter( document.getElementById( "rso" ) );

	// Event Listener
	// Autopagerize Event
	document.addEventListener( "AutoPagerize_DOMNodeInserted", function( event ) {
		counter( event.target );
	}, false );

	// Google Ajax Event
	document.addEventListener( "DOMNodeInserted", function( event ){
		var target = event.target;
		if( target.id === "ires" ) {
			setTimeout( function() {
				counter( target.childNodes[0] );
			}, 0 );
		}
	}, false );

	// HTML
	var addHtml = function( item, url, count ) {
		var icon = document.createElement("a");
		icon.title = "Hatena Bookmark";
		icon.href = url;
		icon.className = counterClassName( count );
		icon.innerHTML = count + " <span>users</span>";
		item.appendChild( icon );
	};

	// ClassName
	var counterClassName = function( count ) {
		var baseClassName = "_hatenaBookmarkCounter";
		var n = parseInt( count );

		switch( false ) {
			case !(n < 4):
				return baseClassName + "_0";
			case !(n < 10):
				return baseClassName + "_1";
			case !(n < 50):
				return baseClassName + "_2";
			default:
				return baseClassName + "_3";
		}
	};

	// CSS
	var addCss = (function() {
		var css = "";
		css += "#res .r{";
		css +=     "overflow-x: visible !important;";
		css +=     "display: inline !important;";
		css += "}";
		css += "#res .r a[class^='_hatenaBookmarkCounter']{";
		css +=     "color: #fff !important;";
		css +=     "font-size: 11px;";
		css +=     "font-weight: bold;";
		css +=     "padding: 2px 7px;";
		css +=     "position: relative;";
		css +=     "top: -2px;";
		css +=     "left: 7px;";
		css +=     "text-decoration: none;";
		css +=     "border-radius: 2px;";
		css += "}";
		css += "#res .r a[class^='_hatenaBookmarkCounter'] span{";
		css +=     "font-weight: normal;";
		css += "}";
		css += "#res .r a[class^='_hatenaBookmarkCounter']:hover{";
		css +=     "background-color: #f3cb7e;";
		css +=     "color: #c87209 !important;";
		css += "}";
		css += "#res .r ._hatenaBookmarkCounter_0{";
		css +=     "background-color: #93cfea;";
		css += "}";
		css += "#res .r ._hatenaBookmarkCounter_1{";
		css +=     "background-color: #74c2e4";
		css += "}";
		css += "#res .r ._hatenaBookmarkCounter_2{";
		css +=     "background-color: #5bb8df";
		css += "}";
		css += "#res .r ._hatenaBookmarkCounter_3{";
		css +=     "background-color: #39a9d9";
		css += "}";
		GM_addStyle( css );
	})();

})( window, document );
