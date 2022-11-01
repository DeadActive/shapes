import State from "../../core/State.js"
import { normalizeBox } from "../../utils/index.js"

const select = {
    onDragStart(event) {
        if (event.target.dataset.svgName === 'segmentControl') {
            return this.stateMachine.setState('bendDragSegment')
        }
        if (event.target.dataset.svgName === 'handlerControl') {
            return this.stateMachine.setState('bendDragHandler')
        }

        const id = +event.target.dataset.svgId
        const result = this.editor.getControlById(id, [this.editor.collections.pointsCollection])

        if (result) {
            this.selection = [result]
            this.selectAll()
            return this.stateMachine.setState('bendDrag')
        }

        const { offsetX, offsetY } = event
        this.selectBox.setXY(offsetX, offsetY)
    },
    onDragging(lastEvent, event) {
        const { offsetX, offsetY } = event
        this.selectBox.setExEy(offsetX, offsetY)
    },
    onDragEnd(event) {
        const box = normalizeBox(this.selectBox.getBox())

        this.deselectAll()
        this.selection = this.editor.getControlsInBox(box, [this.editor.collections.pointsCollection])
        this.selectAll()

        this.selectBox.x = 0
        this.selectBox.y = 0
        this.selectBox.setExEy(0, 0)

        if (this.selection.length > 0) {
            this.stateMachine.setState('bendDrag')
        }
    },
    onMouseDown(event) {
        const id = +event.target.dataset.svgId
        const result = this.editor.getControlById(id, [this.editor.collections.pointsCollection])

        this.deselectAll()

        if (result) {
            this.selection = [result]
            this.selectAll()
            this.stateMachine.setState('bendDrag')
        }
    }
}

const actions = {
    onKeyDown(event) {
        if (event.code === 'Escape') {
            this.select.deselectAll()
            this.select.selection = []
            this.select.stateMachine.setState('select')
        }
        if (event.code === 'Backspace') {
            this.select.deselectAll()
            this.select.selection.forEach(s => s.remove())
        }
    },

}

export default new State(
    {
        name: 'bend',
        fireEvent: true,
        select,
        actions
    },
    {
        beforeStart: () => {

        },
        beforeEnd: () => {

        }
    }

)