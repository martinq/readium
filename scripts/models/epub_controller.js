// Description: This model is a sort of "controller" for an ePUB, managing the interaction between calling code
//   and the saved epub. This model also exposes and persists properties that determine how an epub is displayed in 
//   Readium. Some of these properties are determined by the user, such as whether two pages are being displayed, the font size etc.
//   Other properties are determined by the user's interaction with the reader and the structure of the book. These include
//   the current spine item rendered in the viewer, as well the logic that governs changing the current spine item.  
//
// Rationale: This model is designed to expose a useful concept of an "epub" to the rest of Readium. This includes the contents
//   of the epub itself, as well as view properties (mentioned above) and the logic governing interaction with epub properties and 
//   contents. It is the intention for this model that it have little to no knowledge of how an epub is rendered. It is intended 
//   that Backbone attributes (getting/setting) and the backbone attribute event model (events fired on attribute changes) should 
//   the primary ways of interacting with this model.

// REFACTORING CANDIDATE: hash_fragment now has two responsibilities with media overlays included in the source: To act as a broadcast
//   attribute that triggers the view to go to a particular hash_fragment, as well as to do something for media overlays. It would
//   probably make sense for the first reason to have a function make a direct call through the pagination strategy selector. 

Readium.Models.EPUBController = Backbone.Model.extend({

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function() {

		// capture context for use in callback functions
		var that = this;

		this.epub = this.get("epub");

		// create a [`Paginator`](/docs/paginator.html) object used to initialize
		// pagination strategies for the spine items of this book
		this.paginator = new Readium.Models.PaginationStrategySelector({book: this});

		// Get the epub package document
		this.packageDocument = this.epub.getPackageDocument();

		// TODO: this might have to change: Should this model load the package document or epub_state??
		// load the `packageDocument` from the HTML5 filesystem asynchroniously
		this.packageDocument.fetch({

			// success callback is executed once the filesSystem contents have 
			// been read and parsed
			success: function() {

				// restore the position the reader left off at from cookie storage
				var pos = that.restorePosition();
				that.set("spine_position", pos);

				// tell the paginator to start rendering spine items from the 
				// freshly restored position
				var items = that.paginator.renderSpineItems(false);
				that.set("rendered_spine_items", items);
				
				// check if a TOC is specified in the `packageDocument`
				that.set("has_toc", ( !!that.packageDocument.getTocItem() ) );
			}
		});
		
		if (window.hasOwnProperty('BeneSpeak')) {
			this.ttsPlayer = new Readium.Models.TTSPlayer({controller: this});
		}

		// `change:spine_position` is triggered whenver the reader turns pages
		// accross a `spine_item` boundary. We need to cache thier new position
		// and 
		this.on("change:spine_position", this.savePosition, this);

		// If we encounter a new fixed layout section, we need to parse the 
		// `<meta name="viewport">` to determine the size of the iframe
		this.on("change:spine_position", this.setMetaSize, this);
	},

	// Description: Persists the attributes of this model
	// Arguments (
	//   attrs: doesn't appear to be used
	//   options: 
	//	)
	// Rationale: Each epub unpacked and saved to the filesystem in Readium has a unique
	//   key. "_epubViewProperties" is appended to this unique key to persist the read/write
	//   attributes separately from the read-only attributes of the epub.
	save: function(attrs, options) {
		// TODO: this should be done properly with a backbone sync
		var ops = {
			success: function() {}
		}
		_.extend(ops,options);
		var that = this;

		// Set attributes required to persist the epub-specific viewer properties
		this.set("updated_at", new Date());
		this.set("key", this.epub.get("key") + "_epubViewProperties");

		// Persist viewer properties
		Lawnchair(function() {
			this.save(that.toJSON(), ops.success);
		});
	},

	defaults: {
		"font_size": 10,
    	"two_up": false,
    	"full_screen": false,
    	"toolbar_visible": true,
    	"toc_visible": false,
    	"rendered_spine_items": [],
    	"current_theme": "default-theme",
    	"current_margin": 3,
    	"mo_processing": false,
    	"mo_target": null
  	},

  	// Description: serialize this models state to `JSON` so that it can
  	//   be persisted and restored
  	toJSON: function() {

  		// only save attrs that should be persisted:
  		return {
			"current_theme": this.get("current_theme"),
			"updated_at": this.get("updated_at"),
			"current_theme": this.get("current_theme"),
			"current_margin": this.get("current_margin"),
			"font_size": this.get("font_size"),
			"two_up": this.get("two_up"),
			"font_size": this.get("font_size"),
			"key": this.get("key")
		};
	},

	toggleFullScreen: function() {
		var fullScreen = this.get("full_screen");
		this.set({full_screen: !fullScreen});
	},

	increaseFont: function() {
		var size = this.get("font_size");
		this.set({font_size: size + 1})
	},

	decreaseFont: function() {
		var size = this.get("font_size");
		this.set({font_size: size - 1})
	},

	toggleToc: function() {
		var vis = this.get("toc_visible");
		this.set("toc_visible", !vis);
	},

	// Description: Obtains the href and hash (if it exists) to set as the current "position"
	//    of the epub. Any views and models listening to epub attributes are informed through
	//    the backbone event broadcast.
	// Arguments (
	//   href (URL): The url and hash fragment that indicates the position in the epub to set as
	//   the epub's current position.
	// )
	goToHref: function(href) {
		// URL's with hash fragments require special treatment, so
		// first thing is to split off the hash frag from the rest
		// of the url:
		var splitUrl = href.match(/([^#]*)(?:#(.*))?/);

		// handle the base url first:
		if(splitUrl[1]) {
			var spine_pos = this.packageDocument.spineIndexFromHref(splitUrl[1]);
			this.setSpinePos(spine_pos);
		}

		// now try to handle the fragment if there was one,
		if(splitUrl[2]) {
			// just set observable property to broadcast event
			// to anyone who cares
			this.set({hash_fragment: splitUrl[2]});
		}
	},

	getToc: function() {
		var item = this.packageDocument.getTocItem();
		if(!item) {
			return null;
		}
		else {
			var that = this;
			return Readium.Models.Toc.getToc(item, {
				file_path: that.resolvePath(item.get("href")),
				book: that
			});
		}
	},

	// Info: "Section" actually refers to a spine item
	getCurrentSection: function(offset) {
		if(!offset) {
			offset = 0;
		}
		var spine_pos = this.get("spine_position") + offset;
		return this.packageDocument.getSpineItem(spine_pos);
	},

	// REFACTORING CANDIDATE: this should be renamed to indicate it applies to the entire epub.
	//   This is only passing through this data to avoid breaking code in viewer.js. Eventually
	//   this should probably be removed. 
	isFixedLayout: function() {
		return this.epub.isFixedLayout();
	},

	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" HELPERS                                                                   //
	// ------------------------------------------------------------------------------------ //

	restorePosition: function() {
		var pos = Readium.Utils.getCookie(this.epub.get("key"));
		return parseInt(pos, 10) || 0;
	},

	savePosition: function() {
		Readium.Utils.setCookie(this.epub.get("key"), this.get("spine_position"), 365);
	},

	resolvePath: function(path) {
		return this.packageDocument.resolvePath(path);
	},

	hasNextSection: function() {
		return this.get("spine_position") < (this.packageDocument.spineLength() - 1);
	},

	hasPrevSection: function() {
		return this.get("spine_position") > 0;
	},
	
	goToNextSection: function() {

		if (this.hasNextSection() ) {
			var pos = this.get("spine_position");
			this.setSpinePos(pos + 1, false);
		}
	},
	
	goToPrevSection: function() {

		if (this.hasPrevSection() ) {
			var pos = this.get("spine_position");
			this.setSpinePos(pos - 1, true);	
		}
	},

	// Description: Sets the current spine position for the epub, checking if the spine
	//   item is already rendered.
	// Arguments (
	//	 pos (integer): The index of the spine element to set as the current spine position
	//	)
	setSpinePos: function(pos, goToLastPageOfSection) {

		// check for invalid spine position
		if (pos < 0 || pos >= this.packageDocument.spineLength()) {
			
			return;
		}

		var spineItems = this.get("rendered_spine_items");
		var spinePosIsRendered = spineItems.indexOf(pos) >=0 ? true : false;

		// REFACTORING CANDIDATE: There is a somewhat hidden dependency here between the paginator
		//   and the setting of the spine_position. The paginator re-renders based on the currently
		//   set spine_position on this model; the paginator has a reference to this model, which is 
		//   how it accesses the new spine_position. This would be clearer if the spine_position to set were passed 
		//   explicitly to the paginator. 
		this.set("spine_position", pos);

		// REFACTORING CANDIDATE: This event should only be triggered for fixed layout sections
		this.trigger("FXL_goToPage");

		// Render the new spine position if it is not already rendered. 
		if (!spinePosIsRendered) {

			var renderedItems = this.paginator.renderSpineItems(goToLastPageOfSection);
			this.set("rendered_spine_items", renderedItems);
		}
	},

	setMetaSize: function() {

		if(this.meta_section) {
			this.meta_section.off("change:meta_height", this.setMetaSize);
		}
		this.meta_section = this.getCurrentSection();
		if(this.meta_section.get("meta_height")) {
			this.set("meta_size", {
				width: this.meta_section.get("meta_width"),
				height: this.meta_section.get("meta_height")
			});
		}
		this.meta_section.on("change:meta_height", this.setMetaSize, this);
	}
});
