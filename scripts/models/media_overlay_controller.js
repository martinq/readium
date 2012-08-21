// Description: This model is responsible for coordinating actions for processing of media overlays 
// it does the following:
// - manages MO/spine interaction
// - listens to MO events
// - invokes MO play/pause/resume functions

// Properties of this model: 
//   active_mo
//   mo_text_id


Readium.Models.MediaOverlayController = Backbone.Model.extend({

	defaults: {
		"active_mo" : null, // the currently-playing media overlay; null if nothing is being played
        "mo_text_id": null // the current MO text fragment identifier
	},

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {

        // the current media overlay
        this.mo = null;
        
        // we track the current section to see when it changes
        this.currentSection = null; 
        
        // flags
        this.autoplayNextSpineItem = false;
        this.processingMoTextSrc = false;
        
        // media overlay playback starts here, if not null
        this.moTargetNode = null;
        
        // readium pages object
        this.pages = null;
        // readium view
        this.currentView = null;
        // readium epub controller, set as a constructor option
		this.epubController = this.get("epubController");
		
        // trigger media overlay position updates
        this.epubController.on("change:spine_position", this.handleSpineChanged, this);        
	},
    
    // each time there is a new pagination view created, it must call setPages
    setPages: function(pages) {
        if (this.pages != null) {
            this.pages.off();
        }
        this.pages = pages;
    },
    
    // each time there is a new pagination view created, it must call setView
    setView: function(view) {
        this.currentView = view;
    },
    
    // main playback function
	playMo: function() {
        if (this.mo == null) {
            alert("Sorry, there is no audio for this section.");
            return;
        }
        
        this.set("active_mo", this.mo);
        this.mo.on("change:current_text_src", this.handleMoTextSrc, this);
		this.mo.on("change:is_document_done", this.handleMoDocumentDone, this);
            
        var target = this.moTargetNode;
        this.moTargetNode = null;
            
        // FXL
        if (this.currentSection.isFixedLayout()) {
            if (this.mo.get("has_started_playback")) {
                this.resumeMo();
            }
            else {
                this.mo.startPlayback(null);
            }
        }
            
        // Reflowable
        else {
            var currMoPage = -1;
            var currMoId = this.get("mo_text_id");
            if (currMoId != null && currMoId != undefined && currMoId != "") {
                currMoPage = this.currentView.getElemPageNumberById(currMoId);
            }
                
            // if media overlays is on our current page, then resume playback
            var currMoPageIsVisible = this.pages.get("current_page").indexOf(currMoPage) != -1;
                
            if (currMoPageIsVisible) {   
                this.resumeMo();
            }
            else {
                this.mo.startPlayback(target);
            }
        }
	},

    // pause the media overlay playback
	pauseMo: function() {
        if (this.mo) {
			this.mo.off();
			this.mo.pause();
			this.set("active_mo", null);             
		}
	},
    
    // called by the reflowable view when the page changes
    reflowPageChanged: function() {
        // if MO is driving navigation, don't process the page change
        // it's probably something we triggered ourselves
        if (this.processingMoTextSrc || this.autoplayNextSpineItem ) {
            return;
        }
        
        var wasPlaying = this.get("active_mo") != null;
        if (wasPlaying) {
            this.pauseMo();
        }
        
        this.setMoTarget();
        
        // if media overlays were playing, then resume playback
        if (wasPlaying) {
            this.playMo();
        } 
    },
    
    // the pagination view calls this when it has reloaded the pages, for example when the spine item changes
    // we need to wait for this event because the pages shuffle a bit during reloading, 
    // which otherwise causes MO to start playback at the wrong point.
    pagesLoaded: function() {
        // just to be safe, ignore FXL
        if (this.currentSection.isFixedLayout()) {
            return;
        }
        if (this.autoplayNextSpineItem == true) {
            this.autoplayNextSpineItem = false;
            this.playMo();
        }
    },
    
	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" METHODS                                                                   //
	// ------------------------------------------------------------------------------------ //
    resumeMo: function() {
        this.set("mo_text_id", null); // clear it so that any listeners re-hear the event
        this.handleMoTextSrc();
        this.mo.resume();
    },
    
    handleMoTextSrc: function() {
        var textSrc = this.mo.get("current_text_src");
        if (textSrc == null) {
            this.set("mo_text_id", null);
            return;
        }
        this.processingMoTextSrc = true;
        this.epubController.goToHref(textSrc);
        var frag = "";
        if (textSrc.indexOf("#") != -1 && textSrc.indexOf("#") < textSrc.length -1) {
            frag = textSrc.substr(textSrc.indexOf("#")+1);
        }
        this.set("mo_text_id", frag);
        this.processingMoTextSrc = false;    
    },
    
    handleMoDocumentDone: function() {
        if (this.mo != null && this.mo != undefined) {
            if (this.mo.get("is_document_done") == false) {
                return;
            }
        }
        
        this.moTargetNode = null;
        this.pauseMo();
        // advance the spine position
        if (this.epubController.hasNextSection()) {
            this.autoplayNextSpineItem = true; 
            this.epubController.goToNextSection();
        }
    },
    
    handleSpineChanged: function() {
        this.set("mo_text_id", null);
        // sometimes the spine changed event fires but the spine didn't actually change
        if (this.epubController.getCurrentSection() == this.currentSection) {
            return;
        }
        // was something playing?
        if (this.get("active_mo") != null) {
            this.autoplayNextSpineItem = true; 
            this.pauseMo();
        }
        this.currentSection = this.epubController.getCurrentSection();
        this.mo = this.currentSection.getMediaOverlay();
        if (this.mo == null) {
            return;
        }
        
        this.mo.reset();
        if (this.currentSection.isFixedLayout() && this.autoplayNextSpineItem) {
            this.autoplayNextSpineItem = false;
            this.playMo();
        }
    },
    
    // look at the current page and find the first visible page element that also appears in the document's MO
    setMoTarget: function() {
    	var pageElms;
    	var node;
        // using this instead of "active_mo" because this function could be called when MO is not playing
        if (this.mo == null) {
            return;
        }
        
        if (this.currentSection.isFixedLayout()) {
            // fixed layout doesn't need a target node: the top of the page is always the start of the document
            this.moTargetNode = null;
        }
        else {
        	pageElms = this.currentView.findVisiblePageElements();
            var doc_href = this.currentSection.get("href");
            
	        var node = null;
            // TODO
            console.log("\nVisible");
	        for (var i = 0; i<pageElms.length; i++) {
	            var id = $(pageElms[i]).attr("id");
                console.log(id);
	            var src = doc_href + "#" + id;
	            node = this.mo.findNodeByTextSrc(src);
	            if (node) {
	                break;
	            }
	        }
            this.moTargetNode = node;
        }
    }
});