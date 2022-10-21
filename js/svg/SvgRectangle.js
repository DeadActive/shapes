import { SvgElement } from "./SvgElement.js"

export default class SvgRectangle extends SvgElement {
    constructor(config) {
        super({
            name: 'rectangle',
            tag: 'polygon',
            attrs: {
                fill: 'transparent',
                stroke: '#0000ff',
                'stroke-width': 1,
            },
            ...config
        })

        this.x = config.x || 0
        this.y = config.y || 0
        this.ex = config.ex || 0
        this.ey = config.ey || 0
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
        const { x, y, ex, ey } = this

        this.attrs.points = `${x},${y} ${ex},${y} ${ex},${ey} ${x},${ey}`

        super.repaint()
    }
}