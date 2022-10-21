import { SvgElement } from "./SvgElement.js"

export class SvgCircle extends SvgElement {
    constructor(config) {
        super({
            name: 'circle',
            tag: 'circle',
            attrs: {
                fill: '#ffffff',
                stroke: '#0000ff',
                'stroke-width': 1,
                r: 5,
            },
            ...config
        })

        this.x = config.x || 0
        this.y = config.y || 0
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
        this.attrs.cx = this.x
        this.attrs.cy = this.y

        super.repaint()
    }
}