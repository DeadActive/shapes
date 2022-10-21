import { SvgPathPoint, SvgPathPointControl } from "../svg/SvgPath.js";
import SvgSegment from "../svg/SvgSegment.js";
import Action from "./Action.js";

export default class DrawActions extends Action {
    constructor(actionManager) {
        super(actionManager)
        this.initEvents({
            dragStart: this.onDragStart.bind(this),
            dragging: this.onDragging.bind(this),
            dragEnd: this.onDragEnd.bind(this),
            doubleClick: this.onDoubleClick.bind(this),
            mouseDown: this.onMouseDown.bind(this),
            mouseMove: this.onMouseMove.bind(this),
            modechange: this.onModeChange.bind(this)
        })

        const startControls = [new SvgPathPointControl([0, 0]), new SvgPathPointControl([0, 0])]
        const endControls = [new SvgPathPointControl([0, 0]), new SvgPathPointControl([0, 0])]

        this.startPoint = new SvgPathPoint([0, 0], startControls)
        this.endPoint = new SvgPathPoint([0, 0], endControls)
        this.drawGuide = new SvgSegment([this.startPoint, this.endPoint], {
            attrs: {
                fill: 'transparent',
                stroke: '#0597ff',
                'stroke-width': 1
            }
        })
        this.drawGuide.style.pointerEvents = 'none'

        this.actionManager.editor.containers.drawContainer.addChild(this.drawGuide)
        this.editor = this.actionManager.editor
        this.select = this.actionManager.select
        this.currentShape = this.select.currentShape
        this.lastPoint = null
    }

    onMouseDown({ event }) {
        if (this.editor.mode === 'draw' && (event.target.dataset.svgName === 'segmentControl' || event.target.dataset.svgName === 'ghostPoint')) {
            console.log('split')
        }

        if (this.editor.mode === 'draw' && this.editor.svg.el.contains(event.target)) {
            const x = event.offsetX
            const y = event.offsetY

            console.log(event.target)

            if (event.target.dataset.svgName === 'pointControl') {
                console.log('close')
                if (this.lastPoint.isBezier) {
                    this.currentShape.pointControls[0].isBezier = true
                    this.currentShape.pointControls[0].handlers[0].mode = 'default'
                    this.currentShape.pointControls[0].handlers[1].mode = 'default'
                }
                this.currentShape.closePath()
                this.stopDrawing()
                return
            }

            if (this.currentShape === null) {
                this.currentShape = this.editor.addShape()

                const point = this.currentShape.addPoint([x, y], [[x, y], [x, y]])
                point.isBezier = false

                this.startPoint.moveTo(x, y)
                this.startPoint.moveControls(x, y)

                this.endPoint.moveTo(x, y)
                this.endPoint.moveControls(x, y)

                this.lastPoint = point
                return
            }

            this.lastPoint.setSelected(false)

            const point = this.currentShape.addPoint([x, y], [[x, y], [x, y]])
            point.isBezier = false
            this.startPoint.moveTo(x, y)
            this.startPoint.moveControls(x, y)
            this.lastPoint = point
        }
    }

    onMouseMove({ event }) {
        if (this.editor.mode === 'draw' && this.currentShape) {
            this.endPoint.moveTo(event.offsetX, event.offsetY)

            this.endPoint.controls[0].moveTo(event.offsetX, event.offsetY)
            this.endPoint.controls[1].moveTo(event.offsetX, event.offsetY)

            this.drawGuide.repaint()
        }
    }

    onDoubleClick({ event }) {

    }

    onDragStart({ event }) {
        if (this.editor.mode === 'draw' && this.lastPoint) {
            this.lastPoint.handlers[0].mode = 'mirrorAngle'
            this.lastPoint.handlers[1].mode = 'mirrorAngle'

            this.lastPoint.isBezier = true
            this.lastPoint.setSelected(true)
        }
    }

    onDragging({ event, lastEvent }) {
        if (this.actionManager.editor.mode === 'draw' && this.lastPoint) {
            let dx = event.offsetX - lastEvent.offsetX
            let dy = event.offsetY - lastEvent.offsetY

            this.lastPoint.handlers[1].move(dx, dy)
            this.lastPoint.handlers[0].move(-dx, -dy)

            const lpHandlers = this.lastPoint.handlers

            this.startPoint.controls[0].moveTo(lpHandlers[0].svgEl.x, lpHandlers[0].svgEl.y)
            this.startPoint.controls[1].moveTo(lpHandlers[1].svgEl.x, lpHandlers[1].svgEl.y)

            // this.endPoint.moveTo(event.offsetX, event.offsetY)
            this.drawGuide.repaint()
            this.editor.repaint()
        }
    }

    onDragEnd({ event }) {

    }

    onModeChange(mode, lastMode) {
        if (lastMode === 'draw' && mode !== 'draw') {
            this.stopDrawing()
        }
    }

    stopDrawing() {
        if (this.lastPoint && this.currentShape) {
            this.lastPoint.setSelected(false)
            this.startPoint.moveTo(0, 0)
            this.startPoint.moveControls(0, 0)
            this.endPoint.moveTo(0, 0)
            this.endPoint.moveControls(0, 0)
            this.drawGuide.repaint()

            this.select.selection = [this.currentShape]
            this.currentShape = null
            this.lastPoint = null
        }
    }
}