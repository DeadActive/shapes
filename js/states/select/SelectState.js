import State from "../../core/State.js"
import { emitter, normalizeBox } from "../../utils/index.js"

const select = {
    onDragStart(event) {
        const id = +event.target.dataset.svgId
        const result = this.editor.getLayerControlById(id)

        if (result) {
            this.selection = [result]
            this.selectAll()
            emitter.emit('changeSelection')
            return this.stateMachine.setState('selectDrag')
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
        this.selection = this.editor.getControlsInBox(box, [this.editor.collections.layersCollection])
        this.selectAll()

        this.selectBox.x = 0
        this.selectBox.y = 0
        this.selectBox.setExEy(0, 0)

        if (this.selection.length > 0) {
            this.stateMachine.setState('selectDrag')
        }
        emitter.emit('changeSelection')
    },
    onMouseDown(event) {
        const id = +event.target.dataset.svgId
        const result = this.editor.getLayerControlById(id)

        this.deselectAll()

        if (result) {
            this.selection = [result]
            this.selectAll()
            this.stateMachine.setState('selectDrag')
        }

        emitter.emit('changeSelection')
    }
}

const actions = {
    onDoubleClick(event) {
        if (event.target.dataset.svgName === 'path') {
            this.deselectAll()
            this.select.selection = []
            this.select.stateMachine.setState('edit')
        }
    },

}

export default new State(
    {
        name: 'select',
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