Readium.Models.TTSPlayer = Backbone.Model.extend({
    
    defaults: {
        "tts_playing": false,
        "curentElement": null,
        "bufferSize": 5000,
    },
    
    initialize: function() {
        this.controller = this.get('controller');
        this.bufferSize = this.get('bufferSize');
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
        console.log("Stopping TTS.");
        this.set('tts_playing', false);
        chrome.tts.stop();
    },
    
    speakNextElement: function() {
        if (this.get('tts_playing')) {
            var self = this;
            self.seekToNextElement();
            var el = self.get('currentElement');
            if (el != null) {
                var data = BeneSpeak.generateSpeechData(el);
                chrome.tts.speak(data.utterance,
                    {
                        'rate' : 1.25,
                        'desiredEventTypes' : ['word'],
                        'onEvent' : function(event) { data.handleTtsEvent(event, function() {self.speakNextElement();});}
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
            el = bodyEl;
        }
        
        console.log("Starting from ...");
        self._logPath(el);
        do {
            if (!self._hasTextContent(el) && el.children.length > 0) {
                console.log("Found a child");
                el = el.children[0];
            } else if (el.nextElementSibling != null) {
                console.log("Found a sibling");
                el = el.nextElementSibling;
            } else {
                while (el.tagName.toLowerCase() != 'body') {
                    console.log("Climbing up.")
                    el = el.parentElement;
                    if (el.nextElementSibling != null) {
                        console.log("... and forward")
                        el = el.nextElementSibling;
                        break;
                    }
                }
                if (el.tagName.toLowerCase() == 'body') {
                    el = null;
                }
            }
            if (el == null) {
                break;
            }
            self._logPath(el);
        } while (! self._hasTextContent(el));
        
        self.set('currentElement', el);
    },
    
    _hasTextContent: function(el) {
        for (var i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType == Node.TEXT_NODE && el.childNodes[i].textContent.trim().length > 0) {
                return true;
            }
        }
        return false;
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
