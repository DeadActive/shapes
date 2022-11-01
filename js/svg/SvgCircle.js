import SvgElement from "./SvgElement.js";

export default class SvgCircle extends SvgElement {
    constructor(x, y, svgConfig) {
        super({
            name: 'circle',
            tag: 'circle',
            attrs: {
                fill: '#ffffff',
                stroke: '#0000ff',
                'stroke-width': 1,
                r: 5,
            },
            ...svgConfig
        })

        this.moveTo(x, y)
    }

    setX(x) {
        this.x = x
        this.setAttr('cx', x)
    }

    setY(y) {
        this.y = y
        this.setAttr('cy', y)
    }

    move(dx, dy) {
        this.x += dx
        this.y += dy

        this.setAttrsBatch({
            cx: this.x,
            cy: this.y
        })
    }

    moveTo(x, y) {
        this.x = x
        this.y = y

        this.setAttrsBatch({
            cx: this.x,
            cy: this.y
        })
    }
}