import { getId } from '../utils/index.js'

export class SvgElement {
    constructor(config) {
        this.attrs = config?.attrs || {}
        this.style = config?.style || {}
        this.class = config?.class || []
        this.id = config?.id || getId()
        this.name = config?.name
        this.tag = config?.tag
        this.zIndex = config?.zIndex

        this.el = config.el || document.createElementNS('http://www.w3.org/2000/svg', this.tag)
    }

    repaint() {
        Object.entries(this.attrs).forEach(([attr, value]) => {
            this.el.setAttribute(attr, value)
        })

        Object.entries(this.style).forEach(([key, value]) => {
            this.el.style[key] = value
        })

        Object.entries(this.class).forEach(([key, value]) => {
            this.el.classList.toggle(key, value)
        })

        this.el.dataset['svgName'] = this.name
        this.el.dataset['svgId'] = this.id
    }
}