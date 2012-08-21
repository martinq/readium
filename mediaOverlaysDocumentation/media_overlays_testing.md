# Testing Media Overlays Features

Note that the tests described here go beyond automated unit testing and should be done by a human.

## Moby Dick

[Download](http://code.google.com/p/epub-samples/downloads/detail?name=moby-dick-mo-20120214.epub)

This reflowable book has media overlays for the first two chapters.

 * Go to the beginning of the book and press 'play'. You should get an alert that this part of the book does not feature media overlays.
 * Go to chapter 1. Press 'play'. The text should be highlighted in gray/blue as the audio clips play.
 * Let playback continue. The pages should turn to match it.
 * During playback, turn the page. Playback should jump to the new page.
 * During playback, select a section from the table of contents. Playback should jump to the new section.
 * Pause playback and turn the page. Restart playback. It should resume at the top of the current page.
 * Pause playback in the middle of a paragraph. The highlighting should go away. 
 * Restart playback. The highlight should reappear and the audio should start where it left off.
 * Go to chapter 2. Then go back 1 page, to the end of chapter 1. Start playback. When that page is done playing, it should continue automatically to chapter 2.
 * Now go back to the last page of chapter 1. Start playback. It should start at the top of the page. Switch between playing chapters 1 and 2, and ensure that playback behavior is consistent.
 * Switch between single-page and two-page display (in Readium's settings dialog). Try these page-related tests again. 

## Valentin Haüy

TBD: Download link

This short reflowable book has media overlays throughout.

 * Go to the beginning of the book. Press 'play'. The text should be highlighted using Readium's default black/fade-out as the audio clips play.
 * Let playback continue. The pages should turn to match it.
 * During playback, turn the page. Playback should jump to the new page.
 * During playback, select a section from the table of contents. Playback should jump to the new section.
 * Pause playback and turn the page. Restart playback. It should resume at the top of the current page.
 * Switch between single-page and two-page display (in Readium's settings dialog). Try these page-related tests again.
 
## Little Match Girl   

TBD: Download link

This fixed layout book has a yellow background text highlight.

 * Go to the beginning of the book and press 'play'. The text should be highlighted in yellow.
 * Let playback continue. The pages should turn to match it.
 * During playback, turn the page. Playback should jump to the new page.
 * During playback, select a section from the table of contents. Playback should jump to the new section.
 * Pause playback and turn the page. Restart playback. It should resume at the top of the current page.
 * Pause playback in the middle of a paragraph. The highlight should disappear.
 * Restart playback. The highlight should reappear and the audio should start where it left off.
 * Play halfway into the first full page of the book. Then, without stopping playback, go to the next page. Then, go back to the previous page. Playback should start at the beginning of that page, not the halfway point.

## Manga 

TBD: Download link

This fixed layout book has no highlight style. It has a right-to-left page progression direction.

TBD: check above description against final version of book

 * Go to the beginning of the book ("こんにちは" or "Konichiwa") and press 'play'. The text should not be highlighted.
 * Let playback continue. The pages should turn from right to left to match it.
 * During playback, turn the page. Playback should jump to the new page.
 * During playback, select a section from the table of contents. Playback should jump to the new section.
 * Pause playback and turn the page. Restart playback. It should resume at the top of the current page.
 * Pause playback in the middle of a paragraph. The display should not change as there is no highlighting.
 * Restart playback. The display should not change but the audio should start where it left off.
 * Play halfway into the first full page of the book. Then, without stopping playback, go to the next page. Then, go back to the previous page. Playback should start at the beginning of that page, not the halfway point.

## Test content wishlist

This list is a work in progress.

 * FXL with only some pages containing media overlays
  
## Known behavior

 * If an element starts on one page and ends on another, it is treated as though it is on the first of those two pages. There is no reliable way of synchronizing audio at a sub-element level.
 * If the pages reflow during playback, for example when switching between single- and two-page display or toggling the table of contents, playback might reposition itself to the first element on the new page.
 * Books with sections that are intra-document links will have their playback start at the top of the page rather than at the top of the section

## Problems

### MO playback won't advance with manual page changes

 * Load Moby Dick
 * Set Readium to 2-page mode. 
 * Start at Chapter 1 and press play. 
 * During playback, go to the next page. Playback keeps resetting to the beginning of Chapter 1.

This is caused by an inaccurate return value of visiblePageElements. Is there a way to tell when all the page elements for a page are ready?

Note that we've seen this problem before, but it disappeared after a Chrome update last week. Of course just 1 day ago (Aug 14), there has just been another Chrome update, and it's a problem again.

Also note that in the example steps given above, if you advance two pages ahead instead of just one, playback repositions correctly. 

### MO playback resets to the start of the spine item

 * Load Moby Dick
 * Set Readium to 2-page mode. 
 * Open the TOC window
 * Go to chapter 2
 * Close the TOC window
 * Go back one page to the end of chapter 1
 * Press play
 * Open the TOC window again
 * See playback jump to the beginning of chapter 1

This is caused by the same problem as above.

### Audio issue when replaying

 * Load Moby Dick
 * Go to chapter 2
 * Press play
 * Before the first phrase finishes, go back a page
 * Before the first phrase on that page finishes, go forward a page
 * Notice how audio playback doesn't start with the first phrase on the page but rather resumes where it left off.
 
The audio clip is getting forced to reset to its starting position, but this either doesn't work or gets overridden by something else. 
