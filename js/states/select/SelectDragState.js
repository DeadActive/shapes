import LayerControl from "../../controls/LayerControl.js"
import Control from "../../core/Control.js"
import State from "../../core/State.js"
import Editor from "../../Editor.js"
import { emitter, normalizeBox } from "../../utils/index.js"
import SelectState from "./SelectState.js"

let isInitalDrag = true
let deltaX = 0
let deltaY = 0

const select = {
    onMouseDown(event) {
        if (this.selection.findIndex(s => s.path.id === +event.target.dataset.svgId) !== -1) return (isInitalDrag = true)
        this.deselectAll()
        this.selection = []
        emitter.emit('changeSelection')
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

            this.select.selection.forEach(s => s.move(dx, dy))
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
    onDoubleClick(event) {
        if (event.target.dataset.svgName === 'path') {
            this.select.deselectAll()
            this.select.selection = []
            this.stateMachine.setState('edit')
        }
    },
    onKeyDown(event) {
        if (event.code === 'Backspace') {
            emitter.emit('saveCommands', [this.editor], Editor.prototype.addLayers, [[...this.select.selection]])
            this.select.selection.forEach(s => s.remove())
        }
        if (event.key === '[') {
            if (event.metaKey || event.ctrlKey) return this.select.selection.forEach(s => s.path.moveBack())
            this.select.selection.forEach(s => s.path.sendToBack())
        }
        if (event.key === ']') {
            if (event.metaKey || event.ctrlKey) return this.select.selection.forEach(s => s.path.moveFront())
            this.select.selection.forEach(s => s.path.bringToFront())
        }
    }
}

export default new State(
    {
        name: 'selectDrag',
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
    SelectState
)