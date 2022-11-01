import State from "../../core/State.js"
import BendState from "./BendState.js"

let isInitalDrag = true

const select = {
    onMouseDown(event) {
        console.log(event.target)

        const id = +event.target.dataset.svgId
        if (this.selection.findIndex(s => s.svgElement.id === id) !== -1) return (isInitalDrag = true)

        if (event.target.dataset.svgName === 'handlerControl') {
            return this.stateMachine.setState('bendDragHandler')
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

            this.select.selection.forEach(s => s.bend(dx, dy))
        }
    },
    onDragEnd(event) {
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
        name: 'bendDrag',
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