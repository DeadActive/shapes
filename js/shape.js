function State(initialState, cb) {
    const _state = JSON.parse(JSON.stringify(initialState))

    Object.entries(initialState).forEach(([key, value]) => {
        Object.defineProperty(this, key, {
            get() {
                return _state[key]
            },
            set(value) {
                _state[key] = value
                cb(this)
            }
        })
    })

    return this
}


function BezierShape() {
    this.points = []
    this.segments = []

    this.shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.segmentsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    this.controlsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'g')

    this.segmentsContainer.classList.add('controls-container')
    this.controlsContainer.classList.add('controls-container')

    this.selectedPoint = null

    this.addPoint = function (x, y) {
        const point = {
            coords: [x, y],
            controls: [
                [x, y],
                [x, y]
            ]
        }

        this.points.push(point)

        this.calculateSegments()

        console.log(this.segments)
    }

    this.calculateSegments = function () {
        if (this.points.length < 2) return

        this.segments = []
        for (let index = 0; index < this.points.length - 1; index++) {
            const point = this.points[index];
            const nextPoint = this.points[index + 1]

            this.segments.push([point, nextPoint])
        }
    }

    this.removePoint = function (point) {
        const pointIndex = this.points.findIndex(p => p === point)
        this.points.splice(pointIndex, 1)
        this.calculateSegments()
    }

    this.removePointSelected = function () {
        if (this.selectedPoint) this.removePoint(this.selectedPoint)
    }

    function handleShapeHover(event) {
        //console.log(event)
    }

    function calculateBezier(t, p1, p2, p3, p4) {
        const x = Math.pow(1 - t, 3) * p1[0] + 3 * Math.pow(1 - t, 2) * t * p2[0] + 3 * (1 - t) * t * t * p3[0] + (t * t * t * p4[0])
        const y = Math.pow(1 - t, 3) * p1[1] + 3 * Math.pow(1 - t, 2) * t * p2[1] + 3 * (1 - t) * t * t * p3[1] + (t * t * t * p4[1])

        return [x, y]
    }

    this.build = function () {
        if (this.points.length < 2) return this.shapeElement

        const d = this.points.map((point, index) => {
            if (index === 0) return `M ${point.coords[0]} ${point.coords[1]} C ${point.controls[1][0]} ${point.controls[1][1]}`
            if (index === this.points.length - 1)
                return `${point.controls[0][0]} ${point.controls[0][1]} ${point.coords[0]} ${point.coords[1]}`
            return `${point.controls[0][0]} ${point.controls[0][1]} ${point.coords[0]} ${point.coords[1]} C ${point.controls[1][0]} ${point.controls[1][1]}`
        }).join(' ')

        this.shapeElement.setAttribute('d', d)
        this.shapeElement.setAttribute('fill', '#0000ff50')
        this.shapeElement.setAttribute('stroke', '#f00')

        this.shapeElement.removeEventListener('mousemove', handleShapeHover)
        this.shapeElement.addEventListener('mousemove', handleShapeHover)

        this.segmentsContainer.innerHTML = ''

        this.segments.forEach((segment, i) => {
            const point = segment[0]
            const nextPoint = segment[1]

            const segmentElem = document.createElementNS('http://www.w3.org/2000/svg', 'path')

            let segmentD

            segmentD = `M ${point.coords[0]} ${point.coords[1]} C ${point.controls[1][0]} ${point.controls[1][1]} ${nextPoint.controls[0][0]} ${nextPoint.controls[0][1]} ${nextPoint.coords[0]} ${nextPoint.coords[1]}`

            segmentElem.setAttribute('d', segmentD)
            segmentElem.setAttribute('fill', 'transparent')
            segmentElem.setAttribute('stroke', '#0000ff')
            segmentElem.setAttribute('stroke-width', 8)
            segmentElem.setAttribute('opacity', 0)
            segmentElem.dataset['segmentIndex'] = i
            segmentElem.dataset['controlType'] = 'segment'

            segmentElem.addEventListener('mouseenter', (event) => {
                event.target.setAttribute('opacity', 0.6)
            })

            segmentElem.addEventListener('mouseleave', (event) => {
                event.target.setAttribute('opacity', 0)
            })

            const addPointSegment = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            const [centerX, centerY] = calculateBezier(0.5, point.coords, point.controls[1], nextPoint.controls[0], nextPoint.coords)
            addPointSegment.setAttribute('cx', centerX)
            addPointSegment.setAttribute('cy', centerY)
            addPointSegment.setAttribute('r', 5)
            addPointSegment.setAttribute('fill', '#000')

            this.segmentsContainer.append(segmentElem, addPointSegment)
        })

        this.controlsContainer.innerHTML = ''
        this.points.forEach((point, pointIndex) => {
            const controls = point.controls

            const pointElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

            pointElement.setAttribute('x', point.coords[0] - 5)
            pointElement.setAttribute('y', point.coords[1] - 5)
            pointElement.setAttribute('width', 10)
            pointElement.setAttribute('height', 10)
            pointElement.setAttribute('fill', 'transparent')
            pointElement.setAttribute('stroke', '#555')

            pointElement.dataset['pointIndex'] = pointIndex
            pointElement.dataset['controlType'] = 'point'

            pointElement.addEventListener('mouseenter', (event) => event.target.setAttribute('cursor', 'pointer'))
            pointElement.addEventListener('mouseleave', (event) => event.target.setAttribute('cursor', 'default'))
            pointElement.addEventListener('click', () => {
                this.selectedPoint = point
                this.build()
            })

            if (point === this.selectedPoint) {
                // console.log(this.selectedPoint)
                pointElement.classList.toggle('selected', true)
            }

            this.controlsContainer.append(pointElement)

            controls.forEach((control, controlIndex) => {
                const controlElem = document.createElementNS('http://www.w3.org/2000/svg', 'g')

                const handlerElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
                handlerElement.setAttribute('cx', control[0])
                handlerElement.setAttribute('cy', control[1])
                handlerElement.setAttribute('r', 5)
                handlerElement.setAttribute('fill', '#0f0')

                const lineElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
                lineElement.setAttribute('d', `M ${point.coords[0]} ${point.coords[1]} L ${control[0]} ${control[1]}`)
                lineElement.setAttribute('stroke', '#00f')
                lineElement.setAttribute('fill', 'transparent')

                controlElem.append(lineElement, handlerElement)

                handlerElement.dataset['pointIndex'] = pointIndex
                handlerElement.dataset['controlIndex'] = controlIndex
                handlerElement.dataset['controlType'] = 'control'

                handlerElement.addEventListener('mouseenter', (event) => {
                    event.target.setAttribute('cursor', 'grab')
                })

                handlerElement.addEventListener('mouseleave', (event) => {
                    event.target.setAttribute('cursor', '')
                })

                this.controlsContainer.append(controlElem)
            })
        })

        return this.shapeElement
    }
}



const EDIT_MODES = {
    'SELECT': 0,
    'EDIT': 1
}

function t_shapes__init() {
    const svgElement = document.querySelector('.js-svg')
    const modeButton = document.querySelector('.js-toggleEditMode')

    const width = 1000
    const height = 1000

    svgElement.setAttribute('width', width)
    svgElement.setAttribute('height', height)

    const shape = new BezierShape()

    const initialState = {
        mode: 1,
        shapes: []
    }

    const state = new State(initialState, updateInterface)
    updateInterface(state)
    handleDragging()
    handleKeyPress()

    svgElement.appendChild(shape.shapeElement)
    svgElement.appendChild(shape.segmentsContainer)
    svgElement.appendChild(shape.controlsContainer)


    svgElement.addEventListener('click', (event) => {
        handleInput(state, event)
    })

    svgElement.addEventListener('mousemove', (event) => {
        handleInput(state, event)
    })

    modeButton.addEventListener('click', () => {
        state.mode = state.mode === EDIT_MODES.EDIT ? EDIT_MODES.SELECT : EDIT_MODES.EDIT
    })

    function handleKeyPress() {
        document.addEventListener('keyup', (event) => {
            if (event.key === 'Backspace') {
                shape.removePointSelected()
                shape.build()
            }
        })
    }

    function handleDragging() {
        var mouseDown = false
        var currentTarget = null
        var lastCoords = null

        document.addEventListener('mousedown', () => mouseDown = true)
        document.addEventListener('mouseup', () => {
            currentTarget = null
            mouseDown = false
            lastCoords = null
        })
        document.addEventListener('mousemove', (event) => {
            if (mouseDown) {
                let deltaX = 0
                let deltaY = 0

                if (!currentTarget) currentTarget = event.target

                if (lastCoords) {
                    deltaX = event.clientX - lastCoords[0]
                    deltaY = event.clientY - lastCoords[1]
                }

                if (currentTarget.dataset['controlType'] === 'segment') {
                    const segmentIndex = currentTarget.dataset['segmentIndex']
                    const segment = shape.segments[segmentIndex]


                    segment[0].controls[1][0] += deltaX
                    segment[0].controls[1][1] += deltaY

                    segment[1].controls[0][0] += deltaX
                    segment[1].controls[0][1] += deltaY

                    shape.build()
                }

                if (currentTarget.dataset['controlType'] === 'control') {
                    const pointIndex = currentTarget.dataset['pointIndex']
                    const controlIndex = currentTarget.dataset['controlIndex']

                    const control = shape.points[pointIndex].controls[controlIndex]

                    control[0] += deltaX
                    control[1] += deltaY

                    shape.build()
                }

                if (currentTarget.dataset['controlType'] === 'point') {
                    const pointIndex = currentTarget.dataset['pointIndex']

                    const point = shape.points[pointIndex]

                    point.coords[0] += deltaX
                    point.coords[1] += deltaY

                    shape.selectedPoint = point
                    shape.build()
                }

                lastCoords = [event.clientX, event.clientY]
            }
        })
    }

    function handleEditModeInput(state, event) {
        if (event.type === 'click') {
            const { offsetX, offsetY } = event

            shape.addPoint(offsetX, offsetY)

            shape.build()

        }

    }

    function highlightPoints(event) {

    }

    function handleSelectModeInput(state, event) {
        if (event.type === 'mousemove') {
            highlightPoints(event)
        }
    }

    function handleInput(state, event) {
        if (state.mode === EDIT_MODES.EDIT) handleEditModeInput(state, event)
        if (state.mode === EDIT_MODES.SELECT) handleSelectModeInput(state, event)
    }

    function updateModeSelectorButton(state) {
        if (state.mode === EDIT_MODES.EDIT) {
            modeButton.textContent = 'Edit mode'
            setCSSProperty('--cursor', 'crosshair')
        }
        if (state.mode === EDIT_MODES.SELECT) {
            modeButton.textContent = 'Select mode'
            setCSSProperty('--cursor', 'default')
        }
    }

    function updateInterface(state) {
        updateModeSelectorButton(state)
    }

    function setCSSProperty(property, value) {
        const rootEl = document.querySelector(':root')
        rootEl.style.setProperty(property, value)
    }
}

window.addEventListener('DOMContentLoaded', t_shapes__init)