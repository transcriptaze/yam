import * as datastore from '../datastore/datastore.js'
import { DEFAULT, EVENTS } from '../constants.js'

export class Playlist extends HTMLElement {
  static get observedAttributes() {
    return ['uuid', 'title', 'open']
  }

  #UUID = ''
  #title = '---'
  #selected = null
  #updated = false
  #tracks = []
  #add_tracks = null

  #fields = {}

  #drag = {
    li: null,
    over: null,
    UUID: '',
    list: [],
    dropped: false,
  }

  #handlers = {
    summary: {
      click: (event) => {
        event.preventDefault()

        const shadow = this.shadowRoot
        const container = shadow.querySelector('div.playlist')
        const open = container.hasAttribute('open')
        const tracks = container.querySelector('div.tracks')

        if (!open) {
          container.setAttribute('open', '')
          tracks.classList.remove('hidden')
        } else {
          container.removeAttribute('open')
          tracks.classList.add('hidden')
        }

        this.dispatchEvent(
          new CustomEvent(EVENTS.TOGGLE_PLAYLIST, {
            bubbles: true,
            composed: true,
            detail: { playlist: this.UUID, open: !open },
          }),
        )
      },
    },

    menu: {
      click: (event) => {
        event.stopPropagation()
      },

      toggle: (event) => {
        event.stopPropagation()

        const shadow = this.shadowRoot
        const trash = shadow.querySelector('#trash')

        if (event.newState === 'open') {
          this.classList.remove('deleting')
          trash.classList.remove('locked')
        }

        if (event.newState === 'closed') {
          this.classList.remove('deleting')
        }
      },
    },

    ul: {
      click: (event) => {
        if (event.target.UUID != null) {
          event.preventDefault()
          this.dispatchEvent(
            new CustomEvent(EVENTS.TRACK_SELECT, {
              bubbles: true,
              composed: true,
              detail: { playlist: this.UUID, track: event.target.UUID },
            }),
          )
        }
      },
    },

    edit: {
      click: (event) => {
        event.preventDefault()
        event.stopPropagation()

        this.shadowRoot.querySelector('[popover]').hidePopover()
        this.edit()
      },
    },

    save: {
      click: (event) => {
        event.preventDefault()
        event.stopPropagation()

        const container = this.shadowRoot.querySelector('div.playlist')
        const editing = container.classList.contains('editing')
        const adding = container.classList.contains('adding')

        if (editing && !adding) {
          this.#save_edits()
          this.#edited()
        }

        if (adding && !editing) {
          this.#save_adds()
          this.#added()
        }
      },
    },

    title: {
      click: (event) => {
        if (!event.currentTarget.disabled) {
          event.stopPropagation()
        }
      },

      keydown: (event) => {
        const shadow = this.shadowRoot
        const container = shadow.querySelector('div.playlist')
        const title = container.querySelector('div.title input')

        if (event.key === 'Enter') {
          this.#save_edits()
          this.#edited()
          return true
        }

        if (event.key === 'Escape') {
          title.value = this.title
          this.#edited()
          return true
        }
      },
    },

    trash: {
      click: (event) => {
        event.preventDefault()
        event.stopPropagation()

        const shadow = this.shadowRoot
        const trash = shadow.querySelector('#trash')

        if (this.classList.contains('deleting') && !trash.classList.contains('locked')) {
          this.dispatchEvent(
            new CustomEvent(EVENTS.DELETE_PLAYLIST, {
              bubbles: true,
              composed: true,
              detail: { playlist: this.UUID },
            }),
          )
        } else {
          this.classList.add('deleting')
          trash.classList.add('locked')
        }
      },

      transitionend: (event) => {
        const shadow = this.shadowRoot
        const trash = shadow.querySelector('#trash')

        if (event.propertyName === 'filter') {
          trash.classList.remove('locked')
        }
      },
    },

    statistics: {
      click: (event) => {
        this.shadowRoot.querySelector('[popover]').hidePopover()

        event.preventDefault()
        event.stopPropagation()

        this.dispatchEvent(
          new CustomEvent(EVENTS.PLAYLIST_STATISTICS, {
            bubbles: true,
            composed: true,
            detail: { playlist: this.UUID },
          }),
        )
      },
    },

    plus: {
      click: (event) => {
        event.preventDefault()
        event.stopPropagation()

        this.plus()
      },
    },
  }

  constructor() {
    super()

    const template = document.querySelector('#template-playlist')
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
    this.classList.add('component-playlist')

    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.playlist')
    const summary = container.querySelector('div.summary')
    const title = summary.querySelector('div.title input')
    const menu = shadow.querySelector('button#menu')
    const popover = shadow.querySelector('[popover]')
    const ul = shadow.querySelector('ul')
    const edit = shadow.querySelector('#edit')
    const trash = shadow.querySelector('#trash')
    const save = shadow.querySelector('#save')
    const statistics = shadow.querySelector('#statistics')

    summary.addEventListener('click', this.#handlers.summary.click)
    menu.addEventListener('click', this.#handlers.menu.click)
    popover.addEventListener('toggle', this.#handlers.menu.toggle)
    ul.addEventListener('click', this.#handlers.ul.click)
    edit.addEventListener('click', this.#handlers.edit.click)
    save.addEventListener('click', this.#handlers.save.click)
    statistics.addEventListener('click', this.#handlers.statistics.click)

    title.addEventListener('click', this.#handlers.title.click)
    title.addEventListener('keydown', this.#handlers.title.keydown)

    trash.addEventListener('click', this.#handlers.trash.click)
    trash.addEventListener('transitionend', this.#handlers.trash.transitionend)

    this.#plus?.addEventListener('click', this.#handlers.plus.click)
  }

  disconnectedCallback() {
    this.#fields = {}
  }

  adoptedCallback() {}

  attributeChangedCallback(name, _from, to) {
    if (name === 'uuid') {
      this.UUID = to
    }

    if (name === 'title') {
      this.title = to
    }

    if (name === 'open') {
      this.open = true
    }
  }

  get isopen() {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.playlist')

    return container.hasAttribute('open')
  }

  get UUID() {
    return this.#UUID
  }

  set UUID(v) {
    this.#UUID = v != null ? `${v}` : ''
  }

  get title() {
    return this.#title
  }

  set title(v) {
    const shadow = this.shadowRoot
    const title = shadow.querySelector('div.title input')

    this.#title = v == null ? '' : `${v}`
    title.value = this.#title
  }

  set playlist({ playlist, selected }) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.playlist')

    this.UUID = playlist?.UUID ?? ''
    this.title = playlist?.title ?? '---'
    this.#tracks = playlist?.tracks ?? []

    if (this.isopen) {
      this.#set(this.#tracks)
    } else {
      this.#updated = true
    }

    if (selected === true) {
      container.classList.add('selected')
    } else {
      container.classList.remove('selected')
    }
  }

  get selected() {
    return this.#selected
  }

  set selected(v) {
    this.#select(v)
  }

  set deleting(v) {
    const shadow = this.shadowRoot
    const menu = shadow.querySelector('[popover]')

    if (v === true) {
      this.classList.add('deleting')
    } else {
      this.classList.remove('deleting')
      menu.hidePopover()
    }
  }

  open(add_tracks) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.playlist')
    const tracks = container.querySelector('div.tracks')
    const ul = tracks.querySelector('ul')

    // NTS: only render tracks on open
    if (ul.children.length === 0 || this.#updated) {
      this.#set(this.#tracks)
      this.#updated = false
    }

    container.setAttribute('open', '')
    container.classList.add('selected')

    tracks.classList.remove('hidden')
    tracks.appendChild(add_tracks)

    this.#add_tracks = add_tracks

    // ... 'All Tracks' ?
    if (this.UUID === DEFAULT.UUID) {
      add_tracks.classList.add('all-tracks')
    } else {
      add_tracks.classList.remove('all-tracks')
    }
  }

  close() {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.playlist')
    const tracks = container.querySelector('div.tracks')

    container.classList.remove('editing')
    container.classList.remove('selected')
    container.removeAttribute('open')

    tracks.classList.add('hidden')
  }

  muted(track, muted) {
    const shadow = this.shadowRoot
    const tracks = shadow.querySelectorAll('ul yam-playlist-item')
    const match = tracks.values().find((v) => v.UUID === track)

    if (match != null) {
      match.muted = muted
    }
  }

  updated(track) {
    // ... update stored title
    {
      const match = this.#tracks.find((v) => v.UUID === track.UUID)
      if (match != null) {
        match.title = track.title
      }
    }

    // ... update displayed title
    {
      const tracks = this.shadowRoot.querySelectorAll('ul yam-playlist-item')
      const match = tracks.values().find((v) => v.UUID === track.UUID)
      if (match != null) {
        match.title = track.title
      }
    }
  }

  edit() {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.playlist')
    const title = container.querySelector('div.title input')

    container.classList.add('editing')
    title.disabled = false

    if (!this.isopen) {
      title.focus()
    }

    document.addEventListener('mousedown', this.#clickOutside)
  }

  plus() {
    const container = this.shadowRoot.querySelector('div.playlist')

    if (this.#add_tracks != null) {
      this.#add_tracks.playlist = this.UUID
    }

    container.classList.add('adding')

    document.addEventListener('mousedown', this.#clickOutside)
  }

  get #plus() {
    if (this.#fields.plus == null) {
      this.#fields.plus = this.shadowRoot?.querySelector('#plus')
    }

    return this.#fields.plus
  }

  #set(list) {
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.playlist')
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
    const container = this.shadowRoot.querySelector('div.playlist')
    const ul = container.querySelector('ul')

    for (const li of ul.children) {
      const track = li.querySelector('yam-playlist-item')

      track.selected = track.UUID === UUID
    }

    // ... set #selected
    const track = this.#tracks.find((v) => v.UUID === UUID)

    if (track == null && this.#selected != null) {
      this.#selected = null
    } else if ((UUID == null && this.#selected != null) || (UUID != null && UUID !== this.#selected)) {
      this.#selected = UUID
    }
  }

  #edited() {
    const container = this.shadowRoot.querySelector('div.playlist')
    const title = container.querySelector('div.title input')

    container.classList.remove('editing')
    title.disabled = true
    document.removeEventListener('mousedown', this.#clickOutside)
  }

  #added() {
    const container = this.shadowRoot.querySelector('div.playlist')

    container.classList.remove('adding')
    document.removeEventListener('mousedown', this.#clickOutside)
  }

  #save_edits() {
    const title = this.shadowRoot.querySelector('div.playlist div.title input')

    datastore.playlists.setTitle(this.#UUID, title.value)
  }

  #save_adds() {
    const addTracks = this.shadowRoot.querySelector('div.playlist yam-add-tracks')

    if (addTracks != null) {
      const selected = addTracks?.selected ?? []

      datastore.playlists.addTracks(this.#UUID, selected)
    }
  }

  #clickOutside = (event) => {
    const shadow = this.shadowRoot
    const editing = shadow.querySelector('div.playlist.selected.editing')
    const adding = shadow.querySelector('div.playlist.selected.adding')
    const host = document.querySelector('yam-playlists')

    if (editing != null) {
      if (!event.composedPath().includes(host)) {
        this.#edited()
      }
    }

    if (adding != null) {
      if (!event.composedPath().includes(host)) {
        this.#added()
      }
    }
  }

  #mute = (event) => {
    event.preventDefault()
    event.stopPropagation()

    datastore.playlists.muteTrack(this.#UUID, event.detail.UUID, event.detail.mute)
  }

  #trash = (event) => {
    event.preventDefault()
    event.stopPropagation()

    datastore.playlists.deleteTrack(this.#UUID, event.detail.track)
  }

  #add(ul, v) {
    const li = document.createElement('li')
    const grip = document.createElement('div')
    const item = document.createElement('yam-playlist-item')

    li.setAttribute('draggable', false)
    li.ondragover = this.#dragover
    li.ondragstart = this.#dragstart
    li.ondragend = this.#dragend
    li.ondragleave = this.#dragleave
    li.ondrop = this.#drop

    grip.setAttribute('draggable', false)
    grip.classList.add('grip')
    grip.addEventListener('pointerdown', this.#onPointerDown)

    item.track = {
      UUID: v.UUID,
      title: v.title,
      muted: v.muted,
      selected: v.UUID === this.#selected,
      random: v.random === true ? true : false,
    }

    item.addEventListener(EVENTS.TRACK_MUTE, this.#mute)
    item.addEventListener(EVENTS.TRACK_DELETE, this.#trash)

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

  #onPointerDown = (event) => {
    const li = event.currentTarget.parentElement

    li.setAttribute('draggable', true)
  }

  // Ref. https://stackoverflow.com/questions/10588607/tutorial-for-html5-dragdrop-sortable-list
  #dragstart = (event) => {
    const li = event.currentTarget
    const track = li.querySelector('yam-playlist-item')

    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', track.UUID)

    this.#drag.li = event.target
    this.#drag.over = null
    this.#drag.UUID = track.UUID
    this.#drag.list = this.#tracks?.slice(0) ?? []
    this.#drag.dropped = false

    console.log('>>>> ', this.#drag.list)
  }

  #dragend = (_event) => {
    // ... revert to playlist if dragend without drop
    if (!this.#drag.dropped) {
      Promise.resolve().then(() => {
        const ul = this.shadowRoot.querySelector('ul')
        const children = Array.from(ul.children)
        const tracks = this.#tracks.slice(0)

        // NTS: this could be so much neater if Safari did web components properly
        tracks.forEach((e, index) => {
          const track = children[index].querySelector('yam-playlist-item')
          if (track.UUID !== e.UUID) {
            track.track = {
              UUID: e.UUID,
              title: e.title,
              muted: e.muted,
              selected: e.UUID === this.#selected,
            }
          }
        })
      })
    }

    // ... clean up
    this.#drag.li.setAttribute('draggable', false)
    this.#drag.li = null
    this.#drag.over = null
    this.#drag.UUID = ''
    this.#drag.list = []
    this.#drag.dropped = false
  }

  #dragover = (event) => {
    event.preventDefault() // NTS: needed for drop to fire.
    event.dataTransfer.dropEffect = 'move'

    const li = event.target.closest('li')

    if (li !== this.#drag.over) {
      const rect = li.getBoundingClientRect()
      const top = rect.top + 0.2 * rect.height
      const bottom = rect.top + 0.8 * rect.height

      if (event.clientY > top && event.clientY < bottom) {
        this.#drag.over = li

        Promise.resolve().then(() => {
          const ul = this.shadowRoot.querySelector('ul')
          const children = Array.from(ul.children)
          const ix = this.#drag.list.findIndex((v) => v.UUID === this.#drag.UUID)
          const jx = children.indexOf(li)

          if (ix !== -1 && jx !== -1 && ix != jx) {
            ;[this.#drag.list[ix], this.#drag.list[jx]] = [this.#drag.list[jx], this.#drag.list[ix]]

            // NTS: this could be so much neater if Safari did web components properly
            this.#drag.list.forEach((e, index) => {
              const track = children[index].querySelector('yam-playlist-item')

              if (track.UUID !== e.UUID) {
                track.track = {
                  UUID: e.UUID,
                  title: e.title,
                  muted: e.muted,
                  selected: e.UUID === this.#selected,
                  random: e.random === true ? true : false,
                }
              }
            })
          }
        })
      }
    }
  }

  #dragleave = (_event) => {}

  #drop = (_event) => {
    this.#tracks = this.#drag.list
    this.#drag.dropped = true

    const tracks = this.#drag.list.map((v) => v.UUID)

    datastore.playlists.shuffleTracks(this.#UUID, tracks)
  }
}

customElements.define('yam-playlist', Playlist)
