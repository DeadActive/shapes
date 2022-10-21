import HandlerControl from "../controls/HandlerControl.js"
import PathControl from "../controls/PathControl.js"
import PointControl from "../controls/PointControl.js"
import SegmentControl from "../controls/SegmentControl.js"
import SvgLine from "../svg/SvgLine.js"
import { SvgPath, SvgPathPoint, SvgPathPointControl } from "../svg/SvgPath.js"
import { isPointInBox } from "../utils/index.js"

export default class Shape {
    constructor(containers, pathConfig, zIndex) {
        this.path = new SvgPath(pathConfig)
        this.pathControl = new PathControl(this.path)
        this.containers = containers

        this.pointControls = []
        this.handlerControls = []
        this.segmentControls = []
        this.isSelected = false

        this.containers.pathContainer.addChild(this.path)
        this.containers.pathControlsContainer.addChild(this.pathControl.svgEl)

        this._zIndex = 0
        this.zIndex = zIndex
    }

    addPoint(coords, controls = null) {
        const leftCoords = controls ? controls[0] : coords
        const rightCoords = controls ? controls[1] : coords

        const leftControl = new SvgPathPointControl(leftCoords)
        const rightControl = new SvgPathPointControl(rightCoords)
        const pathPoint = new SvgPathPoint(coords, [leftControl, rightControl])

        const leftLine = new SvgLine(coords, leftCoords, { style: { 'pointerEvents': 'none' }, id: 'line' })
        const leftHandler = new HandlerControl(leftControl, leftLine)
        const rightLine = new SvgLine(coords, rightCoords, { style: { 'pointerEvents': 'none' }, id: 'line' })
        const rightHandler = new HandlerControl(rightControl, rightLine)
        const pointControl = new PointControl(pathPoint, [leftHandler, rightHandler])

        leftHandler.bindPointControl(pointControl)
        leftHandler.bindSibling(rightHandler)
        rightHandler.bindPointControl(pointControl)
        rightHandler.bindSibling(leftHandler)

        this.containers.pointControlsContainer.addChild(pointControl.svgEl)
        this.containers.handlerControlsContainer.addChild(leftHandler.svgEl)
        this.containers.handlerControlsContainer.addChild(rightHandler.svgEl)
        this.containers.handlerControlsContainer.addChild(leftLine)
        this.containers.handlerControlsContainer.addChild(rightLine)

        this.pointControls.push(pointControl)
        this.handlerControls.push(leftHandler, rightHandler)

        this.path.addPoint(pathPoint)

        this.calculateSegments()
        this.containers.pointControlsContainer.repaint()
        this.containers.handlerControlsContainer.repaint()
        this.containers.pathControlsContainer.repaint()
        this.path.repaint()

        this.pathControl.update()

        return pointControl
    }

    removePoint(point) {
        const pointIndex = this.pointControls.findIndex(p => p === point)
        if (pointIndex === -1) return

        this.pointControls.splice(pointIndex, 1)

        const handlerIndex = this.handlerControls.findIndex(h => h === point.handlers[0])
        this.handlerControls.splice(handlerIndex, 2)

        this.containers.pointControlsContainer.removeChild(point.svgEl)
        this.containers.handlerControlsContainer.removeChild(point.handlers[0].svgEl)
        this.containers.handlerControlsContainer.removeChild(point.handlers[1].svgEl)
        this.containers.handlerControlsContainer.removeChild(point.handlers[0].lineElement)
        this.containers.handlerControlsContainer.removeChild(point.handlers[1].lineElement)

        this.path.removePoint(point.pathPoint)

        this.calculateSegments()
        this.containers.pointControlsContainer.repaint()
        this.containers.handlerControlsContainer.repaint()
        this.path.repaint()

        this.pathControl.update()
    }

    insertPointAfter(beforePoint, x, y) {
        const index = this.pointControls.findIndex(p => p === beforePoint)

        if (index === -1) return null

        const coords = [x, y]
        const controls = [[x, y], [x, y]]

        const point = new Point(coords, [], this.controlsContainer, this)

        const handler1 = new Handler(point, controls[0], this.controlsContainer, this)
        const handler2 = new Handler(point, controls[1], this.controlsContainer, this)

        point.controls = [handler1, handler2]

        this.points.splice(index, 0, point)

        this.handlers.push(handler1)
        this.handlers.push(handler2)

        point.draw()
        handler1.draw()
        handler2.draw()

        this.calculateSegments()
        this.repaint()

        return point
    }

    split(prevPointControl, nextPointControl, t) {
        const prevPoint = prevPointControl.pathPoint
        const nextPoint = nextPointControl.pathPoint

        const pointCoords = calculateBezier(t, prevPoint.coords, prevPoint.controls[1].coords, nextPoint.controls[0].coords, nextPoint.coords)
        const point = this.shape.insertPointAfter(nextPoint, pointCoords[0], pointCoords[1])

        point.isBezier = prevPoint.isBezier || nextPoint.isBezier

        if (point.isBezier) {
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
        }

        this.shape.repaintAll()
    }

    calculateSegments() {
        if (this.pointControls.length < 2) return

        this.segmentControls.forEach(s => {
            this.containers.segmentControlsContainer.removeChild(s.svgEl)
        })

        this.segmentControls = []

        for (let index = 0; index < this.pointControls.length - 1; index++) {
            const point = this.pointControls[index]
            const nextPoint = this.pointControls[index + 1]

            const segment = new SegmentControl([point, nextPoint], {})
            this.segmentControls.push(segment)
            this.containers.segmentControlsContainer.addChild(segment.svgEl)
        }

        if (this.path.isClosed) {
            const firstPoint = this.pointControls[0]
            const lastPoint = this.pointControls[this.pointControls.length - 1]

            const segment = new SegmentControl([lastPoint, firstPoint], {})
            this.segmentControls.push(segment)
            this.containers.segmentControlsContainer.addChild(segment.svgEl)
        }
    }

    closePath() {
        this.path.isClosed = true
        this.calculateSegments()
        this.path.repaint()
    }

    openPath() {
        this.path.isClosed = false
        this.calculateSegments()
        this.path.repaint()
    }

    getControlById(id) {
        let result = null

        result = this.pointControls.find(p => p.id === id)
        if (result) return result

        result = this.handlerControls.find(p => p.id === id)
        if (result) return result

        result = this.segmentControls.find(p => p.id === id)
        if (result) return result

        if (id === this.path.id) return this.pathControl

        return result
    }

    getNextPointControl(pointControl) {
        const pointIndex = this.pointControls.findIndex(p => p === pointControl)
        if (pointIndex < 0) return
        if (this.path.isClosed && pointIndex === this.pointControls[this.pointControls.length - 1]) return this.pointControls[0]
        return this.pointControls[pointControl + 1]
    }

    getPrevPointControl(pointControl) {
        const pointIndex = this.pointControls.findIndex(p => p === pointControl)
        if (pointIndex < 0) return
        if (this.path.isClosed && pointIndex === 0) return this.pointControls[this.pointControls.length - 1]
        return this.pointControls[pointIndex - 1]
    }

    getControlsInsideBox(box) {
        const x = box.x < box.ex ? box.x : box.ex
        const y = box.y < box.ey ? box.y : box.ey
        const ex = box.x < box.ex ? box.ex : box.x
        const ey = box.y < box.ey ? box.ey : box.y

        const points = this.pointControls.filter(p => {
            return isPointInBox(p.svgEl.x, p.svgEl.y, x, y, ex, ey)
        })

        const handlers = this.handlerControls.filter(h => {
            return isPointInBox(h.svgEl.x, h.svgEl.y, x, y, ex, ey)
        })

        return [...points, ...handlers]
    }

    update() {
        this.pathControl.update()
        this.pointControls.forEach(p => p.update())
    }

    unselectAll() {
        this.pointControls.forEach(p => p.setSelected(false))
        this.handlerControls.forEach(p => p.setSelected(false))
        this.segmentControls.forEach(p => p.setSelected(false))
        this.pathControl.setSelected(false)
    }

    toggleControlsVisible(value) {
        this.pointControls.forEach(p => p.setVisible(value))
        this.segmentControls.forEach(p => p.setVisible(value))
    }

    get selected() {
        return this.isSelected
    }

    set selected(value) {
        this.isSelected = value
    }

    get zIndex() {
        return this._zIndex
    }

    set zIndex(value) {
        this._zIndex = value
        this.path.zIndex = value
    }
}