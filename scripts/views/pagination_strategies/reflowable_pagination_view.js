
Readium.Views.ReflowablePaginationView = Readium.Views.PaginationViewBase.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function(options) {
		// call the super ctor
		Readium.Views.PaginationViewBase.prototype.initialize.call(this, options);
		this.page_template = Handlebars.templates.reflowing_template;

		// make sure we have proper vendor prefixed props for when we need them
		this.stashModernizrPrefixedProps();

		// if this book does right to left pagination we need to set the
		// offset on the right
		if(this.model.epub.get("page_prog_dir") === "rtl") {
			this.offset_dir = "right";
		}
		else {
			this.offset_dir = "left";
		}

		this.pages.on("change:current_page", this.pageChangeHandler, this);
		this.model.on("change:toc_visible", this.windowSizeChangeHandler, this);
		this.model.on("repagination_event", this.windowSizeChangeHandler, this);
		this.model.on("change:current_theme", this.injectTheme, this);
		this.model.on("change:two_up", this.setUpMode, this);
		this.model.on("change:two_up", this.adjustIframeColumns, this);
		this.model.on("change:current_margin", this.marginCallback, this);

		this.mediaOverlayController.on("change:mo_playing", this.MOPlayingChangeHandler, this);
		this.mediaOverlayController.on("change:current_mo_frag", this.currentMOFragChangeHandler, this);
	},

	render: function(goToLastPage) {
		var that = this;
		var json = this.model.getCurrentSection().toJSON();

		// make everything invisible to prevent flicker
		this.setUpMode();
		this.$('#container').html( this.page_template(json) );
		
		this.$('#readium-flowing-content').on("load", function(e) {
			that.adjustIframeColumns();
			that.iframeLoadCallback(e);
			that.setFontSize();
			that.injectTheme();
			that.setNumPages();

			if(goToLastPage) {
				that.pages.goToLastPage();
			}
			else {
				that.pages.goToPage(1);
			}		
		});
		
		return [this.model.get("spine_position")];
	},

    findVisiblePageElements: function() {
        var elmsWithId = $(this.getBody()).find("[id]");
        var doc = $("#readium-flowing-content").contents()[0].documentElement;
        var doc_top = 0;
        var doc_left = 0;
        var doc_right = doc_left + $(doc).width();
        var doc_bottom = doc_top + $(doc).height();
        
        var visibleElms = elmsWithId.filter(function(idx) {
            var elm_top = $(this).offset().top;
            var elm_left = $(this).offset().left;
            var elm_right = elm_left + $(this).width();
            var elm_bottom = elm_top + $(this).height();
            
            var is_ok_x = elm_left >= doc_left && elm_right <= doc_right;
            var is_ok_y = elm_top >= doc_top && elm_bottom <= doc_bottom;
            
            return is_ok_x && is_ok_y;
        });

        return visibleElms;
        //this.model.set("visible_page_elements", visibleElms);
    },

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	// Description: Sometimes these views hang around in memory before
	//   the GC's get them. we need to remove all of the handlers
	//   that were registered on the model
	destruct: function() {
		
		this.pages.off("change:current_page", this.pageChangeHandler);
		this.model.off("change:toc_visible", this.windowSizeChangeHandler);
		this.model.off("repagination_event", this.windowSizeChangeHandler);
		this.model.off("change:current_theme", this.windowSizeChangeHandler);
		this.model.off("change:two_up", this.setUpMode);
		this.model.off("change:two_up", this.adjustIframeColumns);
		this.model.off("change:current_margin", this.marginCallback);

		this.mediaOverlayController.off("change:mo_playing", this.renderReflowableMoPlaying, this);
		this.mediaOverlayController.off("change:current_mo_frag", this.renderReflowableMoFragHighlight, this);

		// call the super destructor
		Readium.Views.PaginationViewBase.prototype.destruct.call(this);
	},

	// REFACTORING CANDIDATE: I think this is actually part of the public interface
	goToPage: function(page) {
		var offset = this.calcPageOffset(page).toString() + "px";
		$(this.getBody()).css(this.offset_dir, "-" + offset);
		this.showContent();

		console.log("going to page " + page);
        if (this.model.get("two_up") == false || 
            (this.model.get("two_up") && page % 2 === 1)) {
                // when we change the page, we should tell MO to update its position
                this.mediaOverlayController.pageChanged();
        }
	},

	// Description: navigate to a url hash fragment by calculating the page of
	//   the corresponding elem and setting the page number on `this.model`
	//   as precondition the hash fragment should identify an element in the
	//   section rendered by this view
	goToHashFragment: function() {

		// this method is triggered in response to 
		var fragment = this.model.get("hash_fragment");
		if(fragment) {
			var el = $("#" + fragment, this.getBody())[0];

			if(!el) {
				// couldn't find the el. just give up
				return;
			}

			// we get more precise results if we look at the first children
			while (el.children.length > 0) {
				el = el.children[0];
			}

			var page = this.getElemPageNumber(el);
			if (page > 0) {
				this.pages.goToPage(page);	
			}
		}
		// else false alarm no work to do
	},

	setFontSize: function() {
		var size = this.model.get("font_size") / 10;
		$(this.getBody()).css("font-size", size + "em");

		// the content size has changed so recalc the number of 
		// pages
		this.setNumPages();
	},

	// Description: we are using experimental styles so we need to 
	//   use modernizr to generate prefixes
	stashModernizrPrefixedProps: function() {
		var cssIfy = function(str) {
			return str.replace(/([A-Z])/g, function(str,m1){ 
				return '-' + m1.toLowerCase(); 
			}).replace(/^ms-/,'-ms-');
		};

		// ask modernizr for the vendor prefixed version
		this.columAxis =  Modernizr.prefixed('columnAxis') || 'columnAxis';
		this.columGap =  Modernizr.prefixed('columnGap') || 'columnGap';
		this.columWidth =  Modernizr.prefixed('columnWidth') || 'columnWidth';

		// we are interested in the css prefixed version
		this.cssColumAxis =  cssIfy(this.columAxis);
		this.cssColumGap =  cssIfy(this.columGap);
		this.cssColumWidth =  cssIfy(this.columWidth);
	},

	getBodyColumnCss: function() {
		var css = {};
		css[this.cssColumAxis] = "horizontal";
		css[this.cssColumGap] = this.gap_width.toString() + "px";
		css[this.cssColumWidth] = this.page_width.toString() + "px";
		css["padding"] = "0px";
		css["margin"] = "0px";
		css["position"] = "absolute";
		css["width"] = this.page_width.toString() + "px";
		css["height"] = this.frame_height.toString() + "px";
		return css;
	},

	adjustIframeColumns: function() {
		var prop_dir = this.offset_dir;
		var $frame = this.$('#readium-flowing-content');

		this.setFrameSize();
		this.frame_width = parseInt($frame.width(), 10);
		this.frame_height = parseInt($frame.height(), 10);
		this.gap_width = Math.floor(this.frame_width / 7);
		if(this.model.get("two_up")) {
			this.page_width = Math.floor((this.frame_width - this.gap_width) / 2);
		}
		else {
			this.page_width = this.frame_width;
		}
		

		// it is important for us to make sure there is no padding or
		// margin on the <html> elem, or it will mess with our column code
		$(this.getBody()).css( this.getBodyColumnCss() );

		this.setNumPages();
		var page = this.pages.get("current_page")[0] || 1;
		this.goToPage(page);
	},

	// This is now part of the public interface
	// Description: helper method to get the a reference to the documentElement
	// of the document in this strategy's iFrame.
	// TODO: this is a bad name for this function
	getBody: function() {
		return this.$('#readium-flowing-content').contents()[0].documentElement;
	},

	hideContent: function() {
		$("#flowing-wrapper").css("opacity", "0");
	},

	showContent: function() {
		$("#flowing-wrapper").css("opacity", "1");
	},

	calcPageOffset: function(page_num) {
		return (page_num - 1) * (this.page_width + this.gap_width);
	},

	// Rationale: on iOS frames are automatically expanded to fit the content dom
	// thus we cannot use relative size for the iframe and must set abs 
	// pixel size
	setFrameSize: function() {
		var width = this.getFrameWidth().toString() + "px";
		var height = this.getFrameHeight().toString() + "px";

		this.$('#readium-flowing-content').attr("width", width);
		this.$('#readium-flowing-content').attr("height", height);
		this.$('#readium-flowing-content').css("width", width);
		this.$('#readium-flowing-content').css("height", height);
	},

	getFrameWidth: function() {
		var width;
		var margin = this.model.get("current_margin");
		if (margin === 1) {
			this.model.get("two_up") ? (width = 0.95) : (width = 0.90);
		}
		else if (margin === 2) {
			this.model.get("two_up") ? (width = 0.89) : (width = 0.80);
		}
		else if (margin === 3) {
			this.model.get("two_up") ? (width = 0.83) : (width = 0.70);	
		}
		else if (margin === 4) {
			this.model.get("two_up") ? (width = 0.77) : (width = 0.60);	
		}
		else {
			this.model.get("two_up") ? (width = 0.70) : (width = 0.50);	
		}
		
		return Math.floor( $('#flowing-wrapper').width() * width );
	},

	getFrameHeight: function() {
		return $('#flowing-wrapper').height();
	},

	// Description: calculate the number of pages in the current section,
	//   based on section length : page size ratio
	calcNumPages: function() {

		var body, offset, width, num;
		
		// get a reference to the dom body
		body = this.getBody();

		// cache the current offset 
		offset = body.style[this.offset_dir];

		// set the offset to 0 so that all overflow is part of
		// the scroll width
		body.style[this.offset_dir] = "0px";

		// grab the scrollwidth => total content width
		width = this.getBody().scrollWidth;

		// reset the offset to its original value
		body.style[this.offset_dir] = offset;

		// perform calculation and return result...
		num = Math.floor( (width + this.gap_width) / (this.gap_width + this.page_width) );

		// in two up mode, always set to an even number of pages
		if( num % 2 === 0 && this.model.get("two_up")) {
			//num += 1;
		}
		return num;
	},

	getElemPageNumber: function(elem) {
		
		var rects, shift;
		rects = elem.getClientRects();
		if(!rects || rects.length < 1) {
			// if there were no rects the elem had display none
			return -1;
		}

		shift = rects[0][this.offset_dir];
		
		// calculate to the center of the elem (the edge will cause off by one errors)
		shift += Math.abs(rects[0].left - rects[0].right);
		
		// `clientRects` are relative to the top left corner of the frame, but
		// for right to left we actually need to measure relative to right edge
		// of the frame
		if(this.offset_dir === "right") {
			// the right edge is exactly `this.page_width` pixels from the right 
			// edge
			shift = this.page_width - shift;
		}
		// less the amount we already shifted to get to cp
		shift -= parseInt(this.getBody().style[this.offset_dir], 10); 
		var pg = Math.ceil( shift / (this.page_width + this.gap_width) );
		if (shift % (this.page_width + this.gap_width) == 0) {
		    pg++;
		}
		return pg;
	},

	// REFACTORING CANDIDATE: This might be part of the public interface
	getElemPageNumberById: function(elemId) {
        var doc = $("#readium-flowing-content").contents()[0].documentElement;
        var elem = $(doc).find("#" + elemId);
        if (elem.length == 0) {
            return -1;
        }
        else {
            return this.getElemPageNumber(elem[0]);
        }
    },

	pageChangeHandler: function() {
		var that = this;
		this.hideContent();
		setTimeout(function() {
			that.goToPage(that.pages.get("current_page")[0]);
		}, 150);
	},

	windowSizeChangeHandler: function() {
		this.adjustIframeColumns();
	},

	MOPlayingChangeHandler: function () {

		var moHelper = new Readium.Models.MediaOverlayViewHelper({epubController : this.model});

		moHelper.renderReflowableMoPlaying(
			this.model.get("current_theme"),
			this.mediaOverlayController.get("mo_playing"),
			this
			);
	},

	currentMOFragChangeHandler: function () {

		var moHelper = new Readium.Models.MediaOverlayViewHelper({epubController : this.model});

		moHelper.renderReflowableMoFragHighlight(
			this.model.get("current_theme"),
			this,
			this.mediaOverlayController.get("current_mo_frag")
			);
	},

	marginCallback: function() {
		this.adjustIframeColumns();
	},

	// Rationale: sadly this is just a reprint of what is already in the
	//   themes stylesheet. It isn't very DRY but the implementation is
	//   cleaner this way
	themes: {
		"default-theme": {
			"background-color": "white",
			"color": "black",
			"mo-color": "#777"
		},

		"vancouver-theme": {
			"background-color": "#DDD",
			"color": "#576b96",
			"mo-color": "#777"
		},

		"ballard-theme": {
			"background-color": "#576b96",
			"color": "#DDD",
			"mo-color": "#888"
		},

		"parchment-theme": {
			"background-color": "#f7f1cf",
			"color": "#774c27",
			"mo-color": "#eebb22"
		},

		"night-theme": {
			"background-color": "#141414",
			"color": "white",
			"mo-color": "#666"
		}
	},

	injectTheme: function() {
		var theme = this.model.get("current_theme");
		if(theme === "default") theme = "default-theme";
		$(this.getBody()).css({
			"color": this.themes[theme]["color"],
			"background-color": this.themes[theme]["background-color"]
		});
		
		// stop flicker due to application for alternate style sheets
		// just set content to be invisible
		$("#flowing-wrapper").css("visibility", "hidden");
		this.activateEPubStyle(this.getBody());

		// wait for new stylesheets to parse before setting back to visible
		setTimeout(function() {
			$("#flowing-wrapper").css("visibility", "visible");	
		}, 100);
	},

	setNumPages: function() {
		var num = this.calcNumPages();
		this.pages.set("num_pages", num);
	}
});