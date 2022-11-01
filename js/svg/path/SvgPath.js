import { defined, throttle, calculateBezier, calculateQuadraticBezier, emitter } from "../../utils/index.js";
import SvgElement from "../SvgElement.js";
import PathControl from "./PathControl.js";
import PathPoint from "./PathPoint.js";
import PathPointCollection from "./PathPointCollection.js";
import PathSegmentCollection from "./PathSegmentCollection.js";

export default class SvgPath extends SvgElement {
    constructor(points, options, svgConfig) {
        super({
            tag: 'path',
            name: 'path',
            attrs: {
                fill: '#0000ff',
                stroke: '#000000',
                'fill-opacity': 0.4,
                'stroke-width': 1,
                'stroke-opacity': 1
            },
            ...svgConfig
        })

        this.pointCollection = new PathPointCollection(points, this)
        this.points = this.pointCollection.points
        this.segmentCollection = new PathSegmentCollection(null, this)
        this.isClosed = defined(options?.isClosed) ? options.isClosed : false
        this.update = throttle(this._update.bind(this), 10)
    }

    closePath() {
        this.isClosed = true
        this.update()
        this.segmentCollection.update()
    }

    openPath() {
        this.isClosed = false
        this.update()
        this.segmentCollection.update()
    }

    getBBox() {
        return this.el.getBBox()
    }

    move(dx, dy) {
        this.pointCollection.move(dx, dy)
    }

    split(prevPoint, t) {
        const nextPoint = this.pointCollection.getNextPoint(prevPoint)

        const pointCoords = calculateBezier(t, prevPoint.coords, prevPoint.controls[1].coords, nextPoint.controls[0].coords, nextPoint.coords)

        const point = this.pointCollection.createPointAfter(nextPoint, pointCoords)

        const leftHandlers = [
            calculateBezier(t, prevPoint.coords, prevPoint.coords, prevPoint.controls[1].coords, prevPoint.controls[1].coords),
            calculateQuadraticBezier(t, prevPoint.coords, prevPoint.controls[1].coords, nextPoint.controls[0].coords)
        ]
        const rightHandlers = [
            calculateBezier(1 - t, nextPoint.coords, nextPoint.coords, nextPoint.controls[0].coords, nextPoint.controls[0].coords),
            calculateQuadraticBezier(1 - t, nextPoint.coords, nextPoint.controls[0].coords, prevPoint.controls[1].coords)
        ]

        prevPoint.controls[1].moveTo(leftHandlers[0][0], leftHandlers[0][1])
        point.controls[0].moveTo(leftHandlers[1][0], leftHandlers[1][1])
        point.controls[1].moveTo(rightHandlers[1][0], rightHandlers[1][1])
        nextPoint.controls[0].moveTo(rightHandlers[0][0], rightHandlers[0][1])

        point.isBezier = true
        return point
    }

    _update() {
        let d = ''

        if (this.points.length < 2) {
            return this.setAttr('d', d)
        }

        d = this.points.map((point, index) => {
            if (index === 0) return `M ${point.coords[0]} ${point.coords[1]} C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]}`
            if (index === this.points.length - 1)
                return `${point.controls[0].coords[0]} ${point.controls[0].coords[1]} ${point.coords[0]} ${point.coords[1]}`
            return `${point.controls[0].coords[0]} ${point.controls[0].coords[1]} ${point.coords[0]} ${point.coords[1]} C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]}`
        }).join(' ')

        if (this.isClosed) {
            const firstPoint = this.points[0]
            const lastPoint = this.points[this.points.length - 1]

            d += `C ${lastPoint.controls[1].coords[0]} ${lastPoint.controls[1].coords[1]} ${firstPoint.controls[0].coords[0]} ${firstPoint.controls[0].coords[1]} ${firstPoint.coords[0]} ${firstPoint.coords[1]}`
        }

        this.setAttr('d', d)

        // console.log("✅ [UPDATE] SvgPath", this)
        emitter.emit('update', this)
    }

}