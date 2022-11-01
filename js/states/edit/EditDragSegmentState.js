import SegmentControl from "../../controls/SegmentControl.js"
import Control from "../../core/Control.js"
import State from "../../core/State.js"
import { emitter } from "../../utils/index.js"
import EditState from "./EditState.js"

let isInitalDrag = true
let segment = null
let deltaX = 0
let deltaY = 0

const select = {
}

const actions = {
    onDragStart(event) {
        if (event.target.dataset.svgName === 'segmentControl') {
            isInitalDrag = false
            segment = this.editor.getControlById(+event.target.dataset.svgId, [this.editor.collections.segmentsCollection])
            return
        }

        this.stateMachine.next()
    },
    onDragging(lastEvent, event) {
        if (lastEvent) {
            const dx = event.offsetX - lastEvent.offsetX
            const dy = event.offsetY - lastEvent.offsetY
            deltaX += dx
            deltaY += dy

            segment.move(dx, dy, true)
        }
    },
    onDragEnd() {
        emitter.emit('saveCommands', [segment], SegmentControl.prototype.move, [-deltaX, -deltaY, true])
        deltaX = 0
        deltaY = 0
        if (isInitalDrag) return
        isInitalDrag = true
        this.stateMachine.next()
    },
    onKeyDown(event) {
        if (event.code === 'Escape') {
            this.select.deselectAll()
            this.select.selection = []
            this.select.stateMachine.setState('select')
        }
    }
}

export default new State(
    {
        name: 'editDragSegment',
        select,
        fireEvent: false,
        actions
    },
    {
        beforeStart: () => {

        },
        beforeEnd: () => {

        }
    },
    EditState
)