export const STATE = {
  START: 0,
  STOPPED: 1,
  STARTING: 2,
  PLAYING: 3,
  STOPPING: 4,
}

Object.freeze(STATE)

export class FSM {
  constructor() {
    this.state = STATE.START
  }

  get initialised() {
    return this.state != STATE.START
  }

  set initialised(v) {
    if (this.state === STATE.START) {
      this.state = STATE.STOPPED
    }
  }

  get starting() {
    return this.state === STATE.STARTING
  }

  get playing() {
    return this.state === STATE.PLAYING
  }

  get stopping() {
    return this.state === STATE.STOPPING
  }

  get stopped() {
    return this.state === STATE.STOPPED
  }

  onStart() {
    switch (this.state) {
      case STATE.START:
        this.state = STATE.STOPPED
        break
    }
  }

  onPlay() {
    switch (this.state) {
      case STATE.STOPPED:
        this.state = STATE.STARTING
        return true

      case STATE.STOPPING:
        this.state = STATE.STARTING
        return true
    }

    return false
  }

  on250ms() {
    switch (this.state) {
      case STATE.STARTING:
        this.state = STATE.PLAYING
        return true
    }

    return false
  }

  onStop() {
    switch (this.state) {
      case STATE.STARTING:
        this.state = STATE.STOPPED
        return true

      case STATE.PLAYING:
        this.state = STATE.STOPPING
        return true
    }

    return false
  }

  onStopped() {
    switch (this.state) {
      case STATE.STOPPING:
        this.state = STATE.STOPPED
        break
    }
  }
}
