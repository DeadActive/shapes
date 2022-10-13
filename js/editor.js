const DEFAULT_EDITOR_OPTIONS = {
    width: 600,
    height: 800,
    container: null,
    points: {
        fill: '#ffffff',
        stroke: '#0000ff'
    },
    handlers: {
        fill: '#00ff00',
        stroke: '#00ff00',
        line: '#0000ff'
    },
    segments: {
        fill: 'transparent',
        stroke: '#0000ff',
    },
    shape: {
        fill: '#aaaaaa',
        stroke: '#000000',
    }
}

function Editor(options = DEFAULT_EDITOR_OPTIONS) {
    options = { ...DEFAULT_EDITOR_OPTIONS, ...options }

    this._container = options.container
    this._width = options.width
    this._height = options.height
    this._mode = 'draw'

    this._shapes = []

    this._commandManager = new CommandManager(this)

    this.drawContainer = createSVGElement('g')

    const rootEl = document.querySelector(':root')
    function setRootProp(property, value) {
        setCSSProperty(rootEl, property, value)
    }

    function updateControlsStyles() {
        setRootProp('--point-fill', options.points.fill)
        setRootProp('--point-stroke', options.points.stroke)

        setRootProp('--handler-fill', options.handlers.fill)
        setRootProp('--handler-stroke', options.handlers.stroke)
        setRootProp('--handler-line', options.handlers.line)

        setRootProp('--segment-fill', options.segments.fill)
        setRootProp('--segment-stroke', options.segments.stroke)
    }

    this.createShape = function () {
        const shape = new Shape(this.container, this.shapes.length)

        this.commandManager.save(this.removeShape, [shape], this)

        this.shapes.push(shape)

        return shape
    }

    this.removeShapeIndex = function (index) {
        const shape = this.shapes[index]

        if (shape === void 0) return
        shape.clear()

        this.shapes.splice(index, 1)
    }

    this.removeShape = function (shape) {
        if (shape === void 0) return

        const shapeIndex = this.shapes.findIndex((shp) => shp === shape)
        if (shapeIndex === -1) return

        this.removeShapeIndex(shapeIndex)
    }

    this.init = function () {
        this.container.setAttribute('width', this.width)
        this.container.setAttribute('height', this.height)

        this.drawContainer.classList.toggle('draw-container', true)
        this.container.append(this.drawContainer)

        this.clearEvents = this.handleEvents()

        updateControlsStyles()
    }

    this.saveToJSON = function () {
        const shapes = []

        this.shapes.forEach(shape => {
            shapes.push(shape.saveToJSON())
        })

        return JSON.stringify(shapes)
    }

    this.loadFromJSON = function (json) {
        const shapes = JSON.parse(json)

        shapes.forEach(shapeSettings => {
            const shape = this.createShape()
            shape.loadFromJSON(shapeSettings)

            shape.points.forEach(
                (p) => p.select()
            )
        })
    }

    function handleDragEvents(container, dragStart, dragging, dragEnd) {
        let isDragging = false
        let isMouseDown = false
        let lastPointerEvent = null

        function onMouseDown(event) {
            isMouseDown = true
        }

        function onMouseUp(event) {
            if (isDragging) dragEnd(event)

            isDragging = false
            isMouseDown = false
            lastPointerEvent = null
        }

        function onMouseMove(event) {
            if (isMouseDown && lastPointerEvent === null) {
                dragStart(event)
                isDragging = true
            }

            if (isDragging) {
                if (lastPointerEvent === null) lastPointerEvent = event
                dragging(lastPointerEvent, event)
                lastPointerEvent = event
            }
        }

        container.addEventListener('mousedown', onMouseDown)
        container.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mousemove', onMouseMove)

        return function () {
            container.removeEventListener('mousedown', onMouseDown)
            container.removeEventListener('mouseup', onMouseUp)
            document.removeEventListener('mousemove', onMouseMove)
        }
    }

    function pathGet(object, path, index) {
        if (!object || !path || !index) return
        const route = path.split('.')
        if (route.length < 1) return
        if (route.length === 1) return object[path][index]
        return route.reduce((a, current) => {
            return a[current]
        }, object)[index]
    }

    this.handleEvents = function () {
        const dragStart = onDragStart.bind(this)
        const dragging = onDragging.bind(this)
        const dragEnd = onDragEnd.bind(this)
        const mouseDown = onMouseDown.bind(this)

        const clearDragHandlers = handleDragEvents(this.container, dragStart, dragging, dragEnd)
        this.container.addEventListener('mousedown', mouseDown)

        let currentTarget = null

        function onMouseDown(event) {
            console.log(event.target.dataset['controlType'])
        }

        function onDragStart(event) {
            currentTarget = event.target
        }

        function onDragging(lastEvent, event) {
            const path = currentTarget.dataset['controlPath']
            const index = currentTarget.dataset['index']

            if (path && index) {
                const object = pathGet(this, path, index)

                console.log(object)
            }
        }

        function onDragEnd(event) {
            currentTarget = null
        }

        return function () {
            clearDragHandlers()
            this.container.removeEventListener('mousedown', mouseDown)
        }
    }

    this.init()
}

Object.defineProperties(Editor.prototype, {
    width: {
        get() {
            return this._width
        },
        set(value) {
            this._width = value
            this.container.setAttribute('width', value)
        }
    },
    height: {
        get() {
            return this._height
        },
        set(value) {
            this._height = value
            this.container.setAttribute('height', value)
        }
    },
    container: {
        get() {
            return this._container
        }
    },
    shapes: {
        get() {
            return this._shapes
        }
    },
    mode: {
        get() {
            return this._mode
        },
        set(value) {
            this._mode = value
        }
    },
    commandManager: {
        get() {
            return this._commandManager
        }
    }
})