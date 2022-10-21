import Vector2 from "../utils/vector2.js"
import Action from "./Action.js"

export default class HandlerActions extends Action {
    constructor(actionManager) {
        super(actionManager)
        this.initEvents({
            dragStart: this.onDragStart.bind(this),
            dragging: this.onDragging.bind(this),
            dragEnd: this.onDragEnd.bind(this)
        })

        this.currentHandler = null
    }

    onDragStart({ event }) {
        if (event.target.dataset.svgName === 'handlerControl') {
            this.actionManager.emitter.emit('stopSelection')
            this.currentHandler = this.actionManager.editor.getControlById(+event.target.dataset.svgId)
        }
    }

    onDragging({ event, lastEvent }) {
        if (this.currentHandler === null) return

        if (event.metaKey || event.ctrlKey) {
            this.currentHandler.mode = 'default'
            this.currentHandler.sibling.mode = 'default'
        }
        if (event.altKey) {
            this.currentHandler.mode = 'mirrorAngle'
            this.currentHandler.sibling.mode = 'mirrorAngle'
        }

        if (this.actionManager.editor.mode === 'bend') {
            this.currentHandler.mode = 'mirrorAll'
            this.currentHandler.sibling.mode = 'mirrorAll'
        }

        const dx = event.offsetX - lastEvent.offsetX
        const dy = event.offsetY - lastEvent.offsetY

        if (this.currentHandler.mode === 'default') {
            this.currentHandler.move(dx, dy)
        }
        if (this.currentHandler.mode === 'mirrorAll') {
            this.currentHandler.move(dx, dy)

            const cx = this.currentHandler.svgEl.x
            const cy = this.currentHandler.svgEl.y

            const px = this.currentHandler.pointControl.svgEl.x
            const py = this.currentHandler.pointControl.svgEl.y

            const x = -cx + 2 * px
            const y = -cy + 2 * py

            this.currentHandler.sibling.moveTo(x, y)
        }
        if (this.currentHandler.mode === 'mirrorAngle') {
            this.currentHandler.move(dx, dy)

            const cx = this.currentHandler.svgEl.x
            const cy = this.currentHandler.svgEl.y

            const px = this.currentHandler.pointControl.svgEl.x
            const py = this.currentHandler.pointControl.svgEl.y

            const sx = this.currentHandler.sibling.svgEl.x
            const sy = this.currentHandler.sibling.svgEl.y

            const mx = -cx + 2 * px
            const my = -cy + 2 * py

            const pointToSiblingVector = Vector2.fromPoints([px, py], [sx, sy])
            const pointToMirrorVector = Vector2.fromPoints([mx, my], [px, py])
            const addVector = pointToSiblingVector.normalize().addVector(pointToMirrorVector.normalize())

            const deltaVector = addVector.scalarProduct(pointToSiblingVector.magnitude())

            const x = sx - deltaVector.x
            const y = sy - deltaVector.y

            this.currentHandler.sibling.moveTo(x, y)
        }

        this.actionManager.editor.repaint()
    }

    onDragEnd({ event }) {
        this.actionManager.emitter.emit('resumeSelection')
        this.currentTarget = null
        this.currentHandler = null
    }
}