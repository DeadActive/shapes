import State from "../../core/State.js"
import { normalizeBox } from "../../utils/index.js"

const select = {
}

const actions = {
    onKeyDown(event) {
        if (event.code === 'Escape') {
            this.select.deselectAll()
            this.select.selection = []
            this.select.stateMachine.setState('select')
        }
    },
    onMouseDown(event) {
        if (!this.editor.rootContainer.el.contains(event.target)) return

        if (event.target.dataset.svgName === 'segmentControl') {
            this.stateMachine.setState('drawSplit')
            return this.stateMachine.currentState.call(this, 'actions', 'onMouseDown', event)
        }

        if (event.target.dataset.svgName === 'pointControl') {
            const point = this.editor.getControlById(+event.target.dataset.svgId, [this.editor.collections.pointsCollection])
            if (!point.layer.path.isClosed && point.layer.path.pointCollection.isLastPoint(point.pathElement)) {
                console.log('lp')
                this.stateMachine.setState('drawNew')
                return this.stateMachine.currentState.call(this, 'actions', 'onMouseDown', event, point.layer)
            }
        }

        this.stateMachine.setState('drawNew')
        this.stateMachine.currentState.call(this, 'actions', 'onMouseDown', event)
    }
}

export default new State(
    {
        name: 'draw',
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