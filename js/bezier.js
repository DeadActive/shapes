function createSVGElement(tag, options) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag, options)
}

function vectorDistance(x, y, x1, y1) {
    return Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2))
}

function calculateBezier(t, p1, p2, p3, p4) {
    const x = Math.pow(1 - t, 3) * p1[0] + 3 * Math.pow(1 - t, 2) * t * p2[0] + 3 * (1 - t) * t * t * p3[0] + (t * t * t * p4[0])
    const y = Math.pow(1 - t, 3) * p1[1] + 3 * Math.pow(1 - t, 2) * t * p2[1] + 3 * (1 - t) * t * t * p3[1] + (t * t * t * p4[1])

    return [x, y]
}

let AUTO_HANDLERS_MULTIPLIER = 1

function Vector2(coords) {
    this.x = coords[0]
    this.y = coords[1]

    this.distance = function (vector) {
        return Math.sqrt(Math.pow(this.x - vector.x, 2) + Math.pow(this.y - vector.y, 2))
    }

    this.perpendecular = function (clockwise = false) {
        return clockwise ? new Vector2([this.y, -this.x]) : new Vector2([-this.y, this.x])
    }

    this.magnitude = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    this.scalarProduct = function (scalar) {
        return new Vector2([this.x * scalar, this.y * scalar])
    }

    this.dotProduct = function (vector) {
        return this.x * vector.x + this.y * vector.y
    }

    this.addVector = function (vector) {
        return new Vector2([this.x + vector.x, this.y + vector.y])
    }

    this.addVectorCoords = function (coords) {
        return new Vector2([this.x + coords[0], this.y + coords[1]])
    }

    this.normalize = function () {
        const magnitude = this.magnitude()
        return new Vector2([this.x / magnitude, this.y / magnitude])
    }

    this.rotate = function (angle) {
        const x = Math.cos(angle) * this.x - Math.sin(angle) * this.y
        const y = Math.sin(angle) * this.x + Math.cos(angle) * this.y

        return new Vector2([x, y])
    }

    this.reverse = function () {
        return new Vector2([-this.x, -this.y])
    }

    this.toArray = function () {
        return [this.x, this.y]
    }
}

Vector2.fromPoints = function (p1, p2) {
    return new Vector2([p2[0] - p1[0], p2[1] - p1[1]])
}

function Point(coords, controls, container, shape, segments = []) {
    this.coords = coords
    this.controls = controls
    this.container = container
    this.shape = shape
    this.segments = segments
    this.isSelected = false
    this.isBezier = false

    this.pointElement = createSVGElement('circle')

    this.move = function (x, y) {
        this.coords = [this.coords[0] + x, this.coords[1] + y]
        this.controls[0].move(x, y)
        this.controls[1].move(x, y)
    }

    this.moveTo = function (x, y) {
        const [rx, ry] = [x - this.coords[0], y - this.coords[1]]
        console.log([x, y])
        this.coords = [x, y]
        this.controls[0].move(rx, ry)
        this.controls[1].move(rx, ry)
    }

    this.toggleBezier = function () {
        if (!this.isBezier) {
            this.isBezier = true
            this.autoHandlers()
            return
        }

        this.isBezier = false
        this.resetHandlers()
    }

    this.autoHandlers = function () {
        const pointIndex = this.shape.points.findIndex((p) => this === p)

        if (pointIndex === -1) return

        let prevPoint
        let nextPoint

        if (!this.shape.isClosed && (pointIndex === 0 || pointIndex === this.shape.points.length - 1)) return

        if (this.shape.isClosed && pointIndex === 0) {
            prevPoint = this.shape.points[this.shape.points.length - 1]
            nextPoint = this.shape.points[pointIndex + 1]
        }
        else if (pointIndex === this.shape.points.length - 1 && this.shape.isClosed) {
            prevPoint = this.shape.points[pointIndex - 1]
            nextPoint = this.shape.points[0]
        } else {
            prevPoint = this.shape.points[pointIndex - 1]
            nextPoint = this.shape.points[pointIndex + 1]
        }


        const centerX = (prevPoint.coords[0] + nextPoint.coords[0]) / 2
        const centerY = (prevPoint.coords[1] + nextPoint.coords[1]) / 2

        const pointVector = new Vector2(this.coords)
        const centerVector = new Vector2([centerX, centerY])
        const segmentVector = Vector2.fromPoints(prevPoint.coords, nextPoint.coords)

        const distanceToCenter = pointVector.distance(centerVector)
        const segmentLength = segmentVector.magnitude()

        const scalarCoef = distanceToCenter / segmentLength * AUTO_HANDLERS_MULTIPLIER
        const moveVector = Vector2.fromPoints([centerX, centerY], this.coords)

        const resultVector = moveVector.addVectorCoords(prevPoint.coords)
        const moveToCenterVector = Vector2.fromPoints(this.coords, resultVector.toArray()).scalarProduct(scalarCoef)

        const scaledPoint = pointVector.addVector(moveToCenterVector).toArray()
        const scaledPointMirror = pointVector.addVector(moveToCenterVector.scalarProduct(-1)).toArray()

        this.controls[0].moveTo(...scaledPoint)
        this.controls[1].moveTo(...scaledPointMirror)
    }

    this.resetHandlers = function () {
        const self = this

        this.controls.forEach(function (control) {
            control.moveTo(self.coords[0], self.coords[1])
        })
    }

    this.select = function () {
        if (this.isBezier) {
            this.controls.forEach(function (control) {
                control.visible = true
                control.repaint()
            })
        }

        this.isSelected = true
    }

    this.unselect = function () {
        this.controls.forEach(function (control) {
            control.visible = false
            control.repaint()
        })

        this.isSelected = false
    }

    function handleEvents(element) {
        element.addEventListener('mouseenter', onMouseEnter)
        element.addEventListener('mouseleave', onMouseLeave)

        let lastX
        let lastY
        let lastPointX = this.coords[0]
        let lastPointY = this.coords[1]

        const onMouseUpBinded = onMouseUp.bind(this)
        const onMouseMoveBinded = onMouseMove.bind(this)
        const onMouseDownBinded = onMouseDown.bind(this)
        const onDoubleClickBinded = onDoubleClick.bind(this)
        const onKeyDownBinded = onKeyDown.bind(this)

        element.addEventListener('dblclick', onDoubleClickBinded)
        document.addEventListener('keydown', onKeyDownBinded)

        function onDoubleClick() {
            document.addEventListener('mousedown', onMouseDownBinded)
            document.addEventListener('mouseup', onMouseUpBinded)

            document.removeEventListener('mousemove', onMouseMoveBinded)

            this.toggleBezier()
            this.controls.forEach(function (control) {
                control.repaint()
            })
            this.segments.forEach(function (segment) { segment.repaint() })
            this.shape.repaint()

            if (!this.selected) {
                this.shape.selectPoint(this)
            }
        }

        function onKeyDown(event) {
            if (!this.isSelected) return

            if (event.key === 'Backspace' || event.key === 'Delete') {
                this.shape.removePoint(this)
            }
        }

        function onMouseEnter() {
            document.addEventListener('mousedown', onMouseDownBinded)
            document.addEventListener('mouseup', onMouseUpBinded)
        }

        function onMouseLeave() {
            document.removeEventListener('mousedown', onMouseDownBinded)
        }

        function onMouseDown() {
            document.addEventListener('mousemove', onMouseMoveBinded)

            lastPointX = this.coords[0]
            lastPointY = this.coords[1]

            if (!this.selected) {
                this.shape.selectPoint(this)
            }
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMoveBinded)
            document.removeEventListener('mouseup', onMouseUpBinded)

            lastX = null
            lastY = null

            if (this.coords[0] !== lastPointX || this.coords[1] !== lastPointY) {
                console.log('movePointCommand', [lastPointX, lastPointY], this.coords)

                lastPointX = this.coords[0]
                lastPointY = this.coords[1]
            }
        }

        function onMouseMove(event) {
            if (lastX && lastY) {
                let deltaX = event.clientX - lastX
                let deltaY = event.clientY - lastY

                this.move(deltaX, deltaY)
                this.repaint()
                this.controls.forEach(function (control) { control.repaint() })
                this.segments.forEach(function (segment) { segment.repaint() })
                this.shape.repaint()
            }

            lastX = event.clientX
            lastY = event.clientY
        }

        return function () {
            element.removeEventListener('mouseenter', onMouseEnter)
            element.removeEventListener('mouseleave', onMouseLeave)
            document.removeEventListener('mousedown', onMouseDownBinded)
            document.removeEventListener('mousemove', onMouseMoveBinded)
            document.removeEventListener('mouseup', onMouseUpBinded)
            document.removeEventListener('dblclick', onDoubleClickBinded)
            document.removeEventListener('keydown', onKeyDownBinded)

            this.pointElement.remove()
        }
    }

    this.repaint = function () {
        this.pointElement.setAttribute('cx', this.coords[0])
        this.pointElement.setAttribute('cy', this.coords[1])
        this.pointElement.dataset['pointIndex'] = this.shape.points.findIndex((p) => p === this)
    }

    this.draw = function () {
        const { coords, container, pointElement } = this

        pointElement.setAttribute('cx', coords[0])
        pointElement.setAttribute('cy', coords[1])
        pointElement.setAttribute('r', 5)
        pointElement.setAttribute('stroke', '#00f')
        pointElement.setAttribute('fill', '#fff')

        pointElement.dataset['controlType'] = 'point'
        this.pointElement.dataset['pointIndex'] = this.shape.points.length - 1

        this.clear = handleEvents.call(this, pointElement)

        container.append(pointElement)
    }

    this.toJSON = function () {
        return {
            coords: this.coords,
            controls: this.controls.map(function (control) { return control.coords })
        }
    }
}

function Handler(point, coords, container, shape) {
    this.point = point
    this.coords = coords
    this.container = container
    this.shape = shape
    this.handlerElement = createSVGElement('circle')
    this.lineElement = createSVGElement('path')
    this.visible = false
    this.isMirrorPosition = true
    this.isMirrorAngle = false

    this.move = function (x, y) {
        this.coords = [this.coords[0] + x, this.coords[1] + y]
    }

    this.moveTo = function (x, y) {
        this.coords = [x, y]
    }

    this.repaint = function () {
        this.handlerElement.setAttribute('cx', this.coords[0])
        this.handlerElement.setAttribute('cy', this.coords[1])

        this.lineElement.setAttribute('d', `M ${this.point.coords[0]} ${this.point.coords[1]} L ${this.coords[0]} ${this.coords[1]}`)

        this.handlerElement.setAttribute('visibility', this.visible ? 'visible' : 'hidden')
        this.lineElement.setAttribute('visibility', this.visible ? 'visible' : 'hidden')
    }

    function handleEvents(element) {
        element.addEventListener('mouseenter', onMouseEnter)
        element.addEventListener('mouseleave', onMouseLeave)

        let lastX
        let lastY
        let lastHandlerX
        let lastHandlerY

        const onMouseMoveBinded = onMouseMove.bind(this)
        const onMouseDownBinded = onMouseDown.bind(this)
        const onMouseUpBinded = onMouseUp.bind(this)

        function onMouseEnter(event) {
            document.addEventListener('mousedown', onMouseDownBinded)
            document.addEventListener('mouseup', onMouseUpBinded)
        }

        function onMouseLeave() {
            document.removeEventListener('mousedown', onMouseDownBinded)
        }

        function onMouseDown() {
            document.addEventListener('mousemove', onMouseMoveBinded)

            lastHandlerX = this.coords[0]
            lastHandlerY = this.coords[1]
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMoveBinded)
            document.removeEventListener('mouseup', onMouseUpBinded)

            lastX = null
            lastY = null

            if (this.coords[0] !== lastHandlerX || this.coords[1] !== lastHandlerY) {
                console.log('moveHandlerCommand', [lastHandlerX, lastHandlerY], this.coords)

                lastHandlerX = this.coords[0]
                lastHandlerY = this.coords[1]
            }
        }

        function onMouseMove(event) {
            if (lastX && lastY) {
                let deltaX = event.clientX - lastX
                let deltaY = event.clientY - lastY

                this.move(deltaX, deltaY)

                if (this.isMirrorPosition) {
                    const control = this.point.controls.find(c => c !== this)

                    control.move(-deltaX, -deltaY)
                    control.repaint()
                }

                if (this.isMirrorAngle) {
                    const deltaVector = new Vector2([-deltaX, -deltaY])
                    if (deltaVector.magnitude() === 0) return

                    const control = this.point.controls.find(c => c !== this)
                    const radiusVector = Vector2.fromPoints(control.coords, this.point.coords)

                    const cos = radiusVector.dotProduct(deltaVector) / (radiusVector.magnitude() * deltaVector.magnitude())

                    const angle = Math.acos(cos)

                    console.log(cos, angle)

                    const rotatedVector = radiusVector.rotate(angle / 180 * Math.PI)

                    const moveVector = radiusVector.addVector(rotatedVector.reverse())

                    // control.move(moveVector.x, moveVector.y)
                    control.repaint()
                }

                this.repaint()
                this.point.repaint()
                this.point.segments.forEach(function (segment) { segment.repaint() })
                this.shape.repaint()
            }

            lastX = event.clientX
            lastY = event.clientY
        }

        return function () {
            document.removeEventListener('mouseenter', onMouseEnter)
            document.removeEventListener('mouseleave', onMouseLeave)
            document.removeEventListener('mousedown', onMouseDownBinded)
            document.removeEventListener('mousemove', onMouseMoveBinded)
            document.removeEventListener('mouseup', onMouseUpBinded)

            this.handlerElement.parentElement.remove()
        }
    }

    this.draw = function () {
        const { point, coords, container, handlerElement, lineElement } = this

        const controlElem = createSVGElement('g')

        if (this.point.isBezier) {
            controlElem.setAttribute('visibility', 'visible')
        } else {
            controlElem.setAttribute('visibility', 'hidden')
        }

        handlerElement.setAttribute('cx', coords[0])
        handlerElement.setAttribute('cy', coords[1])

        handlerElement.setAttribute('r', 5)


        handlerElement.setAttribute('fill', '#0f0')

        lineElement.setAttribute('d', `M ${point.coords[0]} ${point.coords[1]} L ${coords[0]} ${coords[1]}`)
        lineElement.setAttribute('stroke', '#00f')
        lineElement.setAttribute('fill', 'transparent')



        controlElem.append(lineElement, handlerElement)

        // handlerElement.dataset['pointIndex'] = pointIndex
        // handlerElement.dataset['controlIndex'] = controlIndex
        handlerElement.dataset['controlType'] = 'control'

        this.clear = handleEvents.call(this, handlerElement)

        container.append(controlElem)
    }
}

function Segment(points, container, shape) {
    this.points = points
    this.container = container
    this.shape = shape
    this.wrapperElement = createSVGElement('g')
    this.segmentElement = createSVGElement('path')
    this.centerElement = createSVGElement('circle')
    this.isSelected = false

    this.move = function (x, y) {
        this.points.forEach(function (point) {
            point.move(x, y)
        })
    }

    this.select = function () {
        this.points.forEach(function (point) { point.select() })

        this.isSelected = true
    }

    this.unselect = function () {
        this.points.forEach(function (point) { point.unselect() })

        this.isSelected = false
    }

    this.getCenter = function () {
        const point = this.points[0]
        const nextPoint = this.points[1]

        return calculateBezier(0.5, point.coords, point.controls[1].coords, nextPoint.controls[0].coords, nextPoint.coords)
    }

    this.repaint = function () {
        const { points, segmentElement, centerElement } = this

        const point = points[0]
        const nextPoint = points[1]

        const segmentD = `M ${point.coords[0]} ${point.coords[1]} ` +
            `C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]} ${nextPoint.controls[0].coords[0]} ${nextPoint.controls[0].coords[1]} ` +
            `${nextPoint.coords[0]} ${nextPoint.coords[1]} ` +
            `C ${nextPoint.controls[0].coords[0]} ${nextPoint.controls[0].coords[1]} ${point.controls[1].coords[0]} ${point.controls[1].coords[1]} ` +
            `${point.coords[0]} ${point.coords[1]}`

        segmentElement.setAttribute('d', segmentD)

        const centerCoords = this.getCenter()

        centerElement.setAttribute('cx', centerCoords[0])
        centerElement.setAttribute('cy', centerCoords[1])

        // if (this.selected)
    }

    this.getLUT = function (steps) {
        if (steps <= 0) return

        const increment = 1.0 / steps
        let t = 0

        const LUT = new Array(steps)

        const point = points[0]
        const nextPoint = points[1]

        for (let index = 0; index < steps; index++) {
            LUT[index] = calculateBezier(t, point.coords, point.controls[1].coords, nextPoint.controls[0].coords, nextPoint.coords)
            t += increment
        }

        return LUT
    }

    function handleEvents(element) {
        element.addEventListener('mouseenter', onMouseEnter)
        element.addEventListener('mouseleave', onMouseLeave)

        let lastX
        let lastY
        let deltaSum = 0

        const onMouseDragBinded = onMouseDrag.bind(this)
        const onMouseDownBinded = onMouseDown.bind(this)
        const onMouseUpBinded = onMouseUp.bind(this)

        function onMouseEnter() {
            document.addEventListener('mousedown', onMouseDownBinded)
            document.addEventListener('mouseup', onMouseUpBinded)
        }

        function onMouseLeave() {
            document.removeEventListener('mousedown', onMouseDownBinded)
        }

        function onMouseDown() {
            document.addEventListener('mousemove', onMouseDragBinded)

            if (!this.selected) {
                this.shape.selectSegment(this)
            }
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseDragBinded)
            document.removeEventListener('mouseup', onMouseUpBinded)

            if (deltaSum !== 0) {
                console.log('segmentMoveCommand')
                deltaSum = 0
            }

            lastX = null
            lastY = null
        }

        function onMouseDrag(event) {
            if (lastX && lastY) {
                let deltaX = event.clientX - lastX
                let deltaY = event.clientY - lastY

                deltaSum += deltaX + deltaY

                this.move(deltaX, deltaY)

                this.points.forEach(function (point) {
                    point.repaint()
                    point.controls.forEach(function (control) {
                        control.repaint()
                    })
                })

                this.shape.repaint(true)
            }

            lastX = event.clientX
            lastY = event.clientY
        }

        return function () {
            document.removeEventListener('mouseenter', onMouseEnter)
            document.removeEventListener('mouseleave', onMouseLeave)
            document.removeEventListener('mousedown', onMouseDownBinded)
            document.removeEventListener('mouseup', onMouseUpBinded)
            document.removeEventListener('mousemove', onMouseDragBinded)

            this.segmentElement.remove()
        }
    }

    function handleEventsCenter(element) {
        const onMouseDownBinded = onMouseDown.bind(this)

        element.addEventListener('mousedown', onMouseDownBinded)

        function onMouseDown() {
            const center = this.getCenter()
            const point = this.shape.insertPointAfter(this.points[1], center[0], center[1])

            if (this.points[0].isBezier || this.points[1].isBezier) {
                point.toggleBezier()
            }

            this.shape.selectPoint(point)
        }

        return function () {
            element.removeEventListener('mousedown', onMouseDownBinded)

            this.centerElement.remove()
        }
    }

    this.draw = function () {
        const { points, container, segmentElement, centerElement, wrapperElement } = this

        const point = points[0]
        const nextPoint = points[1]

        const segmentD = `M ${point.coords[0]} ${point.coords[1]} ` +
            `C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]} ${nextPoint.controls[0].coords[0]} ${nextPoint.controls[0].coords[1]} ` +
            `${nextPoint.coords[0]} ${nextPoint.coords[1]} ` +
            `C ${nextPoint.controls[0].coords[0]} ${nextPoint.controls[0].coords[1]} ${point.controls[1].coords[0]} ${point.controls[1].coords[1]} ` +
            `${point.coords[0]} ${point.coords[1]}`

        segmentElement.setAttribute('d', segmentD)
        segmentElement.setAttribute('fill', 'transparent')
        segmentElement.setAttribute('stroke', '#0000ff')
        segmentElement.setAttribute('stroke-width', 8)
        segmentElement.dataset['controlType'] = 'segment'

        const centerCoords = calculateBezier(0.5, point.coords, point.controls[1].coords, nextPoint.controls[0].coords, nextPoint.coords)

        centerElement.setAttribute('cx', centerCoords[0])
        centerElement.setAttribute('cy', centerCoords[1])
        centerElement.setAttribute('r', 5)
        centerElement.setAttribute('stroke', '#00f')
        centerElement.setAttribute('fill', '#fff')
        centerElement.setAttribute('visibility', 'hidden')
        centerElement.classList.toggle('center')

        const clearSegment = handleEvents.call(this, segmentElement)
        const clearCenter = handleEventsCenter.call(this, centerElement)

        this.clear = function () {
            clearSegment.call(this)
            clearCenter.call(this)

            wrapperElement.remove()
        }

        wrapperElement.classList.toggle('segment-wrapper')

        wrapperElement.append(segmentElement)
        wrapperElement.append(centerElement)

        container.append(wrapperElement)
    }
}

function Shape(container) {
    this.points = []
    this.segments = []
    this.handlers = []
    this.isClosed = false
    this.isEditMode = false
    this.isDrawMode = false

    this.container = container

    this.shapeElement = createSVGElement('path')
    this.segmentsContainer = createSVGElement('g')
    this.controlsContainer = createSVGElement('g')

    this.segmentsContainer.classList.add('controls-container')
    this.controlsContainer.classList.add('controls-container')

    this.container.append(this.shapeElement)
    this.container.append(this.segmentsContainer)
    this.container.append(this.controlsContainer)

    this.fill = '#0000ff50'
    this.stroke = '#f00'
    this.strokeWidth = 1

    this.clear = handleEvents.call(this)

    this.setFill = function (value) {
        this.fill = value
        this.drawShape()
    }

    this.setStroke = function (value) {
        this.stroke = value
        this.drawShape()
    }

    this.setStrokeWidth = function (value) {
        this.strokeWidth = value
        this.drawShape()
    }

    this.addPoint = function (x, y) {
        const coords = [x, y]
        const controls = [[x, y], [x, y]]

        const point = new Point(coords, [], this.controlsContainer, this)

        const handler1 = new Handler(point, controls[0], this.controlsContainer, this)
        const handler2 = new Handler(point, controls[1], this.controlsContainer, this)

        point.controls = [handler1, handler2]

        this.points.push(point)
        this.handlers.push(handler1)
        this.handlers.push(handler2)

        point.draw()
        handler1.draw()
        handler2.draw()

        this.calculateSegments()

        this.repaint()

        return point
    }

    this.insertPointAfter = function (beforePoint, x, y) {
        const index = this.points.findIndex(p => p === beforePoint)

        if (index === -1) return null

        const coords = [x, y]
        const controls = [[x, y], [x, y]]

        const point = new Point(coords, [], this.controlsContainer, this)

        const handler1 = new Handler(point, controls[0], this.controlsContainer, this)
        const handler2 = new Handler(point, controls[1], this.controlsContainer, this)

        point.controls = [handler1, handler2]

        this.points.splice(index, 0, point)

        this.handlers.push(handler1)
        this.handlers.push(handler2)

        point.draw()
        handler1.draw()
        handler2.draw()

        this.calculateSegments()
        this.repaint()

        console.log(this)

        return point
    }

    this.calculateSegments = function () {
        if (this.segments) {
            this.segments.forEach(function (segment) { segment.clear() })
        }

        this.segments = []

        if (this.points.length < 2) return

        this.points.forEach(function (point) {
            point.segments = []
        })

        for (let index = 0; index < this.points.length - 1; index++) {
            const point = this.points[index];
            const nextPoint = this.points[index + 1]

            const segment = new Segment([point, nextPoint], this.segmentsContainer, this)

            point.segments.push(segment)
            nextPoint.segments.push(segment)

            this.segments.push(segment)
            segment.draw()
        }

        if (this.isClosed) {
            const firstPoint = this.points[0]
            const lastPoint = this.points[this.points.length - 1]

            const segment = new Segment([lastPoint, firstPoint], this.segmentsContainer, this)

            firstPoint.segments.push(segment)
            lastPoint.segments.push(segment)

            this.segments.push(segment)
            segment.draw()
        }
    }

    this.removePointIndex = function (index) {
        if (this.points.length <= 0) return

        const point = this.points[index]

        this.handlers = this.handlers.filter(handler => handler.point !== point)

        point.controls.forEach(function (control) { control.clear() })
        point.clear()

        this.points.splice(index, 1)
        this.calculateSegments()
        this.repaintAll()
    }

    this.removePoint = function (point) {
        const pointIndex = this.points.findIndex(p => p === point)

        if (pointIndex !== -1) this.removePointIndex(pointIndex)
    }

    this.removePointLast = function () {
        this.removePointIndex(this.points.length - 1)
    }

    this.close = function () {
        this.isClosed = true

        this.calculateSegments()
    }

    this.move = function (x, y) {
        this.points.forEach(function (point) { point.move(x, y) })
    }

    this.drawShape = function () {
        if (this.points.length < 2) {
            return this.shapeElement.setAttribute('d', '')
        }

        let d = this.points.map((point, index) => {
            if (index === 0) return `M ${point.coords[0]} ${point.coords[1]} C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]}`
            if (index === this.points.length - 1)
                return `${point.controls[0].coords[0]} ${point.controls[0].coords[1]} ${point.coords[0]} ${point.coords[1]}`
            return `${point.controls[0].coords[0]} ${point.controls[0].coords[1]} ${point.coords[0]} ${point.coords[1]} C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]}`
        }).join(' ')

        if (this.isClosed) {
            const firstPoint = this.points[0]
            const lastPoint = this.points[this.points.length - 1]

            d += `C ${lastPoint.controls[1].coords[0]} ${lastPoint.controls[1].coords[1]} ${firstPoint.controls[0].coords[0]} ${firstPoint.controls[0].coords[1]} ${firstPoint.coords[0]} ${firstPoint.coords[1]}`
        }

        this.shapeElement.setAttribute('d', d)
        this.shapeElement.setAttribute('fill', this.fill)
        this.shapeElement.setAttribute('stroke', this.stroke)
        this.shapeElement.setAttribute('stroke-width', this.strokeWidth)
    }

    this.repaint = function (repaintSegments = false) {
        this.drawShape()

        if (repaintSegments) {
            this.segments.forEach(function (segment) { segment.repaint() })
        }
    }

    this.repaintAll = function () {
        this.drawShape()

        this.points.forEach(function (point) {
            point.repaint()
        })
        this.handlers.forEach(function (handler) { handler.repaint() })
        this.segments.forEach(function (segment) { segment.repaint() })

        if (this.isEditMode) {
            this.segmentsContainer.setAttribute('visibility', 'visible')
            this.controlsContainer.setAttribute('visibility', 'visible')
        }
        else {
            this.segmentsContainer.setAttribute('visibility', 'hidden')
            this.controlsContainer.setAttribute('visibility', 'hidden')
        }
    }

    this.selectPoint = function (point) {
        this.points.forEach(function (p) { p.unselect() })

        point.select()
    }

    this.selectSegment = function (segment) {
        this.segments.forEach(function (s) { s.unselect() })

        segment.select()
    }

    this.saveToJSON = function () {
        const pointsJSON = []

        this.points.forEach(function (point) {
            pointsJSON.push(point.toJSON())
        })

        return {
            points: pointsJSON
        }
    }

    this.setEditMode = function (value) {
        this.points.forEach(function (p) { p.unselect() })

        this.isEditMode = value
        this.repaintAll()
    }

    function handleEvents() {
        const onClickBinded = onClick.bind(this)

        this.container.addEventListener('click', onClickBinded)

        function onClick(event) {
            if (this.isDrawMode) return

            if (this.container.contains(event.target) && this.container !== event.target) {
                if (this.isEditMode) return
                this.setEditMode(true)
            } else {
                if (!this.isEditMode) return
                this.setEditMode(false)
            }
        }

        return function () {
            this.container.removeEventListener('click', onClickBinded)

            this.points.forEach(function (point) { point.clear() })
            this.handlers.forEach(function (handler) { handler.clear() })
            this.segments.forEach(function (segment) { segment.clear() })
            this.shapeElement.remove()
        }
    }
}

function Command(execute, undo, arguments) {
    this.execute = execute
    this.undo = undo
    this.arguments = arguments
}

function CommandManager() {
    this.buffer = []

    this.save = function (command) {
        this.buffer.push(command)
    }

    this.exec = function (command) {
        command.do()
    }

    this.undo = function () {
        const command = this.buffer.pop()

        if (command !== void 0) command.undo()
    }
}

function stressTest(shape) {
    let x = 1000
    let y = 1000

    for (let i = x; i > 0; i -= 50) {
        for (let j = y; j > 0; j -= 50) {
            shape.addPoint(i, j)
        }
    }
}

function drawNewShape(shape, container) {
    const drawContainer = createSVGElement('g')
    const drawGuide = createSVGElement('path')

    drawContainer.classList.toggle('draw-container', true)

    drawGuide.setAttribute('fill', 'transparent')
    drawGuide.setAttribute('stroke', '#00f')

    drawContainer.append(drawGuide)
    container.append(drawContainer)

    shape.isDrawMode = true

    function handleEvents() {
        container.addEventListener('click', onClick)
        container.addEventListener('mousemove', onMouseMove)

        document.addEventListener('keydown', onKeyDown)

        let lastPoint

        function onClick(event) {
            const target = event.target
            if (target.dataset['controlType'] === 'point' && target.dataset['pointIndex'] === '0') {
                shape.isDrawMode = false

                shape.close()
                shape.repaintAll()
                container.removeEventListener('click', onClick)
                clear()
                return
            }

            lastPoint = shape.addPoint(event.offsetX, event.offsetY)
        }

        function onMouseMove(event) {
            if (lastPoint === void 0) return

            const offsetX = event.offsetX
            const offsetY = event.offsetY

            const d = `M ${lastPoint.coords[0]} ${lastPoint.coords[1]} C ${lastPoint.controls[1].coords[0]} ${lastPoint.controls[1].coords[1]} ` +
                `${offsetX} ${offsetY} ${offsetX} ${offsetY}`

            drawGuide.setAttribute('d', d)
        }

        function onKeyDown(event) {
            if (event.key === 'Escape') {
                clear()

                shape.isDrawMode = false
                shape.repaintAll()
            }
        }

        function clear() {
            container.removeEventListener('click', onClick)
            container.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('keydown', onKeyDown)

            drawContainer.remove()
            drawGuide.remove()
        }
    }

    handleEvents()
}

function t_shapes__init() {
    const svgElement = document.querySelector('.js-svg')

    const svgElementRect = svgElement.getBoundingClientRect()

    const width = 1000
    const height = 1000

    svgElement.setAttribute('width', width)
    svgElement.setAttribute('height', height)

    let shape = new Shape(svgElement)

    drawNewShape(shape, svgElement)

    const drawNewButton = document.querySelector('.js-drawNewShape')

    drawNewButton.addEventListener('click', () => {
        shape.clear()
        shape = new Shape(svgElement)
        drawNewShape(shape, svgElement)
    })

    // shape.addPoint(450, 450)
    // shape.addPoint(550, 450)
    // shape.addPoint(550, 550)
    // shape.addPoint(450, 550)

    // shape.close()

    // // stressTest(shape)

    // // shape.close()

    // shape.points.forEach(p => p.toggleBezier())

    // shape.repaintAll()
    // shape.initalDraw()

    // let mult = 1

    // setInterval(() => {
    //     AUTO_HANDLERS_MULTIPLIER += 0.1 * mult

    //     shape.points.forEach(p => p.autoHandlers())

    //     shape.repaintAll()

    //     if (AUTO_HANDLERS_MULTIPLIER > 20) mult = -1
    //     if (AUTO_HANDLERS_MULTIPLIER < -20) mult = 1
    // }, 20);

    const hueInput = document.querySelector('.js-hue')

    hueInput.addEventListener('input', onHueInput)

    function onHueInput(event) {
        shape.setFill(`hsl(${event.target.value}, 100%, 50%)`)
    }

    shape.setFill('#f4a612')
    shape.setStroke('#000')
    shape.setStrokeWidth(3)
}

window.addEventListener('DOMContentLoaded', t_shapes__init)