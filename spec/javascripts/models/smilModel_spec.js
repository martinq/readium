(function() {

  describe("Readium.Models.SmilModel", function() {
    var smilModel;
    smilModel = null;
    beforeEach(function() {
      var audioRender, dom, parser, textRender, xml_string;
      audioRender = function() {
        return console.log("Audio media: " + SmilModel.smilNodeToString(this));
      };
      textRender = function() {
        return console.log("Text media: " + SmilModel.smilNodeToString(this));
      };
      this.addMatchers({
        toBeAnInstanceOf: function(expected) {
          var actual;
          actual = this.actual;
          this.message = function() {
            return "Expected " + actual + " to be an instance of " + expected;
          };
          return actual instanceof expected;
        }
      });
      parser = new window.DOMParser;
      xml_string = jasmine.getFixtures().read("smil.smil");
      dom = parser.parseFromString(xml_string, "text/xml");
      smilModel = new Readium.Models.SmilModel();
      smilModel.setUrl("http://example.org/file.smil");
      smilModel.addRenderers({
        audio: audioRender,
        text: textRender
      });
      return smilModel.build($(dom).find("body")[0]);
    });
    describe("creates smil model, ", function() {
      return it("model is not null", function() {
        return expect(smilModel).not.toBeNull();
      });
    });
    describe("can find nodes, ", function() {
      it("finds a node by its id", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "mo1_par1");
        return expect(node.getAttribute("id")).toEqual("mo1_par1");
      });
      it("finds the first node of the given type", function() {
        var node;
        node = smilModel.findNodeByAttrValue("par", "", "");
        return expect(node.getAttribute("id")).toEqual("mo1_par1");
      });
      it("finds the first node of the given type with the given attribute", function() {
        var node;
        node = smilModel.findNodeByAttrValue("text", "src", "test.xhtml#frag");
        return expect(node.getAttribute("id")).toEqual("testtext1");
      });
      it("finds the first node containing an 'src' attribute", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "src", "");
        return expect(node.getAttribute("id")).toEqual("mo1_par1_text");
      });
      return it("finds the first node containing an 'epub:textref' attribute", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "epub:textref", "");
        return expect(node.getAttribute("id")).toEqual("testseq1");
      });
    });
    return describe("clock value parsing", function() {
      it("parses h:mm:ss.fraction", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud1");
        return expect(node.getAttribute("clipBegin")).toEqual("20071.396");
      });
      it("parses hhh:mm:ss", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud1");
        return expect(node.getAttribute("clipEnd")).toEqual("449976");
      });
      it("parses 0:00:ss", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud2");
        return expect(node.getAttribute("clipBegin")).toEqual("4");
      });
      it("parses 0:mm:ss.fraction", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud2");
        return expect(node.getAttribute("clipEnd")).toEqual("301.2");
      });
      it("parses 00:ss.fraction", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud3");
        return expect(node.getAttribute("clipBegin")).toEqual("56.78");
      });
      it("parses mm:ss", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud3");
        return expect(node.getAttribute("clipEnd")).toEqual("598");
      });
      it("parses min", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud4");
        return expect(node.getAttribute("clipBegin")).toEqual("780");
      });
      it("parses h", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud4");
        return expect(node.getAttribute("clipEnd")).toEqual("27900");
      });
      it("parses ms", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud5");
        return expect(node.getAttribute("clipBegin")).toEqual("2.345");
      });
      it("parses s", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud5");
        return expect(node.getAttribute("clipEnd")).toEqual("76.2");
      });
      it("parses plain syntax", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud6");
        return expect(node.getAttribute("clipEnd")).toEqual("12.345");
      });
      it("fills in a missing clipBegin value", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud7");
        return expect(node.getAttribute("clipBegin")).toEqual("0");
      });
      return it("fills in a missing clipEnd value", function() {
        var node;
        node = smilModel.findNodeByAttrValue("*", "id", "testaud7");
        return expect(node.getAttribute("clipEnd")).toEqual("9999999");
      });
    });
  });

  /*
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
  */


}).call(this);
