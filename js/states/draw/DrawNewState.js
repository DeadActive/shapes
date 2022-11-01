import State from "../../core/State.js"
import DrawState from "./DrawState.js"

let currentLayer = null
let lastPoint = null

const select = {
}

function stopDrawing() {
    if (lastPoint) lastPoint.deselect()
    currentLayer = null
    lastPoint = null
    this.editor.drawGuide.startPoint.moveTo(0, 0)
    this.editor.drawGuide.startPoint.controls[0].moveTo(0, 0)
    this.editor.drawGuide.startPoint.controls[1].moveTo(0, 0)
    this.editor.drawGuide.endPoint.moveTo(0, 0)
    this.editor.drawGuide.endPoint.controls[0].moveTo(0, 0)
    this.editor.drawGuide.endPoint.controls[1].moveTo(0, 0)
    this.editor.drawGuide.segment.update()
}

function beforeEnd() {
    stopDrawing.call(this)
    this.toolbar.setVisibility(true)
}

const actions = {
    onMouseDown(event, layer = null) {
        const x = event.offsetX
        const y = event.offsetY

        // if continue existed layer
        if (layer) {
            currentLayer = layer
            const lastPathPoint = currentLayer.path.pointCollection.getLastPoint()

            this.editor.drawGuide.endPoint.moveTo(x, y)
            this.editor.drawGuide.startPoint.moveTo(x, y)
            this.editor.drawGuide.startPoint.controls[0].moveTo(...lastPathPoint.controls[0].coords)
            this.editor.drawGuide.startPoint.controls[1].moveTo(...lastPathPoint.controls[1].coords)
            this.editor.drawGuide.endPoint.controls[0].moveTo(...lastPathPoint.controls[0].coords)
            this.editor.drawGuide.endPoint.controls[1].moveTo(...lastPathPoint.controls[1].coords)
            this.editor.drawGuide.segment.update()

            return this.toolbar.setVisibility(false)
        }


        if (lastPoint) lastPoint.deselect()

        // close shape and stop drawing on first point click
        if (event.target.dataset.svgName === 'pointControl' && currentLayer) {
            const id = +event.target.dataset.svgId
            const result = this.editor.getControlById(id, [this.editor.collections.pointsCollection])

            if (result && result.pathElement === currentLayer.path.points[0]) {
                currentLayer.path.closePath()
                return this.stateMachine.next(this)
            }
        }

        if (currentLayer === null) {
            currentLayer = this.editor.createLayer()
            lastPoint = currentLayer.createPoint([x, y])
        } else {
            lastPoint = currentLayer.createPoint([x, y])
        }

        this.editor.drawGuide.startPoint.moveTo(x, y)
        this.editor.drawGuide.endPoint.moveTo(x, y)
        this.editor.drawGuide.startPoint.controls[0].moveTo(x, y)
        this.editor.drawGuide.startPoint.controls[1].moveTo(x, y)
        this.editor.drawGuide.endPoint.controls[0].moveTo(x, y)
        this.editor.drawGuide.endPoint.controls[1].moveTo(x, y)
        this.editor.drawGuide.segment.update()

        this.toolbar.setVisibility(false)
    },
    onMouseMove(event) {
        const x = event.offsetX
        const y = event.offsetY

        if (currentLayer) {
            this.editor.drawGuide.endPoint.moveTo(x, y)
            this.editor.drawGuide.endPoint.controls[0].moveTo(x, y)
            this.editor.drawGuide.endPoint.controls[1].moveTo(x, y)
            this.editor.drawGuide.segment.update()
        }
    },
    onDragStart(event) {
        if (lastPoint && currentLayer) {
            lastPoint.isBezier = true
            lastPoint.select()
        }
    },
    onDragging(lastEvent, event) {
        let dx = event.offsetX - lastEvent.offsetX
        let dy = event.offsetY - lastEvent.offsetY

        if (lastPoint && currentLayer) {
            lastPoint.handlers[1].move(dx, dy)
            lastPoint.handlers[0].move(-dx, -dy)

            this.editor.drawGuide.startPoint.controls[0].moveTo(...lastPoint.handlers[0].pathElement.coords)
            this.editor.drawGuide.startPoint.controls[1].moveTo(...lastPoint.handlers[1].pathElement.coords)

            this.editor.drawGuide.segment.update()
        }
    },
    onKeyDown(event) {
        if (event.code === 'Escape') {
            this.select.deselectAll()
            this.select.selection = []
            this.stateMachine.next(this)
        }
    },
    onDoubleClick(event) {
        lastPoint.remove()
        this.stateMachine.next(this)
    }
}

export default new State(
    {
        name: 'drawNew',
        fireEvent: false,
        select,
        actions
    },
    {
        beforeStart: () => {

        },
        beforeEnd
    },
    DrawState
)