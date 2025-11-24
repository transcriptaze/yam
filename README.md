![build](https://github.com/twystd/yam/workflows/build/badge.svg)

# Yet Another Metronome

**-- IN DEVELOPMENT (PRE-ALPHA) --**

Just one more _WebAudio_ metronome web app to add to the many, many other metronomes out there.

YAM is pretty much designed exclusively for use by an _almost but not entirely ham-fisted_ acoustic fingerstyle
guitarist without any appreciable musical ability who plays an old (but adored!) Taylor 310e and needs all the
help he can get. If that description is not you (it probably isn't 😄) then YMMV!

It's available online if you want to try it out:

https://yam-alpha.pages.dev

(or follow the installation instructions [below](#installation) to run your own version).


## Waivers and Demurrers

This is very much a personal project and (currently at least) developed and tested almost exclusively with Google Chrome on a Pixel 5a.
It will be a pleasant surprise and/or minor miracle if it works at all on anything else but you never know.

It's also _pre-alpha_ i.e. expect the code, design, architecture, everything to change **often**.


## Screenshots

<img src="documentation/images/screenshot.png">


## Supported browsers

| Platform    | Browser    | Version        | Ok               | Notes                                      |
|-------------|------------|----------------|------------------|--------------------------------------------|
| **MacOs**   | Chrome     | _latest_       | Yes              |                                            |
|             | Firefox    | _latest_       | Yes              | _Do NOT ask about the layout hacks_        |
|             | Safari     | _latest_       | Yes              | _Some minor layout glitches_               |
|             | Opera      | _latest_       | Yes              |                                            |
|             |            |                |                  |                                            |
| **Windows** | Chrome     |                |                  |                                            |
|             | Firefox    |                |                  |                                            |
|             | Edge       |                |                  |                                            |
|             | Opera      |                |                  |                                            |
|             |            |                |                  |                                            |
| **Linux**   | Chrome     |                |                  |                                            |
|             | Firefox    |                |                  |                                            |
|             | Opera      |                |                  |                                            |
|             |            |                |                  |                                            |
| **Android** | Chrome     | _latest_       | Yes              |                                            |
|             | Firefox    | _latest_       | Mostly           | _(as above)_                               |
|             | Edge       | _latest_       | Yes              |                                            |
|             | Opera      |                |                  |                                            |
|             | Opera Mini |                | No               | _No WebAudio support_                      |
|             |            |                |                  |                                            |
| **iOS**     | Firefox    |                |                  |                                            |
|             | Safari     |                |                  |                                            |
|             | Opera      |                |                  |                                            |
|             | Opera Mini |                | No               | _No WebAudio support_                      |


## Installation

The web app is packaged as a zip file that includes the HTML, images, audio and rollup'd Javascript that can be served by almost any basic
HTTP server that includes Cross Origin Resources Sharing support. Simply download and unpack the _yam_alpha.zip_ file from the most from
the most recent [Alpha release](https://github.com/transcriptaze/yam/actions/workflows/alpha.yml) build - and host the _html_ folder on
a web server of your choice.

The zip file includes scripts for the _Python_, _NodeJS_ and _Go_ built-in HTTP servers, but the web app is entirely static so whatever
you have will probably work as long as CORS is enabled and has the following headers:
```
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, OPTIONS
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
```

### Python
To run the built-in _Python_ HTTP server:
```
python3 yam.py
```

### NodeJS
To run the built-in _NodeJS_ HTTP server:
```
node yam.mjs
```

### Go
To run the built-in _Go_ HTTP server:
```
go run yam.go
```
or
```
go build -o bin/
./bin/yam
```

## Development

### Requirements

- NodeJS v24.11.1+

### Build

1. Clone the repository:
```
git clone https://github.com/transcriptaze/yam.git
cd yam
```

2. Install the NodeJS development modules:

- _prettier_
- _eslint_
- _sass_

```
npm install
```

3. Build and run:
```
make run
```

## License

Everything in this repository is licensed under [GPL-3.0](https://github.com/transcriptaze/yam/blob/master/LICENSE). 


## Attributions

1. Metronome icon
   - [SVGRepo](https://www.svgrepo.com/svg/390025/metronome-tempo-beat-bpm)
   - [CC Attribution License](https://www.svgrepo.com/page/licensing)
   - Music Glyphs Icons
   - wishforge.games

2. Settings icon
   - [SVGRepo](https://www.svgrepo.com/svg/304474/settings)
   - [PD License](https://www.svgrepo.com/page/licensing)
   - Simple App Development Icons
   - Significa Labs   

3. Library icon
   - [SVGRepo](https://www.svgrepo.com/svg/506838/list)
   - [PD License](https://www.svgrepo.com/page/licensing)
   - Start Universal Tiny Oval Icons
   - Salah Elimam   

4. Song file icon
   - [SVGRepo](https://www.svgrepo.com/svg/478380/music-file-1)
   - [PD License](https://www.svgrepo.com/page/licensing)
   - Communication Icooon Mono Vectors
   - Icooon Mono

5. RIFF icon
   - [SVGRepo](https://www.svgrepo.com/svg/427846/song-music-sound)
   - [CC Attribution License](https://www.svgrepo.com/page/licensing)
   - Stylish Tiny Intertface Icons
   - Robin Kylander

6. Warning icon
   - [SVGRepo](https://www.svgrepo.com/svg/327593/warning)
   - [MIT](https://www.svgrepo.com/page/licensing)
   - Ionicons

7. Section expand/collapse icon
   - [SVGRepo](https://www.svgrepo.com/svg/458664/expand-right)
   - [CC Attribution License](https://www.svgrepo.com/page/licensing)
   - Leonid Tsvetkov

9. Bravura SMUFL font
   - [Bravura](https://github.com/steinbergmedia/bravura)
   - [SIL Open Font License 1.1](https://openfontlicense.org)
   - [Steinberg](https://www.steinberg.net)

10. Lato font
    - [Lato Fonts](https://www.latofonts.com)
    - [SIL Open Font License 1.1](https://openfontlicense.org)

