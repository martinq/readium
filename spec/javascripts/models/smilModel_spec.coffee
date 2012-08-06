describe "Readium.Models.SmilModel", ->
    smilModel = null
    
    beforeEach ->
        # create dummy renderers
        audioRender = ->
            console.log "Audio media: " + SmilModel.smilNodeToString(this)
        textRender = ->
            console.log "Text media: " + SmilModel.smilNodeToString(this)
            
        @addMatchers toBeAnInstanceOf: (expected) ->
            actual = @actual
            @message = ->
                "Expected " + actual + " to be an instance of " + expected
            actual instanceof expected
            
        parser = new window.DOMParser
        xml_string = jasmine.getFixtures().read("smil.smil")
        dom = parser.parseFromString(xml_string, "text/xml")
        smilModel = new Readium.Models.SmilModel()
        smilModel.setUrl("http://example.org/file.smil");
        smilModel.addRenderers
            audio: audioRender
            text: textRender
        smilModel.build $(dom).find("body")[0]
    
    describe "creates smil model, ", ->
        it "model is not null", ->
            expect(smilModel).not.toBeNull()
    
    describe "can find nodes, ", ->
        it "finds a node by its id", ->
            node = smilModel.findNodeByAttrValue("*", "id", "mo1_par1")
            expect(node.getAttribute("id")).toEqual "mo1_par1"
        
        it "finds the first node of the given type", ->
            node = smilModel.findNodeByAttrValue("par", "", "")
            expect(node.getAttribute("id")).toEqual "mo1_par1"
        
        it "finds the first node of the given type with the given attribute", ->
            node = smilModel.findNodeByAttrValue("text", "src", "test.xhtml#frag")
            expect(node.getAttribute("id")).toEqual "testtext1"
        
        it "finds the first node containing an 'src' attribute", ->
            node = smilModel.findNodeByAttrValue("*", "src", "");
            expect(node.getAttribute("id")).toEqual "mo1_par1_text"
        
        it "finds the first node containing an 'epub:textref' attribute", ->
            node = smilModel.findNodeByAttrValue("*", "epub:textref", "");
            expect(node.getAttribute("id")).toEqual "testseq1"
        
    
    describe "clock value parsing", ->
        it "parses h:mm:ss.fraction", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud1")
            expect(node.getAttribute("clipBegin")).toEqual "20071.396"
        
        it "parses hhh:mm:ss", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud1")
            expect(node.getAttribute("clipEnd")).toEqual "449976"
        
        it "parses 0:00:ss", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud2")
            expect(node.getAttribute("clipBegin")).toEqual "4"
        
        it "parses 0:mm:ss.fraction", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud2")
            expect(node.getAttribute("clipEnd")).toEqual "301.2"
        
        it "parses 00:ss.fraction", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud3")
            expect(node.getAttribute("clipBegin")).toEqual "56.78"
        
        it "parses mm:ss", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud3")
            expect(node.getAttribute("clipEnd")).toEqual "598"
    
        it "parses min", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud4")
            expect(node.getAttribute("clipBegin")).toEqual "780"
        
        it "parses h", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud4")
            expect(node.getAttribute("clipEnd")).toEqual "27900"
        
        it "parses ms", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud5")
            expect(node.getAttribute("clipBegin")).toEqual "2.345"
        
        it "parses s", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud5")
            expect(node.getAttribute("clipEnd")).toEqual "76.2"
        
        it "parses plain syntax", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud6")
            expect(node.getAttribute("clipEnd")).toEqual "12.345"
        
        it "fills in a missing clipBegin value", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud7")
            expect(node.getAttribute("clipBegin")).toEqual "0"
        
        it "fills in a missing clipEnd value", ->
            node = smilModel.findNodeByAttrValue("*", "id", "testaud7")
            expect(node.getAttribute("clipEnd")).toEqual "9999999"
###
# after skip/escape gets merged from media-overlays-js project, uncomment these tests    
    describe "skippability", ->
        it "skips nodes of type = epub:pagebreak", ->
            smilModel.addSkipType "pagebreak"
            node = smilModel.findNodeByAttrValue("*", "id", "testpar5")
            expect(smilModel.testMustSkip(node)).toEqual true
        
        it "skips children whose parent has type = epub:pagebreak", ->
            smilModel.addSkipType "pagebreak"
            node = smilModel.findNodeByAttrValue("*", "id", "testtext5")
            expect(smilModel.testMustSkip(node)).toEqual true
        
        it "removes skip types", ->
            smilModel.addSkipType "pagebreak"
            node = smilModel.findNodeByAttrValue("*", "id", "testpar5")
            smilModel.removeSkipType "pagebreak"
            expect(smilModel.testMustSkip(node)).toEqual false
        
    describe "escapability", ->
        it "can escape nodes of type = epub:sidebar", ->
            smilModel.addEscapeType "sidebar"
            node = smilModel.findNodeByAttrValue("*", "id", "testseq1")
            expect(smilModel.testCanEscape(node)).toEqual true
        
        it "can escape children whose parent has type = epub:sidebar", ->
            smilModel.addEscapeType "sidebar"
            node = smilModel.findNodeByAttrValue("*", "id", "testaud5")
            expect(smilModel.testCanEscape(node)).toEqual true
        
        it "removes escape types", ->
            smilModel.addEscapeType "sidebar"
            node = smilModel.findNodeByAttrValue("*", "id", "testseq1")
            smilModel.removeSkipType "sidebar"
            expect(smilModel.testMustSkip(node)).toEqual false
###