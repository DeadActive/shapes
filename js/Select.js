import PathControl from "./controls/PathControl.js"
import PointControl from "./controls/PointControl.js"
import { SvgGroup } from "./svg/index.js"
import SvgRectangle from "./svg/SvgRectangle.js"
import { dragEvents, emitter } from "./utils/index.js"

export default class Select {
    constructor(editor) {
        this.editor = editor

        this.setupContainers()
        this.handleEvents()
        this.isSelectionEnabled = true
        this.isDisabled = false
        this._currentShape = null

        this.selection = []
    }

    get currentShape() {
        return this._currentShape
    }

    set currentShape(value) {
        this._currentShape = value

        if (value) {
            this.editor.shapes.forEach(s => {
                if (s === value) return s.toggleControlsVisible(true)
                s.toggleControlsVisible(false)
            })

            this.editor.repaint()
            emitter.emit('shapeChanged', value)
        }
    }

    setupContainers() {
        this.selectContainer = new SvgGroup({ name: 'select', id: 'select' })
        this.selectBox = new SvgRectangle({ name: 'selectBox', id: 'selectBox', attrs: { fill: '#0597ff30', stroke: '#0597ff' } })

        this.selectContainer.addChild(this.selectBox)

        console.log(this.selectContainer)

        this.editor.svg.addChild(this.selectContainer)
        emitter.on('modechange', (mode) => this.onModeChanged(mode))
    }

    onModeChanged(mode) {
        if (mode === 'draw') {
            return this.isDisabled = true
        }
        this.isDisabled = false
    }

    handleEvents() {
        function onDragStart(event) {
            if (!this.isSelectionEnabled || this.isDisabled) return

            const { offsetX, offsetY } = event

            this.selectBox.x = offsetX
            this.selectBox.y = offsetY
        }

        function onDragging(lastEvent, event) {
            if (!this.isSelectionEnabled || this.isDisabled) return

            this.selectBox.ex = event.offsetX
            this.selectBox.ey = event.offsetY

            this.selectBox.repaint()
        }

        function onDragEnd(event) {
            if (!this.isSelectionEnabled || this.isDisabled) return

            this.selection = this.editor.getControlsInsideBox(this.selectBox).filter(s => s.selectable && s.isVisible)

            this.selection.forEach(s => s.setSelected(true))

            this.selectBox.x = 0
            this.selectBox.y = 0
            this.selectBox.ex = 0
            this.selectBox.ey = 0
            this.selectBox.repaint()
        }

        function onMouseDown(event) {
            if (this.editor.mode === 'draw') return
            if (!this.isSelectionEnabled || this.isDisabled) return
            if (event.target.dataset.svgName === 'handlerControl' || event.target.dataset.svgName === 'segmentControl') return
            if (event.target.dataset.svgName === 'path' && this.editor.mode !== 'select') return

            const id = +event.target.dataset['svgId']
            const control = this.editor.getControlById(id)

            console.log(control)

            if (control && this.selection.findIndex(c => c === control) !== -1) return

            if (control) {
                if (event.shiftKey) {
                    control.setSelected(true)
                    this.selection.push(control)
                    return
                }

                this.editor.unselectAll()
                control.setSelected(true)
                this.selection = [control]

                emitter.emit('changeSelection', this.selection)

                return
            }

            this.selection.forEach(c => c.setSelected(false))
            this.selection = []
            emitter.emit('changeSelection', this.selection)
        }

        function onDoubleClick(event) {
            if ((this.editor.mode === 'edit' || this.editor.mode === 'bend') && event.target.dataset.svgName === 'svg') {
                this.editor.mode = 'select'
                this.currentShape = null
            }
        }

        function onKeyDown(event) {
            if (event.key === 'Backspace' || event.key === 'Delete') {
                if (this.selection.length > 0 && this.currentShape) {
                    this.selection.forEach(s => {
                        if (s instanceof PointControl) {
                            this.currentShape.removePoint(s)
                        }
                    })
                }
            }

            if (event.key === 'Escape') {
                this.editor.mode = 'select'
            }

            if (event.key === '[') {
                if (this.currentShape) {
                    this.editor.sendShapeToBack(this.currentShape)
                    return
                }

                if (this.selection.length > 0 && this.selection[0] instanceof PathControl) {
                    this.selection.forEach(s => this.editor.sendShapeToBack(s))
                }
            }

            if (event.key === ']') {
                if (this.currentShape) {
                    this.editor.sendShapeToFront(this.currentShape)
                }

                if (this.selection.length > 0 && this.selection[0] instanceof PathControl) {
                    this.selection.forEach(s => this.editor.sendShapeToFront(s))
                }
            }
        }

        function onModeChange(mode) {
            if (mode === 'draw') {
                this.selection = []
                this.currentShape = null
                emitter.emit('changeSelection', this.selection)
            }
        }

        function stopSelection() {
            this.isSelectionEnabled = false
        }

        function resumeSelection() {
            this.isSelectionEnabled = true

            this.selectBox.x = 0
            this.selectBox.y = 0
            this.selectBox.ex = 0
            this.selectBox.ey = 0
            this.selectBox.repaint()
        }

        const mouseDown = onMouseDown.bind(this)
        const dragStart = onDragStart.bind(this)
        const dragging = onDragging.bind(this)
        const dragEnd = onDragEnd.bind(this)
        const doubleClick = onDoubleClick.bind(this)
        const keyDown = onKeyDown.bind(this)
        const modeChange = onModeChange.bind(this)

        emitter.on('stopSelection', stopSelection.bind(this))
        emitter.on('resumeSelection', resumeSelection.bind(this))
        emitter.on('modechange', modeChange)

        this.editor.container.addEventListener('mousedown', mouseDown)
        this.editor.container.addEventListener('dblclick', doubleClick)
        document.addEventListener('keydown', keyDown)
        dragEvents(this.editor.container, dragStart, dragging, dragEnd)
    }
}