import State from "../../core/State.js"
import { distance } from "../../utils/index.js"
import DrawState from "./DrawState.js"

let segment = null
let point = null

const select = {
}

const actions = {
    onMouseDown(event) {
        segment = this.editor.getControlById(+event.target.dataset.svgId, [this.editor.collections.segmentsCollection])

        let d = 100
        const cursor = [event.offsetX, event.offsetY]

        const lutIterations = Math.ceil(segment.pathElement.getLength() / 5)
        const LUT = segment.pathElement.getLUT(lutIterations)
        LUT.pop()
        LUT.shift()

        let pointIndex = 0

        for (let index = 0; index < LUT.length; index++) {
            const coords = LUT[index]
            const q = distance(coords, cursor)

            if (q < d) {
                d = q
                pointIndex = index
            }
        }

        const t = (pointIndex + 1) * 1 / lutIterations

        console.log(segment)

        point = segment.layer.split(segment.pathElement.pathPoints[0], t)

        console.log(this)
    },
    onDragStart() {
        if (point) {
            point.select()
        }
    },
    onDragging(lastEvent, event) {
        if (point && lastEvent) {
            const dx = event.offsetX - lastEvent.offsetX
            const dy = event.offsetY - lastEvent.offsetY

            point.move(dx, dy)
            point.isBezier = true
            return
        }

        point.deselect()
        this.select.stateMachine.next()
    },
    onDragEnd() {
        point.deselect()
        this.select.stateMachine.next()
    },
    onKeyDown(event) {
        if (event.code === 'Escape') {
            point.deselect()
            this.select.stateMachine.setState('select')
        }
    },
}

export default new State(
    {
        name: 'drawSplit',
        fireEvent: false,
        select,
        actions
    },
    {
        beforeStart: () => {

        },
        beforeEnd: () => {

        }
    },
    DrawState
)