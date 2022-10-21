import { SvgElement } from "./SvgElement.js";

export default class SvgLine extends SvgElement {
    constructor(start, end, config) {
        super({
            name: 'line',
            tag: 'path',
            attrs: {
                fill: 'transparent',
                stroke: '#0000ff',
                'stroke-width': 1
            },
            ...config
        })

        this.start = start
        this.end = end
    }

    repaint() {
        this.attrs.d = `M ${this.start[0]} ${this.start[1]} L ${this.end[0]} ${this.end[1]}`

        super.repaint()
    }
}