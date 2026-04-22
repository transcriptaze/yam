# TODO

NB. https://willybrauner.com/journal/signal-the-push-pull-based-algorithm

## In Progress

- [x] Fix time signature override logic
- [ ] simplify UUIDv4

- [ ] statistics (cf. https://github.com/transcriptaze/yam/issues/11)
   - [x] ignore if track not defined
   - [x] capture start/stop/loops/bar
   - [x] capture track info
   - [x] capture BPM/tempo
   - [x] save
   - [ ] export
   - [ ] visualiser
      - (?) https://opensource.posit.co/blog/2026-04-20_ggsql_alpha_release/
      - (?) https://ggplot2.tidyverse.org/
   - (?) rework engine onPlaying/onStopped as signals
   - (?) rework widgets.metronome to subscribe to engine

- [ ] editor - default reverted to 4:4 instead of continuing with 6:4 (cf. https://github.com/transcriptaze/yam/issues/54)

- [ ] Rework clock (cf. https://github.com/transcriptaze/yam/issues/46)
    - [x] Rework clock as generator
    - [ ] unit test: BPM change
    - [ ] unit test: tactus change
    - [ ] Tick on on sixteenths
    - [ ] Tick on triplets
    - [ ] 'cue' generator
        - what to do about infinite sections ???

- [ ] Fix toolbar overlap on desktop when developer tools is open and expanded (cf. https://github.com/transcriptaze/yam/issues/42)
   - [x] Fixed overlap
   - [x] Rather make div.content scrollable
   - [ ] Grab to scroll
   - [ ] Hide scrollbar
   - [ ] Vertical scrollbar ???

- [ ] clicks
    - [ ] generate clicks for count-in
    - [ ] generate clicks for anacrusis (also 3:8, 6:8, 9:8, 12:8)
    - [ ] generate clicks for 5:4
    - [ ] clicks 3:8, 6:8, 9:8 and 12:8, dotted-quarter
    - [ ] not cascading - revert to track clicks or default clicks for time-signature
    - [ ] unit tests

- [ ] use realized track
    - [ ] make track UUID private
    - [ ] store in state
    - [ ] rework YAM to use state.track.UUID
    - [ ] reuse state track for widgets
    - [ ] consistently pass the either whole track or the UUID
        - OR at least stop mixing up track UUID and track

- [ ] use realized playlist
- [ ] connectedCallback: event handler duplication

## Fixes
- [ ] clicks
- [ ] _content-visibility: auto_
- [ ] allow BPM's less than 40/greater than 200 in subsections (because of tempo/BPM scaling thing)
- [ ] Cloudflare (cf. https://github.com/transcriptaze/yam/issues/6)
- [ ] (maybe) keep selected playlist on import
- [ ] edit from playlist
- [ ] use async getters for nested web components
- [ ] URL - use ?UUID= or ?title= 
- [ ] URL match on track if playlist not found
- [ ] (?) move spacebar toggle into metronome widget
- [ ] different grip icon
- [ ] onSave should only update editor title, BPM, etc
- [x] ~~playlists loaded from file include deleted playlists~~
- [ ] editor: metronome div vertical alignment
- [ ] editor: role drop down list
- [ ] portrait/fullscreen: put something (title? logo? yams?) in the 'safe area' at the top
- [ ] move start/stop/delay to clock

- [ ] automatically open editor on new playlist
- [ ] playlists: replace playlist.index with an ordered list
- (?) delete track in 'All Tracks' deletes track from all playlists and DB
        - or maybe delete in 'All Tracks' is disabled unless it is not used anywhere else

- [ ] 'change' events should all be CustomEvents
- [ ] web components: bubble events
- [ ] web-component box-sizing fixes
- [ ] playlist: fade-out top and bottom of scrollable list
- [ ] models.playlist CRUD interface

- [ ] 6:8, dotted quarter: intermediate clicks @60BPM
- [ ] 6:8, quarter notes
- [ ] 6:8, eighth notes
- [ ] 3:4 dotted quarter notes
- [ ] 2:2 time
- [ ] minimum click subinterval 125ms
- [ ] scale up SVG images (too small -> precision issues)
- [ ] clock: circular time
- [ ] trim height of 'play' icon
- [ ] use different font/colour for track that is in playlist (so that you know you are editing a playlist item)
- [ ] resize knob/fix SVG overflow
- [ ] rework state logic as FSM
      - seperate web components from logic
      - tests
- [ ] fix page layout for when it gets really squashed
- [ ] landscape+mobile

## Todo

### Reset
    - [ ] red if next tap will reset to defaults

### Toolbar
    - [ ] move page logic to CSS

### Control knob
    - [ ] integrate along path (fit curve to points ? low pass filter points ?)
    - [ ] rework rotation with matrix
    - [ ] slide-x
    - [ ] animate when BPM changed by input
    - [ ] velocity sensitive
    - [ ] openwc

### Thumbwheel
    - [ ] indicator triangle
    - [ ] edge gradient
    - [ ] progress bar      
    - [ ] velocity sensitive
    - [ ] animate when BPM changed by input

### Playlists
    - [ ] autoplay
      - announce track (TTS)
    - [ ] save URL as bookmark
    - [ ] flag modified tracks
    - [ ] playlist indicator for back/next (e.g. dots below play controls)
    - [ ] lock
    - [ ] save/load zipped (.yamz)
    - [ ] slots for <random> tracks
        - weighted by last/least played

### Other
    - [ ] schedulable e.g. Mondays
    - [ ] slide in/out
    - (?) shuffle
    - (?) sort
    - (?) embed other playlist e.g. 'In Progress' in 'Monday'
    - https://css-tricks.com/exploring-what-the-details-and-summary-elements-can-do/
    - https://css-tricks.com/simple-swipe-with-vanilla-javascript
    - https://stackoverflow.com/questions/9367279/can-i-do-a-swipe-left-or-right-in-chrome-pc-with-a-mouse

### Track
    - [ ] (?) tags
    - [ ] hover styles
    - [ ] lock
    - [ ] clone

### Pads
    - [ ] fix janky pads change
    - [ ] what to do about overflow
            - (?) scroll into view
            - (!) change presentation
                  - dots for e.g 12+ beats
                  - lines for e.g. 24+ beats
                  - groups

      - [ ] 9 patch ???
            - https://w3.eleqtriq.com/2014/03/the-holy-grail-of-image-scaling
            - https://freesvg.org/nine-patch-scaling
            - https://stackoverflow.com/questions/15061205/is-there-a-way-to-apply-9-patch-scale-9-principles-in-svg
      - https://w3c.github.io/smufl/latest/tables/conductor-symbols.html
      - https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape

### Settings 
    - [ ] device e.g. Pixel4a (for per device CSS) 
    - [ ] track retention time
    - [ ] sound set
    - [ ] preferred click patterns
    - [ ] knob PID constants (?)
    - https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Customizable_select

### Figma
    - [ ] portrait mockup
    - [ ] landscape mockup
    - [ ] desktop mockup

### Misc
    - [ ] TODO themes
         - [ ] setttings
         - [ ] setup on initial load
         - https://piccalil.li/blog/a-pragmatic-guide-to-modern-css-colours-part-two/
         - https://colorhunt.co/palette/f5ece05f99ae336d82693382
         - https://colorhunt.co/palette/ffa725fff5e4c1d8c36a9c89
         - https://colorhunt.co/palette/f6f0f0f2e2b1d5c7a3bdb395
         - https://dribbble.com/shots/14685674-MetroPulse-Metronome-Screens-II
         - https://dribbble.com/shots/21007853-Metronome-App-Device-Experiment
    - [ ] register yam: protocol

### Metronome
    - [ ] textured buttons
      - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
      - https://kube.io/blog/liquid-glass-css-svg/
      - [ ] dotted quarter
      - [ ] Δt offset into buffer
      - [ ] 'fix' sounds (they don't sound great - EQ? reverb?)
      - [ ] rather wire up play/stop in YAM.js

### MM
    - [ ] what to do if pulse is set to eighth and time signature changes to e.g. 3:4 ????
      - [ ] pulse
            - [ ] engine
      - [ ] ramp ease-in
      - [ ] web component
            - [ ] BPM parameter
            - [ ] max/min parameters
      - [ ] display as e.g. orange while transitioning

### Time Signature
    - [ ] setting tactus/figura triggers redraw + change event)
    - [ ] presets
     - use ligatures e.g timeSig2over4
     - https://www.w3.org/2019/03/smufl13/tables/time-signatures.html
     - https://torinak.com/font/lsfont.html

- [ ] control knob
      - [ ] slide-y
      - [ ] stiction
      - [ ] velocity sensitive
            - [ ] use animation time
      - [ ] :hover style
      - [ ] redo with canvas
      - [ ] BPM parameter
      - [ ] max/min parameters
      - [ ] MRU values
      - [ ] notches
      - [ ] clicking sound as it rotates
            - https://freesound.org/people/shewbox/sounds/30827/
            - https://freesound.org/people/el_boss/sounds/643563/
            - https://freesound.org/people/Jay6Waza/sounds/323173/
            - https://freesound.org/people/Eelke/sounds/523560/
      - [ ] custom cursor
      - [ ] cache radius,x0,etc in onPointerDown
      - (?) force model (a = F/m)
      - https://www.fffuel.co/gggrain
      - https://css-tricks.com/grainy-gradients
      - https://graphicdesign.stackexchange.com/questions/97228/how-to-create-an-undulating-fabric-texture-using-inkscape/97234#97234

### Textures
      - Master of Poisons (book cover)
      - Penrose tiles
      - 'hat' tiles
      - Navaho weaves
      - Ndebele patterns
      - https://daniel.do/article/making-noisy-svgs
      - https://kube.io/blog/liquid-glass-css-svg/

### Plugins
      - statistics
      - make-me-a-sandwich JSON editor pages
      - MIDI file import/export

### About
      - https://webkit.org/blog/16547/better-typography-with-text-wrap-pretty
      - (?) handwriting font
         - https://chameth.com/making-a-font-of-my-handwriting

### TLA+
      - send EVENT.STOPPED event on receiving EVENT.STOP  even if state is already STOPPED
      - send EVENT.RUNNING event on receiving EVENT.START even if state is already RUNNING
      - UI.thread queue + click events


## Features

1. Statistics
   - export to TSV
   - prioritize least often played for _random track_

2. Tracks
   - export as click track
     - audio 
     - midi
     - json
   - fermata
   - rallentando

3. 'listen'
   - for start
   - for silence
   - accuracy
   - statistics

4. EQ

5. Slowly changing backgrounds

6. Scripting
    - WASM
    - Scheme
    - DSL
    - structure editor
    - https://www.youtube.com/watch?v=HkgV_-nJOuE

7. Floating tempo
   - Bezier curve

8. Automatically 'schedule' playlist by name e.g Monday, 1st

9. Plugin architecture

10. Import/render MIDI

11. Metronome-as-a-service (?)

12. CLI (?)

## Other
      - (?) Processing
            - https://processing.org/reference/libraries/sound/index.html
            - https://code.compartmental.net/minim
            - https://forum.processing.org/two/discussion/24743/how-to-create-a-traditional-metronome.html
            - https://openprocessing.org/sketch/1514409
            - https://github.com/vincentsijben/bpm-timings-for-processing
      - (?) sox
      - (?) cue sheets
            - https://wiki.hydrogenaudio.org/index.php?title=Cue_sheet
      - (?) https://docs.swmansion.com/TypeGPU/examples

## Notes
  1.  https://music.stackexchange.com/questions/91171/bar-counting-metronome  
  2.  https://wam-examples.vidalmazuy.fr/example1-js/index.html
  3.  https://css-tricks.com/the-different-and-modern-ways-to-toggle-content/#aa-styling-the-dialogs-backdrop
  4.  https://mori.pages.dev/blog/details-hack
  5.  https://music.stackexchange.com/questions/91171/bar-counting-metronome
  6.  https://github.com/nicbarker/clay
  7.  https://stackoverflow.com/questions/5546346/how-to-place-and-center-text-in-an-svg-rectangle
  8.  https://music.stackexchange.com/questions/6589/are-there-names-for-referring-to-the-top-or-bottom-numbers-in-a-time-signature
  9.  https://music.stackexchange.com/questions/40497/should-i-set-the-metronome-the-same-speed-as-the-shortest-note-when-practicing
  10. https://music.stackexchange.com/questions/91171/bar-counting-metronome
  11. https://stackoverflow.com/questions/2635423/way-to-reduce-size-of-ttf-fonts
  12. https://developer.chrome.com/blog/a-customizable-select
  13. https://tauri.app

  - https://webgpufundamentals.org/webgpu/lessons/webgpu-resizing-the-canvas.html
  - https://graphicdesign.stackexchange.com/questions/115225/where-to-find-more-to-4-combo-colors-generator
  - https://css-tricks.com/thinking-deeply-about-theming-and-color-naming
  - https://meodai.github.io/rampensau
  - https://media.licdn.com/dms/image/v2/D562DAQGfvMUPSACz_w/profile-treasury-image-shrink_1280_1280/B56ZWG1lWtGsAY-/0/1741723950693?e=1754978400&v=beta&t=2tcCb8xsZ0Re296TPxb2j_SWUkJEik7x-nb-dh5Jhfs
  - https://jakub.kr/components/oklch-colors
  - https://github.com/liriliri/eruda
  - https://docs.openvino.ai/2024/notebooks/stable-audio-with-output.html
  - https://docs.openvino.ai/2024/notebooks/music-generation-with-output.html
  - https://kube.io/blog/liquid-glass-css-svg
  - https://github.com/lunarring/lunar_tools

### Flutter
   1. https://medium.com/@utkuaydogdu01/playing-audio-by-processing-raw-pcm-audio-data-in-flutter-practical-guide-and-best-audio-packages-455dedcd129e



```
export function getUUID() {
  // 1. The modern standard (Available in all secure contexts/PWAs)
  if (typeof self.crypto?.randomUUID === 'function') {
    return self.crypto.randomUUID();
  }

  // 2. The robust fallback (Uses high-entropy hardware random if available)
  const getRandomByte = () => {
    if (self.crypto?.getRandomValues) {
      return self.crypto.getRandomValues(new Uint8Array(1))[0];
    }
    return Math.floor(Math.random() * 256);
  };

  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (getRandomByte() & (15 >> (c / 4)))).toString(16)
  );
}
```