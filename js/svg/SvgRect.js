import { SvgElement } from "./SvgElement.js"

export class SvgRect extends SvgElement {
    constructor(config) {
        super({
            name: 'rect',
            tag: 'rect',
            attrs: {
                fill: 'transparent',
                stroke: '#0000ff',
                'stroke-width': 1,
            },
            ...config
        })

        this.x = config.x || 0
        this.y = config.y || 0
        this.width = config.width || 0
        this.height = config.height || 0
    }

    move(dx, dy) {
        this.x += dx
        this.y += dy
    }

    moveTo(x, y) {
        this.x = x
        this.y = y
    }

    repaint() {
        this.attrs.x = this.x
        this.attrs.y = this.y
        this.attrs.width = this.width
        this.attrs.height = this.height

        super.repaint()
    }
}