const 𝜏 = 0.5

export class Level {
  constructor() {
    this.fs = 44100
    this.𝛅g = (𝜏 * this.fs) / 10000
    this.𝛵 = 0.6321205588 / this.𝛅g
    this.gain = 0
  }

  set sampleRate(fs) {
    this.fs = fs
    this.𝛅g = (𝜏 * fs) / 10000
    this.𝛵 = 0.6321205588 / this.𝛅g
  }

  get level() {
    return this.gain
  }

  fadeIn() {
    if (this.gain < 0.999) {
      this.gain += this.𝛵 * (1 - this.gain)
    } else {
      this.gain = 1
    }

    return this.gain
  }

  fadeOut() {
    if (this.gain > 0.001) {
      this.gain -= this.𝛵 * this.gain
    } else {
      this.gain = 0.0
    }

    return this.gain
  }
}
