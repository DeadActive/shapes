import PathControl from "./PathControl.js"
import PathPoint from "./PathPoint.js"

export default class PathPointCollection {
    constructor(points, path) {
        this.path = path
        this.points = points || []
    }

    addPoint(point) {
        this.points.push(point)
        this.path.update()
        this.path.segmentCollection.update()
    }

    insertPoint(index, point) {
        this.points.splice(index, 0, point)
        this.path.update()
        this.path.segmentCollection.update()
    }

    insertPointAfter(beforePoint, point) {
        const index = this.findPoint(beforePoint)
        if (index !== -1) this.insertPoint(index, point)
    }

    createPointAfter(beforePoint, coords, controls = null) {
        const point = this.initPoint(coords, controls)
        this.insertPointAfter(beforePoint, point)
        return point
    }

    createPoint(coords, controls = null) {
        const point = this.initPoint(coords, controls)
        this.addPoint(point)
        return point
    }

    initPoint(coords, controls = null) {
        const leftCoords = controls ? controls[0] : coords.slice()
        const rightCoords = controls ? controls[1] : coords.slice()

        const leftControl = new PathControl(leftCoords, this.path)
        const rightControl = new PathControl(rightCoords, this.path, leftControl)
        leftControl.bindSibling(rightControl)

        const point = new PathPoint(coords.slice(), [leftControl, rightControl], this.path)
        leftControl.bindPoint(point)
        rightControl.bindPoint(point)

        return point
    }

    removePoint(point) {
        const index = this.findPoint(point)
        if (index !== -1) {
            this.points.splice(index, 1)
            this.path.update()
            this.path.segmentCollection.update()
        }
    }

    findPoint(point) {
        return this.points.findIndex(p => p === point)
    }

    isLastPoint(point) {
        console.log('asdasd', point)
        return this.findPoint(point) === this.points.length - 1
    }

    getNextPoint(point) {
        const index = this.findPoint(point)
        if (this.path.isClosed && index === this.points.length - 1) return this.points[0]
        return this.points[index + 1]
    }

    getPrevPoint(point) {
        const index = this.findPoint(point)
        if (this.path.isClosed && index === 0) return this.points[this.points.length - 1]
        return this.points[index - 1]
    }

    getLastPoint() {
        return this.points[this.points.length - 1]
    }

    move(dx, dy) {
        this.points.forEach(p => {
            p.move(dx, dy)
        })
    }
}