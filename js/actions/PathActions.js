import Action from "./Action.js"
import Vector2 from '../utils/vector2.js'
import PathControl from "../controls/PathControl.js"

export default class PathActions extends Action {
    constructor(actionManager) {
        super(actionManager)
        this.initEvents({
            dragStart: this.onDragStart.bind(this),
            dragging: this.onDragging.bind(this),
            dragEnd: this.onDragEnd.bind(this),
            doubleClick: this.onDoubleClick.bind(this)
        })

        this.currentTarget = null
    }

    onDoubleClick({ event }) {
        if (event.target.dataset.svgName === 'path' && event.target.dataset.svgName === 'path' && this.actionManager.editor.mode !== 'draw') {
            this.actionManager.editor.mode = 'edit'
            this.actionManager.select.currentShape = this.actionManager.editor.getShapeByControlId(+event.target.dataset.svgId)
        }
    }

    onDragStart({ event }) {
        if (this.actionManager.select.selection[0] instanceof PathControl
            && event.target.dataset.svgName === 'path'
            && this.actionManager.editor.mode === 'select'
        ) {
            this.actionManager.emitter.emit('stopSelection')
            this.currentTarget = event.target
        }
    }

    onDragging({ event, lastEvent }) {
        if (this.currentTarget === null) return

        const selection = this.actionManager.select.selection

        if (selection.length > 0) {
            const dx = event.offsetX - lastEvent.offsetX
            const dy = event.offsetY - lastEvent.offsetY

            selection.forEach(s => {
                s.move(dx, dy)
            })

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
}