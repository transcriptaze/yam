import { EVENTS } from '../constants.js'

export class Playlist extends HTMLElement {
  static get observedAttributes() {
    return ['uuid', 'title', 'open']
  }

  #UUID = ''
  #title = '---'
  #selected = null
  #updated = false
  #tracks = []
  #tracklist = null
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
            new CustomEvent(EVENTS.SELECT_TRACK, {
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

        const shadow = this.shadowRoot
        const menu = shadow.querySelector('[popover]')

        menu.hidePopover()

        this.dispatchEvent(
          new CustomEvent(EVENTS.EDIT_PLAYLIST, {
            bubbles: true,
            composed: true,
            detail: {},
          }),
        )
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

    plus: {
      click: (event) => {
        event.preventDefault()
        event.stopPropagation()

        this.plus()
      },
    },

    container: {
      new_track: () => {
        this.#added()
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

    summary.addEventListener('click', this.#handlers.summary.click)
    menu.addEventListener('click', this.#handlers.menu.click)
    popover.addEventListener('toggle', this.#handlers.menu.toggle)
    ul.addEventListener('click', this.#handlers.ul.click)
    edit.addEventListener('click', this.#handlers.edit.click)
    save.addEventListener('click', this.#handlers.save.click)

    title.addEventListener('click', this.#handlers.title.click)
    title.addEventListener('keydown', this.#handlers.title.keydown)

    trash.addEventListener('click', this.#handlers.trash.click)
    trash.addEventListener('transitionend', this.#handlers.trash.transitionend)

    this.#plus?.addEventListener('click', this.#handlers.plus.click)

    container.addEventListener(EVENTS.NEW_TRACK, this.#handlers.container.new_track)
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

  open(tracklist, add_tracks) {
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
    tracks.appendChild(tracklist)
    tracks.appendChild(add_tracks)

    this.#tracklist = tracklist
    this.#add_tracks = add_tracks
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

    if (this.#tracklist != null) {
      this.#tracklist.selected = this.#tracks
    }

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
      this.#add_tracks.selected = this.#tracks
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
    const shadow = this.shadowRoot
    const container = shadow.querySelector('div.playlist')
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
    const container = this.shadowRoot.querySelector('div.playlist')
    const title = container.querySelector('div.title input')
    const tracklist = container.querySelector('yam-tracklist')

    if (tracklist == null) {
      this.dispatchEvent(
        new CustomEvent('change', {
          bubbles: true,
          composed: true,
          detail: {
            playlist: this.UUID,
            title: title.value,
          },
        }),
      )

      return
    }

    const selected = tracklist?.selected ?? []
    const set = new Set(selected.map((v) => v.UUID))
    const added = new Set()
    const tracks = []

    this.#tracks.forEach((v) => {
      if (set.has(v.UUID)) {
        tracks.push(v)
        added.add(v.UUID)
      }
    })

    const remaining = set.difference(added)

    selected.forEach((v) => {
      if (remaining.has(v.UUID)) {
        tracks.push({ UUID: `${v.UUID}`, title: `${v.title}`, muted: false })
      }
    })

    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: {
          playlist: this.UUID,
          title: title.value,
          tracks: tracks.map((v) => v.UUID),
        },
      }),
    )
  }

  #save_adds() {
    const container = this.shadowRoot.querySelector('div.playlist')
    const add_tracks = container.querySelector('yam-add-tracks')

    if (add_tracks == null) {
      return
    }

    const selected = add_tracks?.selected ?? []
    const tracks = new Set()

    this.#tracks.forEach((v) => {
      tracks.add(v.UUID)
    })

    selected.forEach((v) => {
      tracks.add(`${v.UUID}`)
    })

    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
        detail: {
          playlist: this.UUID,
          tracks: Array.from(tracks),
        },
      }),
    )
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

    this.dispatchEvent(
      new CustomEvent(EVENTS.MUTE_TRACK, {
        bubbles: true,
        composed: true,
        detail: { playlist: this.UUID, track: event.detail.UUID, mute: event.detail.mute },
      }),
    )
  }

  #trash = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const UUID = event.detail.track

    if (UUID != null && UUID !== '') {
      const shadow = this.shadowRoot
      const container = shadow.querySelector('div.tracks')
      const tracks = container.querySelectorAll('ul yam-playlist-item')
      const track = tracks.values().find((v) => v.UUID === UUID)

      if (track != null) {
        this.dispatchEvent(
          new CustomEvent(EVENTS.DELETE_TRACK, {
            bubbles: true,
            composed: true,
            detail: {
              playlist: this.UUID,
              track: track.UUID,
            },
          }),
        )
      }
    }
  }

  #add(ul, v) {
    const li = document.createElement('li')
    const grip = document.createElement('div')
    const img = document.createElement('img')
    const track = document.createElement('yam-playlist-item')

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

    track.track = {
      UUID: v.UUID,
      title: v.title,
      muted: v.muted,
      selected: v.UUID === this.#selected,
    }

    track.addEventListener(EVENTS.MUTE_TRACK, this.#mute)
    track.addEventListener(EVENTS.DELETE_TRACK, this.#trash)

    li.appendChild(grip)
    li.appendChild(track)

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
  }

  #dragend = (_event) => {
    // ... revert to playlist if dragend without drop
    if (!this.#drag.dropped) {
      Promise.resolve().then(() => {
        const shadow = this.shadowRoot
        const ul = shadow.querySelector('ul')
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
          const shadow = this.shadowRoot
          const ul = shadow.querySelector('ul')
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
    const tracks = this.#drag.list.map((v) => v.UUID)

    this.dispatchEvent(
      new CustomEvent(EVENTS.SHUFFLE_PLAYLIST, {
        bubbles: true,
        composed: true,
        detail: {
          playlist: this.UUID,
          tracks: tracks,
        },
      }),
    )

    this.#drag.dropped = true
  }
}

customElements.define('yam-playlist', Playlist)
