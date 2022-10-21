import { SvgElement } from "./SvgElement.js";

export default class SvgSegment extends SvgElement {
    constructor(points, config) {
        super({
            tag: 'path',
            ...config
        })

        this.points = points
    }

    move(dx, dy) {
        this.points.forEach(p => {
            p.move(dx, dy)
            p.controls.forEach(c => c.move(dx, dy))
        })
    }

    repaint() {
        let d = ''

        const point = this.points[0]
        const nextPoint = this.points[1]

        d = `M ${point.coords[0]} ${point.coords[1]} ` +
            `C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]} ${nextPoint.controls[0].coords[0]} ${nextPoint.controls[0].coords[1]} ` +
            `${nextPoint.coords[0]} ${nextPoint.coords[1]} ` +
            `C ${nextPoint.controls[0].coords[0]} ${nextPoint.controls[0].coords[1]} ${point.controls[1].coords[0]} ${point.controls[1].coords[1]} ` +
            `${point.coords[0]} ${point.coords[1]}`

        this.attrs.d = d
        super.repaint()
    }
}