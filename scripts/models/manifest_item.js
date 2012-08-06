
Readium.Models.ManifestItem = Backbone.Model.extend({
	
	parseMetaTags: function() {
		 var pageSize;
		// only need to go through this one time, so only parse it
		// if it is not already known
		if(typeof this.get("meta_width") !== "undefined") {
			return;
		}

		if(this.isSvg()) {
			pageSize = this.parseViewboxTag();
		}
		else if(!this.isImage()) {
			pageSize = this.parseViewportTag();
		}

		if(pageSize) {
			this.set({"meta_width": pageSize.width, "meta_height": pageSize.height});
		}
	},

	getContentDom: function() {
		var content = this.get('content');
		if(content) {
			var parser = new window.DOMParser();
			return parser.parseFromString(content, 'text/xml');
		}
	},

	// for fixed layout xhtml we need to parse the meta viewport
	// tag to determine the size of the pages. more info in the 
	// [fixed layout spec](http://idpf.org/epub/fxl/#dimensions-xhtml-svg)
	parseViewportTag: function() {
		var dom = this.getContentDom();
		if(!dom) {
			return;
		}
		var viewportTag = dom.getElementsByName("viewport")[0];
		if(!viewportTag) {
			return null;
		}
		// this is going to be ugly
		var str = viewportTag.getAttribute('content');
		str = str.replace(/\s/g, '');
		var valuePairs = str.split(',');
		var values = {};
		var pair;
		for(var i = 0; i < valuePairs.length; i++) {
			pair = valuePairs[i].split('=');
			if(pair.length === 2) {
				values[ pair[0] ] = pair[1];
			}
		}
		values['width'] = parseFloat(values['width'], 10);
		values['height'] = parseFloat(values['height'], 10);
		return values;
	},

	// for fixed layout svg we need to parse the viewbox on the svg
	// root tag to determine the size of the pages. more info in the 
	// [fixed layout spec](http://idpf.org/epub/fxl/#dimensions-xhtml-svg)
	parseViewboxTag: function() {

		// The value of the ‘viewBox’ attribute is a list of four numbers 
		// `<min-x>`, `<min-y>`, `<width>` and `<height>`, separated by 
		// whitespace and/or a comma
		var dom = this.getContentDom();
		if(!dom) {
			return;
		}
		var viewboxString = dom.documentElement.getAttribute("viewBox");
		// split on whitespace and/or comma
		var valuesArray = viewboxString.split(/,?\s+|,/);
		var values = {};
		values['width'] = parseFloat(valuesArray[2], 10);
		values['height'] = parseFloat(valuesArray[3], 10);
		return values;

	},

	resolvePath: function(path) {
		return this.collection.packageDocument.resolvePath(path)
	},

	resolveUri: function(path) {
		return this.collection.packageDocument.resolveUri(path)	
	},

	isSvg: function() {
		return this.get("media_type") === "image/svg+xml";
	},

	isImage: function() {
		var media_type = this.get("media_type");

		if(media_type && media_type.indexOf("image/") > -1) {
			// we want to treat svg as a special case, so they
			// are not images
			return media_type !== "image/svg+xml";
		}
		return false;
	},

	// Load this content from the filesystem
	loadContent: function() {
		var that = this;
		var path = this.resolvePath(this.get("href"));
		
		Readium.FileSystemApi(function(api) {
			api.readTextFile(path, function(result) {
				that.set( {content: result} );
			}, function() {
				console.log("Failed to load file: " + path);
			})
		});
	}
	
});

Readium.Models.SpineItem = Readium.Models.ManifestItem.extend({

	initialize: function() {
		if(this.isFixedLayout()) {
			this.on("change:content", this.parseMetaTags, this);
			this.loadContent();
		}
		
	},

	// this method creates the JSON representation of a manifest item
	// that is used to render out a page view.
	buildSectionJSON: function(manifest_item, spine_index) {
		if(!manifest_item) {
			return null;
		}
		var section = Object.create(null);
		section.width = this.get("meta_width") || 0;
		section.height = this.get("meta_height") || 0;
		section.uri = this.packageDocument.resolveUri(manifest_item.get('href'));
		section.page_class = this.getPageSpreadClass(manifest_item, spine_index);
		return section;
	},

	toJSON: function() {
		if(this.isFixedLayout()) {
			this.parseMetaTags();
		}
		var json = {};
		json.width = this.get("meta_width") || 0;
		json.height = this.get("meta_height") || 0;
		json.uri = this.resolveUri(this.get('href'));
		json.page_class = this.getPageSpreadClass();
		return json;
	},

	// when rendering fixed layout pages we need to determine whether the page
	// should be on the left or the right in two up mode, options are:
	// 	left_page: 		render on the left side
	//	right_page: 	render on the right side
	//	center_page: 	always center the page horizontally
	getPageSpreadClass: function() {
		var book = this.collection.packageDocument.get("book");
		var spine_index = this.get("spine_index");
		var pageSpreadProperty;

		if(book.get("apple_fixed")) {
			// the logic for apple fixed layout is a little different:
			/*
			if(!book.get("open_to_spread")) {
				// page spread is disabled for this book
				return	"center_page"
			}
			else if(spine_index === 0) {
				*/
			if(spine_index === 0) {
				// for ibooks, odd pages go on the right. This means
				// the first page (0th index) will always be on the right
				// without a left counterpart, so center it
				return "center_page";
			}
			else if (spine_index % 2 === 1 && 
				spine_index === this.collection.length) {

				// if the last spine item in the book would be on the left, then
				// it would have no left counterpart, so center it
				return "center_page";
			}
			else {
				// otherwise first page goes on the right, and then alternate
				// left - right - left - right etc
				return (spine_index % 2 === 0 ? "right_page" : "left_page");
			}
		}
		else {

			// If the page spread property has been set for this spine item, return 
			// the name of the appropriate spread class. 
			// Note: As there are only three valid values (left, right, center) for the page
			// spread property in ePub 3.0, if the property is set and 
			// it is not "left" or "right, "center" will always be assumed. 
			if (this.get("page_spread")) {

				pageSpreadProperty = this.get("page_spread");
				if (pageSpreadProperty === "left") {

					return "left_page";
				}
				else if (pageSpreadProperty === "right") {

					return "right_page";
				}
				else {

					return "center_page";
				}
			}
			// If the page spread property is not set, use a even/odd page index heuristic that depends on the 
			// page progression order:
			//   - Even-numbered pages on the right for rtl text
			//   - Odd-numbered pages on the left for ltr text
			else {

				// Check for right-to-left page progression direction
				if (this.get("page_prog_dir") === "rtl") {

					return (spine_index % 2 === 0 ? "right_page" : "left_page");
				}
				// Text is left-to-right
				else {

					return (spine_index % 2 === 0 ? "left_page" : "right_page");
				}
			}
		}
	},

	isFixedLayout: function() {

		// if it an svg or image then it is fixed layout
		if(this.isSvg() || this.isImage()) {
			return true;
		}

		// if there is a fixed_flow property, then it takes precedence
		if(typeof this.get("fixed_flow") !== 'undefined') {
			return this.get('fixed_flow');
		}

		// nothing special about this spine item, fall back to the books settings
		return this.collection.isBookFixedLayout();
	},

	// REFACTORING CANDIDATE: caching the the fixed layout views. I do not remember the reason that
	// we are doing this. Possible that it is not necessary...
	getPageView: function() {
		if(!this.view) {
			if(this.isImage()) {
				this.view = new Readium.Views.ImagePageView({model: this});
			}
			else {
				this.view = new Readium.Views.FixedPageView({model: this});	
			}
			
		}
		return this.view;
	},
    
    hasMediaOverlay: function() {
        return !!this.get("media_overlay") && !!this.getMediaOverlay();
    },
    
    getMediaOverlay: function() {
		return this.collection.getMediaOverlay(this.get("media_overlay"));
    }
});



Readium.Collections.ManifestItems = Backbone.Collection.extend({
	model: Readium.Models.ManifestItem,

	initialize: function(models, options) {
		this.packageDocument = options.packageDocument;   
    }
});

Readium.Collections.Spine = Backbone.Collection.extend({
	model: Readium.Models.SpineItem,

	initialize: function(models, options) {
		this.packageDocument = options.packageDocument;
	},

	isBookFixedLayout: function() {
		return this.packageDocument.get("book").isFixedLayout();
	},

	getMediaOverlay: function(id) {
        return this.packageDocument.getMediaOverlayItem(id);
    }
});