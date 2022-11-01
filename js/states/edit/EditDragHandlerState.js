import HandlerControl from "../../controls/HandlerControl.js"
import Control from "../../core/Control.js"
import State from "../../core/State.js"
import { emitter } from "../../utils/index.js"
import EditDragState from "./EditDragState.js"

let isInitalDrag = true
let handler = null
let deltaX = 0
let deltaY = 0

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
        if (event.metaKey || event.ctrlKey) {
            handler.mode = 'default'
            handler.sibling.mode = 'default'
        }
        if (event.altKey) {
            handler.mode = 'mirrorAngle'
            handler.sibling.mode = 'mirrorAngle'
        }

        if (lastEvent) {
            const dx = event.offsetX - lastEvent.offsetX
            const dy = event.offsetY - lastEvent.offsetY
            deltaX += dx
            deltaY += dy

            handler.move(dx, dy, true)
        }
    },
    onDragEnd() {
        emitter.emit('saveCommands', [handler], HandlerControl.prototype.move, [-deltaX, -deltaY, true])
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
        name: 'editDragHandler',
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
    EditDragState
)