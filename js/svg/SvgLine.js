import SvgRectangle from "./SvgRectangle.js";

export default class SvgLine extends SvgRectangle {
    constructor(x, y, ex, ey, svgConfig) {
        super(x, y, ex, ey, {
            name: 'line',
            tag: 'path',
            attrs: {
                fill: 'transparent',
                stroke: '#0000ff',
                'stroke-width': 1,
            },
            ...svgConfig
        })
    }

    update() {
        const { x, y, ex, ey } = this
        this.setAttr('d', `M ${x} ${y} L ${ex} ${ey}`)
    }
}