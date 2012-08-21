# Media Overlays API
From `mediaOverlay.js`

## Functions

### `setUrl(url)`
Set the URL of the SMIL file that is to be parsed for this Media Overlay.

### `fetch(options)`
Retrieve the data from the URL specified by `setUrl` (but don't start playback yet).

### `findNodeByTextSrc(src)`
`src`: a text document URL, optionally including a fragment identifier

Returns the node object containing that src, or `null`.

### `startPlayback(node)`
`node`: a SMIL node to start playback from

Used for initializing SMIL playback. To start at a specific point, use `findNodeByTextSrc` to find the node, and then pass it to this function.  If `node` is `null`, then playback will start at the beginning of the file.

### `pause()`
Pause the audio

### `resume()`
Resume the audio

### `setVolume(level)`
`level`: a floating-point number

Set the audio volume. 0 is mute, and 1.0 is max volume.

### `reset()`
Reset all flags as though the media overlay has not yet started playing.

## Observable Properties 

###`current_text_src`
`string`

Text src of the active SMIL text node, including, if relevant, the fragment identifier.

### `has_started_playback`
`boolean`

Indicates whether the document has started playing or not. Note that if the document has been started and then paused, this is `true`, whereas if it hasn't been started, or if it's been started and reset, this is `false`.

### `is_document_done`
`boolean`

Indicates that playback of the file has completed.

### `is_playing`
`boolean`

Indicates whether audio is playing or not.

### `is_ready`
`boolean`

Indicates that the file is loaded and ready to play.

# Future API functions

These are expected to become available in a future revision.

## Functions

### `escape()` 
Escape the current structure. If the current structure's `epub:type` value is not in the list of types which may be escaped, then this command is ignored and normal playback continues.

### `addSkipType(type)`
Add an `epub:type` value to the list of items which must be skipped by the player.

### `removeSkipType(type)`
Remove an `epub:type` value from the list of items which must be skipped by the player.

### `addEscapeType(type)`
Add an `epub:type` value to the list of items which may be escaped by the user.

### `removeEscapeType(type)`
Remove an `epub:type` value from the list of items which may be escaped by the user.

### `setRate(rate)`
`rate`: A floating-point value

Set the audio playback rate.  0.5 is considered slow, 1.0 is normal, and 2.0 is fast (but still possibly intelligible).

## Observable Properties

### `can_escape`
`boolean`

Indicates that the currently-playing structure may be escaped by the user.
