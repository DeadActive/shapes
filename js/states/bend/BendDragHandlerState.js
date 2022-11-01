import State from "../../core/State.js"
import BendState from "./BendState.js"

let isInitalDrag = true
let handler = null

const select = {
}

const actions = {
    onDragStart(event) {
        if (event.target.dataset.svgName === 'handlerControl') {
            isInitalDrag = false
            handler = this.editor.getControlById(+event.target.dataset.svgId, [this.editor.collections.handlersCollection])
            return
        }

        this.stateMachine.next()
    },
    onDragging(lastEvent, event) {
        if (lastEvent) {
            const dx = event.offsetX - lastEvent.offsetX
            const dy = event.offsetY - lastEvent.offsetY

            handler.mode = 'mirrorAll'
            handler.move(dx, dy, true)
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
        name: 'bendDragHandler',
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