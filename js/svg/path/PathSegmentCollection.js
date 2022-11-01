import { emitter, throttle } from "../../utils/index.js"
import PathSegment from "./PathSegment.js"

export default class PathSegmentCollection {
    constructor(segments, path) {
        this.segments = segments || []
        this.path = path
        this.update = throttle(this._update.bind(this), 10)
    }

    addSegment(segment) {
        this.segments.push(segment)
    }

    createSegment(points) {
        const segment = new PathSegment(points, this.path)
        this.addSegment(segment)
        return segment
    }

    clear() {
        this.segments = []
    }

    _update() {
        const points = this.path.pointCollection.points

        this.clear()

        if (points.length > 1) {
            for (let index = 0; index < points.length - 1; index++) {
                const point = points[index]
                const nextPoint = points[index + 1]

                this.createSegment([point, nextPoint])
            }

            if (this.path.isClosed) {
                const firstPoint = points[0]
                const lastPoint = points[points.length - 1]

                this.createSegment([lastPoint, firstPoint])
            }
        }

        console.log("✅ [UPDATE] PathSegmentCollection", this)
        emitter.emit('segmentsUpdate', this)
    }
}