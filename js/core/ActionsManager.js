import { dragEvents, emitter } from "../utils/index.js"

export default class ActionsManager {
    constructor(shapeEditor) {
        this.editor = shapeEditor.editor
        this.select = shapeEditor.select
        this.stateMachine = shapeEditor.stateMachine
        this.toolbar = shapeEditor.toolbar
        this.isEnabled = true

        this.handleEvents()
    }

    handleEvents() {
        function onDragStart(event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'actions', 'onDragStart', event)
        }

        function onDragging(lastEvent, event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'actions', 'onDragging', lastEvent, event)
        }

        function onDragEnd(event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'actions', 'onDragEnd', event)
        }

        function onMouseDown(event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'actions', 'onMouseDown', event)
        }

        function onDoubleClick(event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'actions', 'onDoubleClick', event)
        }

        function onKeyDown(event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'actions', 'onKeyDown', event)
        }

        function onMouseMove(event) {
            if (!this.isEnabled) return
            this.stateMachine.currentState.call(this, 'actions', 'onMouseMove', event)
        }

        const dragStart = onDragStart.bind(this)
        const dragging = onDragging.bind(this)
        const dragEnd = onDragEnd.bind(this)
        const mouseDown = onMouseDown.bind(this)
        const doubleClick = onDoubleClick.bind(this)
        const keyDown = onKeyDown.bind(this)
        const mouseMove = onMouseMove.bind(this)

        emitter.on('stopEvents', () => this.isEnabled = false)
        emitter.on('resumeEvents', () => this.isEnabled = true)

        dragEvents(this.editor.container, dragStart, dragging, dragEnd)
        this.editor.container.addEventListener('mousedown', mouseDown)
        this.editor.container.addEventListener('dblclick', doubleClick)
        document.addEventListener('keydown', keyDown)
        this.editor.container.addEventListener('mousemove', mouseMove)
    }
}