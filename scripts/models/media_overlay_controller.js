// Description: This model is responsible for coordinating actions for processing of media overlays 

// Properties of this model: 
//   mo_playing
//   

// REFACTORING CANDIDATE: As the media overlay progresses through the epub, the page numbers have to get updated, as well. There
//   will be an interaction here regarding which code will be responsible for loading the next spine item. 

Readium.Models.MediaOverlayController = Backbone.Model.extend({

	defaults: {
		"mo_playing" : false,
		"mo_processing": false, // flag that we are currently processing an MO event
		"mo_target": null  // target MO node
	},

	// ------------------------------------------------------------------------------------ //
	//  "PUBLIC" METHODS (THE API)                                                          //
	// ------------------------------------------------------------------------------------ //

	initialize: function () {

		this.epubController = this.get("epubController");
		this.pages = this.get("pages");
		this.currentView = this.get("view");

		// trigger media overlay position updates
        if (this.epubController.getCurrentSection().isFixedLayout()) {
            this.epubController.on("change:spine_position", this.updateMoPosition, this);
        }
        else {
            this.pages.on("change:num_pages", this.updateMoPosition, this);
        }
	},

	playMo: function() {
		var currentSection = this.epubController.getCurrentSection();
		var mo = currentSection.getMediaOverlay();
		if(mo) {
			this.set("mo_playing", mo);
			mo.on("change:current_text_document_url", this.handleMoTextDocumentUrl, this);
			mo.on("change:current_text_element_id", this.handleMoTextElementId, this);
			mo.on("change:is_document_done", this.handleMoDocumentDone, this);
            
            var target = this.get("mo_target");
            this.set("mo_target", null);
            
            if (currentSection.isFixedLayout()) {
                if (mo.get("has_started_playback")) {
                    // restore the highlight
                    this.handleMoTextDocumentUrl();
                    this.handleMoTextElementId();
                    mo.resume();
                }
                else {
                    mo.startPlayback(null);
                }
            }
            // Is a reflowable section
            else {
                var currMoPage = -1;
                var currMoId = mo.get("current_text_element_id");
                if (currMoId != null && currMoId != undefined && currMoId != "") {
                    currMoPage = this.currentView.getElemPageNumberById(currMoId);
                }
                
                // if media overlays is on our current page, then resume playback
                var currMoPageIsVisible = this.pages.get("current_page").indexOf(currMoPage) != -1;
                
                /*if ((this.epubController.get("two_up") == false && currMoPage == this.pages.get("current_page")) ||
                    (this.epubController.get("two_up") == true && this.pages.get("current_page").indexOf(currMoPage) != -1)) {
                */
                if (currMoPageIsVisible) {    
                    // restore the highlight
                    this.handleMoTextDocumentUrl();
                    this.handleMoTextElementId();
                    mo.resume();
                }
                else {
                    mo.startPlayback(target);
                }
            }
		}
		else {
			alert("Sorry, the current EPUB does not contain a media overlay for this content");
		}
	},

	pauseMo: function() {
		var mo = this.get("mo_playing");
		if(mo) {

			// mo.off() and mo.pause() seem like they should be in the same call
			mo.off();
			mo.pause();
			this.set("mo_playing", null); // REFACTORING CANDIDATE: Should this be set to "false"???
            this.set("hash_fragment", "");
            this.set("current_mo_frag", "");
		}
	},
    
    pageChanged: function() {
        this.updateMoPosition();
    },
    
	// ------------------------------------------------------------------------------------ //
	//  "PRIVATE" METHODS                                                                   //
	// ------------------------------------------------------------------------------------ //
    
    handleMoTextDocumentUrl: function() {
        var mo = this.get("mo_playing");
        this.set("mo_processing", true);
        this.epubController.goToHref(mo.get("current_text_document_url"));
        this.set("mo_processing", false);
    },
    
    handleMoTextElementId: function() {
        var mo = this.get("mo_playing");
        this.set("mo_processing", true);
        var frag = mo.get("current_text_element_id")
        this.set("hash_fragment", frag); // This attribute has another purpose in epub_controller. Not sure what to do with it atm
        this.set("current_mo_frag", frag);
        this.set("mo_processing", false);
    },
    
    handleMoDocumentDone: function() {
        var mo = this.get("mo_playing");
        if (mo != null && mo != undefined) {
            if (mo.get("is_document_done") == false) {
                return;
            }
        }
        console.log("MO document done");
        this.set("mo_processing", true);
        this.set("mo_target", null);
        this.pauseMo();
        // advance the spine position
        if (this.epubController.hasNextSection()) {
            this.epubController.goToNextSection();
            this.set("mo_processing", false);
            this.playMo();
        }
        this.set("mo_processing", false);
    },
    
    updateMoPosition: function() {

    	var currentSection;
    	var mo;
        // if we are processing an MO event, then don't update MO position:
        // chances are, it's a page change event that came from MO playback advancing
        if (this.get("mo_playing") != null && this.get("mo_processing") == true) {
            console.log("Ignoring internal page change");
            return;
        }
        mo_is_playing = this.get("mo_playing");
        
        this.pauseMo();
        console.log("updating MO position");

        currentSection = this.epubController.getCurrentSection();

        if (currentSection.isFixedLayout()) {
            mo = currentSection.getMediaOverlay();
            if (mo) {
                mo.set("has_started_playback", false);
            }
        }
        else {
            this.setMoTarget();
        }
        // if media overlays were playing, then resume playback
        if (mo_is_playing) {
            this.playMo();
        } 
    },
    
    // look at the current page and find the first visible page element that also appears in the document's MO
    setMoTarget: function() {

    	var pageElms;
    	var node;
        // using this instead of "mo_playing" because this function could be called when MO is not playing
        var currentSection = this.epubController.getCurrentSection();
        var mo = currentSection.getMediaOverlay();
        if (mo == null) {
            return;
        }
        
        if (!currentSection.isFixedLayout()) {
        	pageElms = this.currentView.findVisiblePageElements();
        	var doc_href = currentSection.get("href");
            
	        node = null;
	        for (var i = 0; i<pageElms.length; i++) {
	            var id = $(pageElms[i]).attr("id");
	            var src = doc_href + "#" + id;
	            node = mo.findNodeByTextSrc(src);
	            if (node) {
	                break;
	            }
	        }
        }
        else {
            // fixed layout doesn't need a target node: the top of the page is always the start of the document
        	node = null;
        }
        
        if (node) {
            console.log("Found MO target for " + src);
        }
        else {
            console.log("MO target not found");
        }
        this.set("mo_target", node);
    }
});