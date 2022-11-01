import State from "../../core/State.js"
import BendState from "./BendState.js"

let isInitalDrag = true
let segment = null

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

            segment.bend(dx, dy)
        }
    },
    onDragEnd() {
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
        name: 'bendDragSegment',
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
    BendState
)