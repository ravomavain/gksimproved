
// This file is part of GKSimproved.

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
modules.images = {
	name: "images",
	pages: [
		{ path_name: "/m/images/(page)?", options: { buttons: '#imageslist', loading: '.pager_align', lastPage: '.pager_align' } }
	],
	loaded: false,
	loadModule: function(mOptions) {
		this.loaded = true;
		var module_name = this.name;
		var dbg = function(str) {
			_dbg(module_name, str);
		};

		dbg("[Init] Loading module");
		// Loading all functions used

		var endless_scrolling = opt.get(module_name, "endless_scrolling");
		var scrollOffset = 260;
		var backTopButtonOffset = 100;
		var loadingPage = false;
		var wentToPageBottom = false;
		var nextPage = (url.params && url.params.page ? Number(url.params.page) + 1 : 1);
		var jOnScroll = function() {
			if(!endless_scrolling || ignoreScrolling) {
				return;
			}

			if(document[$.browser.mozilla ? "documentElement" : "body"].scrollTop > backTopButtonOffset) {
				$("#backTopButton").show();
			}
			else {
				$("#backTopButton").hide();
			}

			if(maxPage === true || nextPage >= maxPage) {
				return;
			}

			if(document[$.browser.mozilla ? "documentElement" : "body"].scrollTop + window.innerHeight >= document.documentElement.scrollHeight) {
				dbg("[EndlessScrolling] Stop inserting, got to page bottom");
				wentToPageBottom = true;
			}

			dbg("[EndlessScrolling] Scrolled");
			if((document[$.browser.mozilla ? "documentElement" : "body"].scrollTop + window.innerHeight > document.documentElement.scrollHeight - scrollOffset) && !loadingPage) {
				dbg("[EndlessScrolling] Loading next page");
				loadingPage = true;

				var nextUrl = url;
				if(mOptions.path) {
					nextUrl.path = mOptions.path;
				}
				nextUrl.params = nextUrl.params ? nextUrl.params : {};
				nextUrl.params.page = nextPage;
				$(mOptions.loading).before('<p class="pager_align page_loading"><img src="' + chrome.extension.getURL("images/loading.gif") + '" /><br />Réticulation des méta-données de la page suivante</p>');
				grabPage(nextUrl, function(data) {
					imagesDiv = $(data).find("#imageslist div");
					dbg("[EndlessScrolling] Grab ended")
					if(imagesDiv && imagesDiv.length) {
						insertAjaxData(imagesDiv);
					}
					else {
						dbg("[EndlessScrolling] No more data");
						$(".page_loading").text("Plus rien en vue cap'tain !");
					}
				});
			}
		};

		var insertAjaxData = function(data) {
			if(wentToPageBottom) {
				dbg("[EndlessScrolling] Waiting for user confirmation in order to insert more");
				$(".page_loading").html('<a href="#" class="resume_endless_scrolling">Reprendre l\'endless scrolling</a>');
				$(".resume_endless_scrolling").click(function() {
					wentToPageBottom = false;
					insertAjaxData(data);
					return false;
				});
				return;
			}
			dbg("[EndlessScrolling] Got data - Inserting");
			$("#imageslist").append(data);
			nextPage++;
			loadingPage = false;
			$(".page_loading").remove();
		};

		var maxPage = false;
		var getMaxPage = function() {
			var pagesList = $(mOptions.lastPage);
			if(!pagesList.length) {
				maxPage = true;
			}
			else {
				maxPage = Number(pagesList.text().match(/(\d+) ?$/)[1]);
			}
			dbg("[max_page] " + maxPage);
		};

		dbg("[Init] Starting");
		// Execute functions

		var buttons = '<input id="endless_scrolling" type="checkbox" ' + (endless_scrolling ? 'checked="checked" ' : ' ') + '/> Endless scrolling';
		$(mOptions.buttons).before(buttons);

		if(mOptions.lastPage) {
			getMaxPage();
		}

		$("#endless_scrolling").change(function() {
			endless_scrolling = $(this).attr("checked") == "checked" ? true : false;
			dbg("[endless_scrolling] is " + endless_scrolling);
			opt.set(module_name, "endless_scrolling", endless_scrolling);
		});
		$(document).scroll(jOnScroll);

		dbg("[Init] Ready");
	}
};