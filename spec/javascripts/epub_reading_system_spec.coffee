describe "navigator.epubReadingSystemObject", ->

	it "is defined on the window.navigator", ->
		expect(window.navigator.epubReadingSystem).toBeDefined()

	it "returns 'Readium' as the name", ->
		expect(window.navigator.epubReadingSystem.name).toEqual("Readium")

	it "has a verison property", ->
		expect(window.navigator.epubReadingSystem.version).toBeDefined()

	it "returns paginated as the layout style", ->
		expect(window.navigator.epubReadingSystem.layoutStyle).toEqual("paginated")

	describe 'hasFeature()', ->

		beforeEach ->
			@reader = window.navigator.epubReadingSystem

		it 'reports support for dom-manipulation', ->
			expect(@reader.hasFeature("dom-manipulation")).toEqual(true)
			expect(@reader.hasFeature("dom-manipulation", "1.0")).toEqual(true)

		it 'reports support for layout-changes', ->
			expect(@reader.hasFeature("layout-changes")).toEqual(true)
			expect(@reader.hasFeature("layout-changes", "1.0")).toEqual(true)

		it 'reports no support for touch-events', ->
			expect(@reader.hasFeature("touch-events")).toEqual(false)
			expect(@reader.hasFeature("touch-events", "1.0")).toEqual(false)

		it 'reports support for mouse-events', ->
			expect(@reader.hasFeature("mouse-events")).toEqual(true)
			expect(@reader.hasFeature("mouse-events", "1.0")).toEqual(true)

		it 'reports support for keyboard-events', ->
			expect(@reader.hasFeature("keyboard-events")).toEqual(true)
			expect(@reader.hasFeature("keyboard-events", "1.0")).toEqual(true)

		it 'reports support for spine-scripting', ->
			expect(@reader.hasFeature("spine-scripting")).toEqual(true)
			expect(@reader.hasFeature("spine-scripting", "1.0")).toEqual(true)

		it 'returns false if a version number that is not 1.0 is passed in', ->
			expect(@reader.hasFeature("dom-manipulation", "2.0")).toEqual(false)