import { distance, vectorDistance } from "../utils/index.js"
import Action from "./Action.js"

export default class SegmentActions extends Action {
    constructor(actionManager) {
        super(actionManager)
        this.initEvents({
            dragStart: this.onDragStart.bind(this),
            dragging: this.onDragging.bind(this),
            dragEnd: this.onDragEnd.bind(this),
            mouseMove: this.onMouseMove.bind(this)
        })

        this.currentTarget = null
    }

    onDragStart({ event }) {
        if (event.target.dataset.svgName === 'segmentControl') {
            this.actionManager.emitter.emit('stopSelection')
            this.currentTarget = this.actionManager.editor.getControlById(+event.target.dataset.svgId)

            if (this.actionManager.editor.mode === 'bend') {
                this.currentTarget.points.forEach(p => {
                    p.isBezier = true
                    p.setSelected(true)
                })
            }
        }
    }

    onDragging({ event, lastEvent }) {
        if (this.currentTarget === null) return

        let dx = event.offsetX - lastEvent.offsetX
        let dy = event.offsetY - lastEvent.offsetY

        if (this.actionManager.editor.mode === 'edit') {
            this.currentTarget.move(dx, dy)

            return this.actionManager.editor.repaint()
        }
        if (this.actionManager.editor.mode === 'bend') {
            const leftPoint = this.currentTarget.points[0]
            const rightPoint = this.currentTarget.points[1]

            leftPoint.handlers[1].move(dx, dy)
            rightPoint.handlers[0].move(dx, dy)

            if (leftPoint.handlers[0].mode === 'mirrorAll') {
                leftPoint.handlers[0].move(-dx, -dy)
            }

            if (rightPoint.handlers[1].mode === 'mirrorAll') {
                rightPoint.handlers[1].move(-dx, -dy)
            }

            return this.actionManager.editor.repaint()
        }

        this.actionManager.emitter.emit('resumeSelection')
        this.currentTarget = null
    }

    onDragEnd({ event }) {
        this.actionManager.editor.repaint()

        this.actionManager.emitter.emit('resumeSelection')
        this.currentTarget = null
    }

    onMouseMove({ event }) {
        if (this.actionManager.editor.mode === 'draw' && event.target.dataset.svgName === 'segmentControl') {
            const segment = this.actionManager.editor.getControlById(+event.target.dataset.svgId)

            let d = 100
            const cursor = [event.offsetX, event.offsetY]

            const lutIterations = Math.ceil(segment.getLength() / 5)
            const LUT = segment.getLUT(lutIterations)
            LUT.pop()
            LUT.shift()

            let pointIndex = 0

            for (let index = 0; index < LUT.length; index++) {
                const coords = LUT[index]
                const q = distance(coords, cursor)

                if (q < d) {
                    d = q
                    pointIndex = index
                }
            }

            const resultPoint = LUT[pointIndex]

            this.actionManager.editor.ghostPoint.moveTo(resultPoint[0], resultPoint[1])
            this.actionManager.editor.ghostPoint.repaint()

            return
        }

        this.actionManager.editor.ghostPoint.moveTo(-999, -999)
        this.actionManager.editor.ghostPoint.repaint()
    }
}