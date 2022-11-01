import Control from "../core/Control.js";
import SvgCircle from "../svg/SvgCircle.js";
import { defined } from "../utils/index.js";
import Vector2 from "../utils/vector2.js";

export default class PointControl extends Control {
    constructor(pathPoint, handlers, collection, layer, options) {
        const svgElement = new SvgCircle(
            pathPoint.coords[0],
            pathPoint.coords[1],
            {
                name: 'pointControl',
                ...options?.element
            },
        )

        super(pathPoint, svgElement, collection, options?.control)

        this.handlers = handlers
        this.pathElement.bindElement(this)
        this.layer = layer

        if (handlers) {
            this.handlers[0].bindPointControl(this)
            this.handlers[1].bindPointControl(this)
        }
    }

    get isBezier() {
        return this.pathElement.isBezier
    }

    set isBezier(value) {
        this.pathElement.isBezier = value
    }

    update() {
        this.svgElement.moveTo(this.pathElement.coords[0], this.pathElement.coords[1])
    }

    show() {
        super.show()
    }

    select() {
        super.select()
        console.log(this)
        if (this.isBezier) {
            this.show()
        }
    }

    deselect() {
        super.deselect()
        this.hide()
    }

    hide() {
        super.hide()
        this.handlers[0].hide()
        this.handlers[1].hide()
    }

    setVisible(value) {
        super.setVisible(value)
        this.handlers[0].setVisible(value)
        this.handlers[1].setVisible(value)
    }

    bend(dx, dy) {
        this.isBezier = true
        this.handlers[0].mode = 'mirrorAll'
        this.handlers[1].mode = 'mirrorAll'
        this.handlers[0].move(dx, dy, true)
        // this.handlers[1].move(dx, dy, true)
    }

    remove() {
        super.remove()
        this.handlers[0].remove()
        this.handlers[1].remove()
    }

    autoHandlers() {
        this.isBezier = !this.isBezier

        if (!this.isBezier) {
            this.handlers[0].moveTo(this.pathElement.coords[0], this.pathElement.coords[1])
            this.hide()
        } else {
            const point = this.pathElement
            const prevPoint = this.pathElement.path.pointCollection.getPrevPoint(point)
            const nextPoint = this.pathElement.path.pointCollection.getNextPoint(point)

            console.log(point, nextPoint, prevPoint)

            if (!prevPoint || !nextPoint) {
                this.handlers.forEach(h => {
                    h.moveTo(...point.coords)
                    h.mode = 'mirrorAll'
                })
                return
            }

            const centerX = (prevPoint.coords[0] + nextPoint.coords[0]) / 2
            const centerY = (prevPoint.coords[1] + nextPoint.coords[1]) / 2

            const pointVector = new Vector2(point.coords)
            const centerVector = new Vector2([centerX, centerY])
            const segmentVector = Vector2.fromPoints(prevPoint.coords, nextPoint.coords)

            const distanceToCenter = pointVector.distance(centerVector)
            const segmentLength = segmentVector.magnitude()

            const scalarCoef = distanceToCenter / segmentLength
            const moveVector = Vector2.fromPoints([centerX, centerY], point.coords)

            const resultVector = moveVector.addVectorCoords(prevPoint.coords)
            const moveToCenterVector = Vector2.fromPoints(point.coords, resultVector.toArray()).scalarProduct(scalarCoef)

            const scaledPoint = pointVector.addVector(moveToCenterVector).toArray()
            const scaledPointMirror = pointVector.addVector(moveToCenterVector.scalarProduct(-1)).toArray()

            this.handlers[0].moveTo(...scaledPoint)
            this.handlers[1].moveTo(...scaledPointMirror)
            this.handlers[0].mode = 'mirrorAll'
            this.handlers[1].mode = 'mirrorAll'
        }
    }
}