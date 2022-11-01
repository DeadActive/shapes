import Control from "../../core/Control.js"
import State from "../../core/State.js"
import { emitter } from "../../utils/index.js"
import EditState from "./EditState.js"

let isInitalDrag = true
let deltaX = 0
let deltaY = 0


const select = {
    onMouseDown(event) {
        const id = +event.target.dataset.svgId
        if (this.selection.findIndex(s => s.svgElement.id === id) !== -1) return (isInitalDrag = true)

        if (event.target.dataset.svgName === 'handlerControl') {
            return this.stateMachine.setState('editDragHandler')
        }
        this.deselectAll()
        this.selection = []
        this.stateMachine.next()
    }
}

const actions = {
    onDragging(lastEvent, event) {
        if (lastEvent) {
            const dx = event.offsetX - lastEvent.offsetX
            const dy = event.offsetY - lastEvent.offsetY
            deltaX += dx
            deltaY += dy

            this.select.selection.forEach(s => s.move(dx, dy, true))
        }
    },
    onDragEnd(event) {
        emitter.emit('saveCommands', [...this.select.selection], Control.prototype.move, [-deltaX, -deltaY])
        deltaX = 0
        deltaY = 0
        if (isInitalDrag) return
        isInitalDrag = true
        this.stateMachine.next()
    },
    // onDoubleClick(event) {
    //     if (event.target.dataset.svgName === 'path') {
    //         this.select.deselectAll()
    //         this.select.selection = []
    //         this.stateMachine.setState('edit')
    //     }
    // },
    onKeyDown(event) {
        if (event.code === 'Escape') {
            this.select.deselectAll()
            this.select.selection = []
            this.select.stateMachine.setState('select')
        }
    },
    onKeyDown(event) {
        if (event.code === 'Backspace') {
            this.select.deselectAll()
            this.select.selection.forEach(s => s.remove())
        }
        if (event.code === 'Escape') {
            this.select.deselectAll()
            this.select.selection = []
            this.stateMachine.setState('select', this)
        }
    },
    onDoubleClick(event) {
        if (event.target.dataset.svgName === 'pointControl') {
            const id = +event.target.dataset.svgId
            this.select.selection = [this.editor.getControlById(id, [this.editor.collections.pointsCollection])]
            this.select.selection.forEach(s => s.autoHandlers())
            this.select.selectAll()
        }
    },
}

export default new State(
    {
        name: 'editDrag',
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