import * as datastore from '../datastore/datastore.js'
import { EVENTS } from '../constants.js'

export class PlaylistTracks extends HTMLElement {
  static get observedAttributes() {
    return []
  }

  #playlist = ''
  #selected = null
  // #updated = false

  // #drag = {
  //   li: null,
  //   over: null,
  //   UUID: '',
  //   list: [],
  //   dropped: false,
  // }

  #handlers = {
    ul: {
      click: (event) => {
        if (event.target.UUID != null) {
          event.preventDefault()
          this.dispatchEvent(
            new CustomEvent(EVENTS.SELECT_TRACK, {
              bubbles: true,
              composed: true,
              detail: { playlist: this.#playlist, track: event.target.UUID },
            }),
          )
        }
      },
    },

    plus: {
      click: (event) => {
        event.preventDefault()
        event.stopPropagation()

        this.#plus()
      },
    },

    save: {
      click: (event) => {
        event.preventDefault()
        event.stopPropagation()

        this.#save()
      },
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-playlist-tracks')
    const stylesheet = document.createElement('link')
    const content = template.content
    const shadow = this.attachShadow({ mode: 'open' })
    const clone = content.cloneNode(true)

    stylesheet.setAttribute('rel', 'stylesheet')
    stylesheet.setAttribute('href', '/css/widgets.css')

    shadow.appendChild(stylesheet)
    shadow.appendChild(clone)
  }

  connectedCallback() {
    this.classList.add('component-playlist-tracks')

    const ul = this.shadowRoot.querySelector('div.list > ul')
    const plus = this.shadowRoot.querySelector('#plus')
    const save = this.shadowRoot.querySelector('#save')

    ul.addEventListener('click', this.#handlers.ul.click)

    plus.addEventListener('click', this.#handlers.plus.click)
    save.addEventListener('click', this.#handlers.save.click)
  }

  disconnectedCallback() {}

  adoptedCallback() {}

  attributeChangedCallback(_name, _from, _to) {}

  set playlist({ playlist, selected }) {
    this.#playlist = playlist?.UUID ?? ''
    this.#tracks = datastore.playlists.get(playlist)?.tracks ?? []

    this.shadowRoot.querySelector('div.playlist-tracks').classList.remove('adding')
  }

  set selected({ playlist, track }) {
    if (playlist === this.#playlist) {
      this.#select(track)
    }
  }

  update(playlist) {
    const UUID = playlist?.UUID ?? ''

    if (UUID !== '' && this.#playlist === UUID) {
      this.#tracks = datastore.playlists.get(playlist)?.tracks ?? []
    }
  }

  // muted(track, muted) {
  //   const shadow = this.shadowRoot
  //   const tracks = shadow.querySelectorAll('ul yam-playlist-item')
  //   const match = tracks.values().find((v) => v.UUID === track)
  //
  //   if (match != null) {
  //     match.muted = muted
  //   }
  // }

  #plus() {
    return (async () => {
      await customElements.whenDefined('yam-add-tracks')

      const container = this.shadowRoot.querySelector('div.playlist-tracks')
      const widget = this.shadowRoot?.querySelector('yam-add-tracks')

      if (widget != null) {
        widget.playlist = this.#playlist
        container.classList.add('adding')

        document.addEventListener('mousedown', this.#clickOutside)
      }
    })()
  }

  #save() {
    return (async () => {
      await customElements.whenDefined('yam-add-tracks')

      const container = this.shadowRoot.querySelector('div.playlist-tracks')
      const widget = this.shadowRoot?.querySelector('yam-add-tracks')
      const selected = widget?.selected ?? []

      container.classList.remove('adding')
      datastore.playlists.addTracks(this.#playlist, selected)
    })()
  }

  set #tracks(list) {
    const container = this.shadowRoot.querySelector('div.playlist-tracks')
    const ul = container.querySelector('ul')
    const children = Array.from(ul.children)
    let ix = 0

    for (; ix < list.length && ix < children.length; ix++) {
      this.#update(ul, list[ix], children[ix])
    }

    for (; ix < list.length; ix++) {
      this.#add(ul, list[ix])
    }

    for (; ix < children.length; ix++) {
      this.#delete(ul, children[ix])
    }

    // ... reselect
    const track = list.find((v) => v.UUID === this.selected)
    const UUID = track?.UUID ?? null

    this.#select(UUID)
  }

  #select(UUID) {
    const container = this.shadowRoot.querySelector('div.playlist-tracks')
    const ul = container.querySelector('ul')

    for (const li of ul.children) {
      const track = li.querySelector('yam-playlist-item')

      track.selected = track.UUID === UUID
    }
  }

  #clickOutside = (_event) => {
    const container = this.shadowRoot.querySelector('div.playlist-tracks')
    const adding = this.shadowRoot.querySelector('div.playlist-tracks.adding')

    if (adding != null) {
      container.classList.remove('adding')
      document.removeEventListener('mousedown', this.#clickOutside)
    }
  }

  #mute = (event) => {
    event.preventDefault()
    event.stopPropagation()

    datastore.playlists.muteTrack(this.#playlist, event.detail.UUID, event.detail.mute)
  }

  #trash = (event) => {
    event.preventDefault()
    event.stopPropagation()

    datastore.playlists.deleteTrack(this.#playlist, event.detail.track)
  }

  #add(ul, v) {
    const li = document.createElement('li')
    const grip = document.createElement('div')
    const img = document.createElement('img')
    const item = document.createElement('yam-playlist-item')

    li.setAttribute('draggable', false)
    li.ondragover = this.#dragover
    li.ondragstart = this.#dragstart
    li.ondragend = this.#dragend
    li.ondragleave = this.#dragleave
    li.ondrop = this.#drop

    img.setAttribute('src', './images/grip.svg')
    img.setAttribute('draggable', false)

    grip.setAttribute('draggable', false)
    grip.classList.add('grip')
    grip.addEventListener('pointerdown', this.#onPointerDown)
    grip.appendChild(img)

    item.track = {
      UUID: v.UUID,
      title: v.title,
      muted: v.muted,
      selected: v.UUID === this.#selected,
      random: v.random === true ? true : false,
    }

    item.addEventListener(EVENTS.MUTE_TRACK, this.#mute)
    item.addEventListener(EVENTS.DELETE_TRACK, this.#trash)

    li.appendChild(grip)
    li.appendChild(item)

    ul.appendChild(li)
  }

  #update(ul, v, li) {
    const track = li.querySelector('yam-playlist-item')

    track.UUID = v.UUID
    track.title = v.title
    track.muted = v.muted
  }

  #delete(ul, li) {
    ul.removeChild(li)
  }

  #onPointerDown = (_event) => {
    //   const li = event.currentTarget.parentElement
    //
    //   li.setAttribute('draggable', true)
  }

  // Ref. https://stackoverflow.com/questions/10588607/tutorial-for-html5-dragdrop-sortable-list
  #dragstart = (_event) => {
    //   const li = event.currentTarget
    //   const track = li.querySelector('yam-playlist-item')
    //
    //   event.dataTransfer.effectAllowed = 'move'
    //   event.dataTransfer.setData('text/plain', track.UUID)
    //
    //   this.#drag.li = event.target
    //   this.#drag.over = null
    //   this.#drag.UUID = track.UUID
    //   this.#drag.list = this.#tracks?.slice(0) ?? []
    //   this.#drag.dropped = false
  }

  #dragend = (_event) => {
    //   // ... revert to playlist if dragend without drop
    //   if (!this.#drag.dropped) {
    //     Promise.resolve().then(() => {
    //       const ul = this.shadowRoot.querySelector('ul')
    //       const children = Array.from(ul.children)
    //       const tracks = this.#tracks.slice(0)
    //
    //       // NTS: this could be so much neater if Safari did web components properly
    //       tracks.forEach((e, index) => {
    //         const track = children[index].querySelector('yam-playlist-item')
    //         if (track.UUID !== e.UUID) {
    //           track.track = {
    //             UUID: e.UUID,
    //             title: e.title,
    //             muted: e.muted,
    //             selected: e.UUID === this.#selected,
    //           }
    //         }
    //       })
    //     })
    //   }
    //
    //   // ... clean up
    //   this.#drag.li.setAttribute('draggable', false)
    //   this.#drag.li = null
    //   this.#drag.over = null
    //   this.#drag.UUID = ''
    //   this.#drag.list = []
    //   this.#drag.dropped = false
  }

  #dragover = (event) => {
    event.preventDefault() // NTS: needed for drop to fire.
    event.dataTransfer.dropEffect = 'move'

    //   const li = event.target.closest('li')
    //
    //   if (li !== this.#drag.over) {
    //     const rect = li.getBoundingClientRect()
    //     const top = rect.top + 0.2 * rect.height
    //     const bottom = rect.top + 0.8 * rect.height
    //
    //     if (event.clientY > top && event.clientY < bottom) {
    //       this.#drag.over = li
    //
    //       Promise.resolve().then(() => {
    //         const ul = this.shadowRoot.querySelector('ul')
    //         const children = Array.from(ul.children)
    //         const ix = this.#drag.list.findIndex((v) => v.UUID === this.#drag.UUID)
    //         const jx = children.indexOf(li)
    //
    //         if (ix !== -1 && jx !== -1 && ix != jx) {
    //           ;[this.#drag.list[ix], this.#drag.list[jx]] = [this.#drag.list[jx], this.#drag.list[ix]]
    //
    //           // NTS: this could be so much neater if Safari did web components properly
    //           this.#drag.list.forEach((e, index) => {
    //             const track = children[index].querySelector('yam-playlist-item')
    //
    //             if (track.UUID !== e.UUID) {
    //               track.track = {
    //                 UUID: e.UUID,
    //                 title: e.title,
    //                 muted: e.muted,
    //                 selected: e.UUID === this.#selected,
    //                 random: e.random === true ? true : false,
    //               }
    //             }
    //           })
    //         }
    //       })
    //     }
    //   }
  }

  #dragleave = (_event) => {}

  #drop = (_event) => {
    //   this.#tracks = this.#drag.list
    //   this.#drag.dropped = true
    //
    //   const tracks = this.#drag.list.map((v) => v.UUID)
    //
    //   this.dispatchEvent(
    //     new CustomEvent(EVENTS.SHUFFLE_PLAYLIST, {
    //       bubbles: true,
    //       composed: true,
    //       detail: {
    //         playlist: this.UUID,
    //         tracks: tracks,
    //       },
    //     }),
    //   )
  }
}

customElements.define('yam-playlist-tracks', PlaylistTracks)
