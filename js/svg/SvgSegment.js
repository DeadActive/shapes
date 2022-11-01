import SvgElement from "./SvgElement.js";

export default class SvgSegment extends SvgElement {
    constructor(pathSegment, svgConfig) {
        super({
            tag: 'path',
            name: 'segment',
            attrs: {
                fill: 'transparent',
                stroke: '#0597ff',
                'stroke-width': 1
            },
            ...svgConfig
        })

        this.pathSegment = pathSegment
        this.update()
    }

    move(dx, dy) {
        this.pathSegment.move(dx, dy)
        this.update()
    }

    update() {
        let d = ''

        const point = this.pathSegment.pathPoints[0]
        const nextPoint = this.pathSegment.pathPoints[1]

        d = `M ${point.coords[0]} ${point.coords[1]} ` +
            `C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]} ${nextPoint.controls[0].coords[0]} ${nextPoint.controls[0].coords[1]} ` +
            `${nextPoint.coords[0]} ${nextPoint.coords[1]} ` +
            `C ${nextPoint.controls[0].coords[0]} ${nextPoint.controls[0].coords[1]} ${point.controls[1].coords[0]} ${point.controls[1].coords[1]} ` +
            `${point.coords[0]} ${point.coords[1]}`

        this.setAttr('d', d)
    }
}