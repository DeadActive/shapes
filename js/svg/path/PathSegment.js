import { calculateBezier, distance } from "../../utils/index.js"

export default class PathSegment {
    constructor(pathPoints, path) {
        this.pathPoints = pathPoints
        this.path = path
    }

    bindElement(element) {
        this.pathPoints[0].bindElement(element)
        this.pathPoints[0].controls[0].bindElement(element)
        this.pathPoints[0].controls[1].bindElement(element)
        this.pathPoints[1].bindElement(element)
        this.pathPoints[1].controls[0].bindElement(element)
        this.pathPoints[1].controls[0].bindElement(element)
    }

    unbindElement(element) {
        this.pathPoints[0].unbindElement(element)
        this.pathPoints[0].controls[0].unbindElement(element)
        this.pathPoints[0].controls[1].unbindElement(element)
        this.pathPoints[1].unbindElement(element)
        this.pathPoints[1].controls[0].unbindElement(element)
        this.pathPoints[1].controls[0].unbindElement(element)
    }

    move(dx, dy) {
        this.pathPoints[0].move(dx, dy)
        this.pathPoints[1].move(dx, dy)
        if (this.path) this.path.update()
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

        const point = this.pathPoints[0]
        const nextPoint = this.pathPoints[1]

        for (let index = 0; index < steps; index++) {
            LUT[index] = calculateBezier(t, point.coords, point.controls[1].coords, nextPoint.controls[0].coords, nextPoint.coords)
            t += increment
        }

        return LUT
    }

    remove() { }
}