import { dragEvents, emitter } from "../utils/index.js"
import DrawActions from "./DrawActions.js"
import HandlerActions from "./HandlerActions.js"
import PathActions from "./PathActions.js"
import PointActions from "./PointActions.js"
import SegmentActions from "./SegmentActions.js"

export default class ActionManager {
    constructor(editor, select) {
        this.editor = editor
        this.select = select
        this.emitter = emitter

        this.setupActions()
        this.handleEvents()

        console.log(this)
    }

    setupActions() {
        this.actions = {
            pointActions: new PointActions(this),
            handlerActions: new HandlerActions(this),
            pathActions: new PathActions(this),
            segmentActions: new SegmentActions(this),
            drawActions: new DrawActions(this)
        }
    }

    handleEvents() {
        function onDragStart(event) {
            this.emitter.emit('dragStart', { event })
        }

        function onDragging(lastEvent, event) {
            this.emitter.emit('dragging', { event, lastEvent })
        }

        function onDragEnd(event) {
            this.emitter.emit('dragEnd', { event })
        }

        function onDoubleClick(event) {
            this.emitter.emit('doubleClick', { event })
        }

        function onClick(event) {
            this.emitter.emit('click', { event })
        }

        function onMouseDown(event) {
            this.emitter.emit('mouseDown', { event })
        }

        function onMouseMove(event) {
            this.emitter.emit('mouseMove', { event })
        }

        const dragStart = onDragStart.bind(this)
        const dragging = onDragging.bind(this)
        const dragEnd = onDragEnd.bind(this)
        const doubleClick = onDoubleClick.bind(this)
        const click = onClick.bind(this)
        const mouseDown = onMouseDown.bind(this)
        const mouseMove = onMouseMove.bind(this)

        dragEvents(this.editor.container, dragStart, dragging, dragEnd)
        this.editor.container.addEventListener('dblclick', doubleClick)
        this.editor.container.addEventListener('click', click)
        this.editor.container.addEventListener('mousedown', mouseDown)
        this.editor.container.addEventListener('mousemove', mouseMove)
    }
}