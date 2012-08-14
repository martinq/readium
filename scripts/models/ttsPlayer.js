Readium.Models.TTSPlayer = Backbone.Model.extend({
    
    defaults: {
        "always_speak": ['ol', 'ul', 'dl', 'table'],
        "tts_playing": false,
        "curentElement": null,
        "bufferSize": 5000,
    },
    
    initialize: function() {
        this.controller = this.get('controller');
        this.bufferSize = this.get('bufferSize');
		this.controller.on("change:spine_position", this.stop, this);
		this.controller.on("repagination_event", this._windowSizeChangeHandler, this);
		
        window.onunload = function() { chrome.tts.stop(); };
    },
    
    play: function() {
        var self = this;
        self.set('tts_playing', true);
        self.speakNextElement();
    },
    
    resume: function() {
        this.set('tts_playing', true);
        return;
    },
    
    pause: function() {
        console.log("Pausing TTS.");
        this.set('tts_playing', false);
        self.data = null;
        chrome.tts.stop();
    },
    
    stop: function() {
        console.log("Stopping TTS.");
        this.set('tts_playing', false);
        this.set('currentElement', null);
        self.data = null;
        chrome.tts.stop();
    },
    
    speakNextElement: function() {
        if (this.get('tts_playing')) {
            var self = this;
            self.seekToNextElement();
            var el = self.get('currentElement');
            if (el != null) {
                self.data = BeneSpeak.generateSpeechData(el);
                chrome.tts.speak(self.data.utterance,
                    {
                        'rate' : 1.25,
                        'desiredEventTypes' : ['word'],
                        'onEvent' : self._createCallbackHandler(self),
                    });
            } else {
                self.pause();
            }
        }
    },
    
    seekToNextElement: function() {
        var self = this;
        var nextEl = null;
        var el = self.get('currentElement');
        var bodyEl = self.controller.paginator.v.getBody().ownerDocument.body;
        if (el == null) {
            el = bodyEl.children[0];
        }
        
        console.log("Starting from ...");
        self._logPath(el);
        do {
            if (!self._shouldPlay(el) && el.children.length > 0) {
                console.log("Found a child");
                el = el.children[0];
            } else if (el.nextElementSibling != null) {
                console.log("Found a sibling");
                el = el.nextElementSibling;
            } else {
                while (el.parentElement != null) {
                    console.log("Climbing up.")
                    el = el.parentElement;
                    
                    if (el.nextElementSibling != null) {
                        console.log("... and forward")
                        el = el.nextElementSibling;
                        break;
                    }
                    
                    if (el.tagName.toLowerCase() == 'body') {
                        console.log('Climbed out to body; terminate.');
                        el = null;
                        break;
                    }                     
                }
            }
            if (el == null) {
                break;
            }
            self._logPath(el);
        } while (! self._shouldPlay(el));
        
        self.set('currentElement', el);
    },
    
    _shouldPlay: function(el) {
        if (this.get('always_speak').indexOf(el.tagName.toLowerCase()) != -1) {
            console.log(el.tagName + ' must always be spoken');
            return true;
        } else if (el.textContent.trim().length == 0) {
            console.log(el.tagName + ' is empty.');
            return false;
        } else if (el.textContent.trim().length < this.get('bufferSize')) {
            console.log(el.tagName + ' content is smaller than buffer size');
            return true;
        } else if (el.children.length > 1) {
            console.log(el.tagName + ' content is larger than buffer size and has more than one child');
            return false;
        } else {
            console.log(el.tagName + ' content is larger than buffer size but cannot be broken down further');
            return true;
        }
    },
    
    _createCallbackHandler: function(self) {
        var data = self.data;
        return function(event) {
            
            if (event.type == 'word') {
                
                data.xOffset = data._getOffset(data.document.documentElement.style.left);
                data.yOffset = data._getOffset(data.document.documentElement.style.top);
                
                var wordIndex = data.wordAt(event.charIndex);
                if (wordIndex >= 0) {
                    data.highlightWord(wordIndex);
                    self._updatePagePosition(data);
                }
                
                var sentenceIndex = data.sentenceAt(event.charIndex);
                if (sentenceIndex >= 0) {
                    data.highlightSentence(sentenceIndex);
                }
                
            } else if (event.type == 'interrupted' || event.type == 'end') {
                data.clearWordHighlight();
                data.clearSentenceHighlight();
                self.speakNextElement();
            }
        };        
    },
    
    _updatePagePosition: function(data) {
        var v = this.controller.paginator.v;
        if (v.getElemPageNumber != null) {
            if (data._wordRects.length > 0) {
                var pageNum = v.getElemPageNumber(data._wordRects[0]);
                if (!v.pages.isPageVisible(pageNum)) {
                    v.pages.goToPage(pageNum);
                }
            }
        }
    },
    
    _windowSizeChangeHandler: function() {
        if (this.get('tts_playing')) {
            var tmp = this.data._highlightedSentence;
            this.data.clearSentenceHighlight();
            this.data.highlightSentence(tmp);
        }
    },
    
    _logPath: function(el) {
        var n = el;
        var s = "";
        while (n != null) {
            s = n.tagName + "/" + s;
            n = n.parentElement;
        }
        console.log(s);
    }
});
