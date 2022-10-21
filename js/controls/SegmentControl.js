import SvgSegment from "../svg/SvgSegment.js";
import { distance, calculateBezier } from "../utils/index.js";
import Control from "./Control.js";

export default class SegmentControl extends Control {
    constructor(points, options) {
        const svgEl = new SvgSegment(
            points.map(p => p.pathPoint),
            {
                name: 'segmentControl',
                attrs: {
                    fill: 'transparent',
                    stroke: '#0597ff',
                    'stroke-width': 5
                }
            })

        super({ svgEl, options })
        this.points = points
    }

    move(dx, dy) {
        super.move(dx, dy)
    }

    setVisible(value) {
        this.svgEl.style.display = value ? 'block' : 'none'
    }

    getLength() {
        const LUT = this.getLUT(10)

        let length = 0

        for (let index = 0; index < LUT.length - 1; index++) {
            const point = LUT[index];
            const nextPoint = LUT[index + 1]

            length += distance(point, nextPoint)
        }

        return length
    }

    getLUT(steps) {
        if (steps <= 0) return

        const increment = 1.0 / steps
        let t = 0

        const LUT = new Array(steps)

        const point = this.points[0].pathPoint
        const nextPoint = this.points[1].pathPoint

        for (let index = 0; index < steps; index++) {
            LUT[index] = calculateBezier(t, point.coords, point.controls[1].coords, nextPoint.controls[0].coords, nextPoint.coords)
            t += increment
        }

        return LUT
    }
}