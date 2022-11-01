import SvgGroup from "./svg/SvgGroup.js"
import SvgRectangle from "./svg/SvgRectangle.js"
import { dragEvents, emitter } from "./utils/index.js"

export default class Select {
    constructor(editor, stateMachine) {
        this.editor = editor
        this.stateMachine = stateMachine

        this.selection = []
        this.isEnabled = true
        this.container = editor.container
        this.setupContainer()
        this.handleEvents()
    }

    setupContainer() {
        this.selectContainer = new SvgGroup({}, { name: 'select', id: 'select' })
        this.selectBox = new SvgRectangle(0, 0, 0, 0, {
            name: 'selectBox',
            id: 'selectBox',
            attrs: { fill: '#0597ff30', stroke: '#0597ff', 'fill-opacity': 0.4 }
        })

        this.selectContainer.addChild(this.selectBox)
        this.editor.rootContainer.addChild(this.selectContainer)
    }

    deselectAll() {
        if (this.selection.length > 0) {
            this.selection.forEach(control => {
                control.deselect()
            })
        }
        emitter.emit('changeSelection')
    }

    selectAll() {
        if (this.selection.length > 0) {
            this.selection.forEach(control => {
                control.select()
            })
        }
    }

    handleEvents() {
        function onDragStart(event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'select', 'onDragStart', event)
        }

        function onDragging(lastEvent, event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'select', 'onDragging', lastEvent, event)
        }

        function onDragEnd(event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'select', 'onDragEnd', event)
        }

        function onMouseDown(event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'select', 'onMouseDown', event)
        }

        const dragStart = onDragStart.bind(this)
        const dragging = onDragging.bind(this)
        const dragEnd = onDragEnd.bind(this)
        const mouseDown = onMouseDown.bind(this)

        emitter.on('stopEvents', () => this.isEnabled = false)
        emitter.on('resumeEvents', () => this.isEnabled = true)

        dragEvents(this.container, dragStart, dragging, dragEnd)
        this.container.addEventListener('mousedown', mouseDown)
    }
}