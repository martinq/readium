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
