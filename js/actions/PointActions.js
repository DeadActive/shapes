import Action from "./Action.js"
import Vector2 from '../utils/vector2.js'

export default class PointActions extends Action {
    constructor(actionManager) {
        super(actionManager)
        this.initEvents({
            dragStart: this.onDragStart.bind(this),
            dragging: this.onDragging.bind(this),
            dragEnd: this.onDragEnd.bind(this),
            doubleClick: this.onDoubleClick.bind(this)
        })

        this.currentTarget = null
        this.currentPoint = null
        this.startEvent = null
    }

    onDoubleClick({ event }) {
        if (event.target.dataset.svgName === 'pointControl' && this.actionManager.editor.mode === 'edit') {
            const id = +event.target.dataset.svgId
            const pointControl = this.actionManager.editor.getControlById(id)

            pointControl.isBezier = !pointControl.isBezier

            if (!pointControl.isBezier) {
                pointControl.handlers.forEach(h => {
                    h.moveTo(pointControl.svgEl.x, pointControl.svgEl.y)
                    h.setVisible(false)
                })
            } else {
                const shape = this.actionManager.editor.getShapeByControlId(id)

                const point = pointControl.pathPoint
                const prevPoint = shape.path.getPrevPoint(point)
                const nextPoint = shape.path.getNextPoint(point)

                if (!prevPoint || !nextPoint) {
                    pointControl.handlers.forEach(h => {
                        h.moveTo(pointControl.svgEl.x, pointControl.svgEl.y)
                        h.mode = 'mirrorAll'
                        h.setVisible(true)
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

                pointControl.handlers[0].moveTo(...scaledPoint)
                pointControl.handlers[1].moveTo(...scaledPointMirror)

                pointControl.handlers[0].mode = 'mirrorAll'
                pointControl.handlers[1].mode = 'mirrorAll'

                pointControl.handlers.forEach(h => {
                    h.setVisible(true)
                })
            }

            this.actionManager.editor.repaint()
        }
    }

    onDragStart({ event }) {
        if (this.actionManager.select.selection.length > 0
            && event.target.dataset.svgName === 'pointControl') {
            this.actionManager.emitter.emit('stopSelection')
            this.currentTarget = event.target
            this.currentPoint = this.actionManager.editor.getControlById(+event.target.dataset.svgId)
            this.startEvent = event
        }
    }

    onDragging({ event, lastEvent }) {
        if (this.currentTarget === null) return

        let dx = event.offsetX - lastEvent.offsetX
        let dy = event.offsetY - lastEvent.offsetY

        if (this.actionManager.editor.mode === 'edit') {
            const selection = this.actionManager.select.selection

            // const isHorizontal = Math.abs(event.offsetX - this.startEvent.offsetX) > Math.abs(event.offsetY - this.startEvent.offsetY)

            // if (event.shiftKey) {
            //     dy = isHorizontal ? 0 : dy
            //     dx = !isHorizontal ? 0 : dx
            // }

            if (selection.length > 0) {
                selection.forEach(s => {
                    s.move(dx, dy)
                })

                return this.actionManager.editor.repaint()
            }
        }

        if (this.actionManager.editor.mode === 'bend') {
            const handlers = this.currentPoint.handlers
            this.currentPoint.isBezier = true

            handlers[0].mode = 'mirrorAll'
            handlers[1].mode = 'mirrorAll'

            handlers[0].move(dx, dy)

            const cx = handlers[0].svgEl.x
            const cy = handlers[0].svgEl.y

            const px = this.currentPoint.svgEl.x
            const py = this.currentPoint.svgEl.y

            const x = -cx + 2 * px
            const y = -cy + 2 * py

            handlers[1].moveTo(x, y)
            return this.actionManager.editor.repaint()
        }


        this.actionManager.emitter.emit('resumeSelection')
        this.currentTarget = null
        this.currentPoint = null
        this.startEvent = null
    }

    onDragEnd({ event }) {
        this.actionManager.emitter.emit('resumeSelection')
        this.currentTarget = null
        this.currentPoint = null
        this.startEvent = null
    }
}