import { JSDOM } from 'jsdom'

const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
  url: 'http://localhost/',
  pretendToBeVisual: true,
})

// basic globals
global.window = dom.window
global.document = dom.window.document
global.HTMLElement = dom.window.HTMLElement
global.Node = dom.window.Node
global.customElements = dom.window.customElements
global.getComputedStyle = dom.window.getComputedStyle

// safely redefine navigator
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  configurable: true,
  enumerable: true,
  writable: true,
})
