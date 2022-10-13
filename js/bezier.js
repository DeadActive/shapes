function createSVGElement(tag, options) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag, options)
}

function setCSSProperty(el, property, value) {
    el.style.setProperty(property, value)
}

function vectorDistance(x, y, x1, y1) {
    return Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2))
}

function distance(point1, point2) {
    return vectorDistance(point1[0], point1[1], point2[0], point2[1])
}

function calculateBezier(t, p1, p2, p3, p4) {
    const x = Math.pow(1 - t, 3) * p1[0] + 3 * Math.pow(1 - t, 2) * t * p2[0] + 3 * (1 - t) * t * t * p3[0] + (t * t * t * p4[0])
    const y = Math.pow(1 - t, 3) * p1[1] + 3 * Math.pow(1 - t, 2) * t * p2[1] + 3 * (1 - t) * t * t * p3[1] + (t * t * t * p4[1])

    return [x, y]
}

function calculateQuadraticBezier(t, p1, p2, p3) {
    const x = Math.pow(1 - t, 2) * p1[0] + 2 * (1 - t) * t * p2[0] + t * t * p3[0]
    const y = Math.pow(1 - t, 2) * p1[1] + 2 * (1 - t) * t * p2[1] + t * t * p3[1]

    return [x, y]
}

function calculateBezierDerivative(t, p0, p1, p2, p3) {
    const x = 3 * Math.pow(1 - t, 2) * (p1[0] - p0[0]) + 6 * (1 - t) * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0])
    const y = 3 * Math.pow(1 - t, 2) * (p1[1] - p0[1]) + 6 * (1 - t) * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1])

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
        console.log(this.isSelected, this.isBezier)
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

    this.updateBehavior = function () {
        if (this.removeBehavior) this.removeBehavior()
        this.removeBehavior = this.shape.behaviors['points'].call(this, this.pointElement)
    }

    this.clear = function () {
        if (this.removeBehavior) this.removeBehavior()
        this.pointElement.remove()
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

        pointElement.dataset['controlType'] = 'point'
        this.pointElement.dataset['pointIndex'] = this.shape.points.length - 1

        container.append(pointElement)
    }

    this.toJSON = function () {
        return {
            coords: this.coords,
            isBezier: this.isBezier,
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
    this.controlElem = createSVGElement('g')
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

    this.updateBehavior = function () {
        if (this.removeBehavior) this.removeBehavior()
        this.removeBehavior = this.shape.behaviors['handlers'].call(this, this.handlerElement)
    }

    this.clear = function () {
        if (this.removeBehavior) this.removeBehavior()
        this.handlerElement.remove()
        this.lineElement.remove()
        this.controlElem.remove()
    }

    this.draw = function () {
        const { point, coords, container, handlerElement, lineElement, controlElem } = this

        controlElem.classList.toggle('control-wrapper', true)

        if (this.point.isBezier) {
            controlElem.setAttribute('visibility', 'visible')
        } else {
            controlElem.setAttribute('visibility', 'hidden')
        }

        handlerElement.setAttribute('cx', coords[0])
        handlerElement.setAttribute('cy', coords[1])

        handlerElement.setAttribute('r', 5)

        lineElement.setAttribute('d', `M ${point.coords[0]} ${point.coords[1]} L ${coords[0]} ${coords[1]}`)

        controlElem.append(lineElement, handlerElement)

        // handlerElement.dataset['pointIndex'] = pointIndex
        // handlerElement.dataset['controlIndex'] = controlIndex
        handlerElement.dataset['controlType'] = 'control'

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

    this.split = function (t) {
        const prevPoint = this.points[0]
        const nextPoint = this.points[1]

        const pointCoords = calculateBezier(t, prevPoint.coords, prevPoint.controls[1].coords, nextPoint.controls[0].coords, nextPoint.coords)
        const point = this.shape.insertPointAfter(nextPoint, pointCoords[0], pointCoords[1])

        point.isBezier = prevPoint.isBezier || nextPoint.isBezier

        if (point.isBezier) {
            const leftHandlers = [
                calculateBezier(t, prevPoint.coords, prevPoint.coords, prevPoint.controls[1].coords, prevPoint.controls[1].coords),
                calculateQuadraticBezier(t, prevPoint.coords, prevPoint.controls[1].coords, nextPoint.controls[0].coords)
            ]
            const rightHandlers = [
                calculateBezier(1 - t, nextPoint.coords, nextPoint.coords, nextPoint.controls[0].coords, nextPoint.controls[0].coords),
                calculateQuadraticBezier(1 - t, nextPoint.coords, nextPoint.controls[0].coords, prevPoint.controls[1].coords)
            ]

            prevPoint.controls[1].moveTo(leftHandlers[0][0], leftHandlers[0][1])

            point.controls[0].moveTo(leftHandlers[1][0], leftHandlers[1][1])
            point.controls[1].moveTo(rightHandlers[1][0], rightHandlers[1][1])

            nextPoint.controls[0].moveTo(rightHandlers[0][0], rightHandlers[0][1])
        }

        this.shape.repaintAll()
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

    this.getLength = function () {
        const LUT = this.getLUT(10)

        let length = 0

        for (let index = 0; index < LUT.length - 1; index++) {
            const point = LUT[index];
            const nextPoint = LUT[index + 1]

            length += distance(point, nextPoint)
        }

        return length
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

    this.updateBehavior = function () {
        if (this.removeBehavior) this.removeBehavior()
        this.removeBehavior = this.shape.behaviors['segments'].call(this, this.segmentElement)
    }

    this.clear = function () {
        if (this.removeBehavior) this.removeBehavior()
        this.centerElement.remove()
        this.segmentElement.remove()
        this.wrapperElement.remove()
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
        segmentElement.setAttribute('stroke-width', 8)
        segmentElement.dataset['controlType'] = 'segment'

        const centerCoords = calculateBezier(0.5, point.coords, point.controls[1].coords, nextPoint.controls[0].coords, nextPoint.coords)

        centerElement.setAttribute('cx', centerCoords[0])
        centerElement.setAttribute('cy', centerCoords[1])
        centerElement.setAttribute('r', 5)
        centerElement.setAttribute('visibility', 'hidden')
        centerElement.classList.toggle('center')

        wrapperElement.classList.toggle('segment-wrapper')

        wrapperElement.append(segmentElement)
        wrapperElement.append(centerElement)

        container.append(wrapperElement)
    }
}

function Shape(container, behaviors) {
    this.points = []
    this.segments = []
    this.handlers = []
    this.isClosed = false
    this.isDrawHandlers = false
    this.behaviors = behaviors

    this.container = container

    this.shapeElement = createSVGElement('path')
    this.segmentsContainer = createSVGElement('g')
    this.controlsContainer = createSVGElement('g')

    this.shapeElement.dataset['controlType'] = 'shape'

    this.segmentsContainer.classList.add('controls-container')
    this.controlsContainer.classList.add('controls-container')

    this.container.append(this.shapeElement)
    this.container.append(this.segmentsContainer)
    this.container.append(this.controlsContainer)

    this.fill = '#0000ff50'
    this.stroke = '#f00'
    this.strokeWidth = 1

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

    this.loadPoint = function (parameters) {
        const point = new Point(parameters.coords, [], this.controlsContainer, this)

        const handler1 = new Handler(point, parameters.controls[0], this.controlsContainer, this)
        const handler2 = new Handler(point, parameters.controls[1], this.controlsContainer, this)

        point.controls = [handler1, handler2]

        this.points.push(point)
        this.handlers.push(handler1)
        this.handlers.push(handler2)

        point.draw()
        handler1.draw()
        handler2.draw()

        point.isBezier = parameters.isBezier
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

        this.updateBehaviors()
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
        this.updateBehaviors()
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

        if (this.isDrawHandlers) {
            this.segmentsContainer.setAttribute('visibility', 'visible')
            this.controlsContainer.setAttribute('visibility', 'visible')
        }
        else {
            this.segmentsContainer.setAttribute('visibility', 'hidden')
            this.controlsContainer.setAttribute('visibility', 'hidden')
        }
    }

    this.setBahaviors = function (behaviors) {
        this.behaviors = behaviors
        this.updateBehaviors()
    }

    this.updateBehaviors = function () {
        this.points.forEach((point) => point.updateBehavior())
        this.handlers.forEach(handler => handler.updateBehavior())
        this.segments.forEach(segment => segment.updateBehavior())
        this.updateBehavior()

        console.log('update behaviors')
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
            fill: this.fill,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth,
            points: pointsJSON
        }
    }

    this.loadFromJSON = function (parameters) {
        console.log(this)

        parameters.points.forEach((pointParams) => {
            this.loadPoint(pointParams)
        })

        this.fill = parameters.fill
        this.stroke = parameters.stroke
        this.strokeWidth = parameters.strokeWidth

        this.calculateSegments()
        this.repaintAll()
    }

    this.saveToSVG = function () {
        this.repaintAll()
        return this.shapeElement
    }

    this.setDrawHandlers = function (value) {
        this.points.forEach(function (p) { p.unselect() })

        this.isDrawHandlers = value
        this.repaintAll()
    }

    this.updateBehavior = function () {
        if (this.removeBehavior) this.removeBehavior()
        this.removeBehavior = this.behaviors['shapes'].call(this, this.shapeElement)
    }

    this.clear = function () {
        if (this.removeBehavior) this.removeBehavior()
        this.points.forEach(function (point) { point.clear() })
        this.handlers.forEach(function (handler) { handler.clear() })
        this.segments.forEach(function (segment) { segment.clear() })
        this.shapeElement.remove()
        this.controlsContainer.remove()
        this.segmentsContainer.remove()
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

function pointEditBehavior(element) {
    let lastX
    let lastY
    let lastPointX = this.coords[0]
    let lastPointY = this.coords[1]

    const onMouseUpBinded = onMouseUp.bind(this)
    const onMouseMoveBinded = onMouseMove.bind(this)
    const onMouseDownBinded = onMouseDown.bind(this)
    const onDoubleClickBinded = onDoubleClick.bind(this)
    const onKeyDownBinded = onKeyDown.bind(this)

    element.addEventListener('mouseenter', onMouseEnter)
    element.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('keydown', onKeyDownBinded)

    function onDoubleClick() {
        document.addEventListener('mousedown', onMouseDownBinded)
        document.addEventListener('mouseup', onMouseUpBinded)

        document.removeEventListener('mousemove', onMouseMoveBinded)

        this.toggleBezier()

        this.shape.selectPoint(this)

        this.controls.forEach(function (control) {
            control.repaint()
        })
        this.segments.forEach(function (segment) { segment.repaint() })

        this.shape.repaint()
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
        element.addEventListener('dblclick', onDoubleClickBinded)
    }

    function onMouseLeave() {
        document.removeEventListener('mousedown', onMouseDownBinded)
        element.removeEventListener('dblclick', onDoubleClickBinded)
    }

    function onMouseDown() {
        document.addEventListener('mousemove', onMouseMoveBinded)

        lastPointX = this.coords[0]
        lastPointY = this.coords[1]

        if (!this.isSelected) {
            this.shape.selectPoint(this)
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMoveBinded)
        document.removeEventListener('mouseup', onMouseUpBinded)

        lastX = null
        lastY = null

        const isLastPoint = +this.pointElement.dataset['pointIndex'] === this.shape.points.length - 1

        if (isLastPoint && !this.shape.isClosed) {
            const firstPoint = this.shape.points[0]
            const offset = 5

            if (
                this.coords[0] > firstPoint.coords[0] - offset
                && this.coords[0] < firstPoint.coords[0] + offset
                && this.coords[1] > firstPoint.coords[1] - offset
                && this.coords[1] < firstPoint.coords[1] + offset
            ) {
                this.shape.removePoint(this)

                this.shape.close()
                this.shape.repaintAll()
            }
        }

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
    }
}

function handlerEditBehavior(element) {
    element.addEventListener('mouseenter', onMouseEnter)
    element.addEventListener('mouseleave', onMouseLeave)

    let lastX
    let lastY
    let lastHandlerX
    let lastHandlerY

    const onMouseMoveBinded = onMouseMove.bind(this)
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
        element.removeEventListener('mouseenter', onMouseEnter)
        element.removeEventListener('mouseleave', onMouseLeave)
        document.removeEventListener('mousedown', onMouseDownBinded)
        document.removeEventListener('mousemove', onMouseMoveBinded)
        document.removeEventListener('mouseup', onMouseUpBinded)
    }
}

function segmentEditBehavior(element) {
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

    const centerElement = this.centerElement
    const onMouseDownBindedCenter = onMouseDownCenter.bind(this)

    centerElement.addEventListener('mousedown', onMouseDownBindedCenter)

    function onMouseDownCenter() {
        const center = this.getCenter()
        const point = this.shape.insertPointAfter(this.points[1], center[0], center[1])

        if (this.points[0].isBezier || this.points[1].isBezier) {
            point.toggleBezier()
        }

        this.shape.selectPoint(point)
    }

    return function () {
        element.removeEventListener('mouseenter', onMouseEnter)
        element.removeEventListener('mouseleave', onMouseLeave)
        document.removeEventListener('mousedown', onMouseDownBinded)
        document.removeEventListener('mouseup', onMouseUpBinded)
        document.removeEventListener('mousemove', onMouseDragBinded)

        centerElement.removeEventListener('mousedown', onMouseDownBindedCenter)
    }
}

function shapeEditBehavior() {
    const onClickBinded = onClick.bind(this)

    this.container.addEventListener('click', onClickBinded)

    function onClick(event) {
        if ((this.shapeElement.contains(event.target)
            || this.controlsContainer.contains(event.target)
            || this.segmentsContainer.contains(event.target))
            && this.container !== event.target) {
            if (this.isDrawHandlers) return
            this.setDrawHandlers(true)
        } else {
            if (!this.isDrawHandlers) return
            this.setDrawHandlers(false)
        }
    }

    return function () {
        this.container.removeEventListener('click', onClickBinded)
    }
}

function shapeDrawBehavior() {
    const onClickBinded = onClick.bind(this)

    this.container.addEventListener('click', onClickBinded)

    function onClick(event) {
        if (event.target.contains(this.shapeElement) && this.container !== event.target) {
            if (this.isDrawHandlers) return
            this.setDrawHandlers(true)
        } else {
            if (!this.isDrawHandlers) return
            this.setDrawHandlers(false)
        }
    }

    return function () {
        this.container.removeEventListener('click', onClickBinded)
    }
}

function segmentDrawBehavior(element) {
    element.setAttribute('visibility', 'visible')

    const onMouseMoveBinded = onMouseMove.bind(this)
    const onMouseEnterBinded = onMouseEnter.bind(this)
    const onClickAddBinded = onClickAdd.bind(this)

    element.addEventListener('mousemove', onMouseMoveBinded)
    element.addEventListener('mouseenter', onMouseEnterBinded)

    let LUT
    let resultPoint
    let pointIndex = 0
    let lutIterations

    function onMouseEnter() {
        if (LUT === void 0) {
            lutIterations = Math.ceil(this.getLength() / 5)
            LUT = this.getLUT(lutIterations)
            LUT.pop()
            LUT.shift()

            console.log(lutIterations)
        }
    }

    function onMouseMove(event) {
        if (!this.shape.isDrawHandlers) return

        let d = 100
        const cursor = [event.offsetX, event.offsetY]

        for (let index = 0; index < LUT.length; index++) {
            const coords = LUT[index]
            const q = distance(coords, cursor)

            if (q < d) {
                d = q
                pointIndex = index
            }
        }

        resultPoint = LUT[pointIndex]

        this.centerElement.setAttribute('cx', resultPoint[0])
        this.centerElement.setAttribute('cy', resultPoint[1])

        this.centerElement.removeEventListener('click', onClickAddBinded)
        this.centerElement.addEventListener('click', onClickAddBinded)
    }

    function onClickAdd(event) {
        event.stopPropagation()

        const t = 1 / lutIterations * (pointIndex + 1)
        this.split(t)
    }

    return function () {
        element.removeEventListener('mousemove', onMouseMoveBinded)
        element.removeEventListener('mouseenter', onMouseEnterBinded)
        this.centerElement.removeEventListener('click', onClickAddBinded)
    }
}

function editorDrawBehavior() {
    const { container } = this

    const onFirstClickBinded = onFirstClick.bind(this)
    const onKeyDownBinded = onKeyDown.bind(this)
    const onDoubleClickBinded = onDoubleClick.bind(this)
    const onMouseDownBinded = onMouseDown.bind(this)
    const onMouseUpBinded = onMouseUp.bind(this)

    container.addEventListener('mousedown', onFirstClickBinded, { once: true })
    document.addEventListener('keydown', onKeyDownBinded)

    let lastPoint
    let shape
    let drawGuide
    let isDragging
    let lastX
    let lastY

    function onFirstClick(event) {
        const target = event.target

        if (target.dataset['controlType'] === 'point' || target.dataset['controlType'] === 'shape') {
            return container.addEventListener('mousedown', onFirstClickBinded, { once: true })
        }

        shape = this.createShape()
        lastPoint = shape.addPoint(event.offsetX, event.offsetY)

        drawGuide = createSVGElement('path')
        drawGuide.setAttribute('fill', 'transparent')
        drawGuide.setAttribute('stroke', '#00f')

        container.addEventListener('mousedown', onMouseDownBinded)
        container.addEventListener('mousemove', onMouseMove)
        container.addEventListener('dblclick', onDoubleClickBinded)
        this.drawContainer.append(drawGuide)
    }

    function onMouseDown(event) {
        const target = event.target

        console.log('md', shape)

        if (target.dataset['controlType'] === 'point' && target.dataset['pointIndex'] === '0') {
            drawGuide.remove()

            shape.close()
            shape.repaintAll()

            container.removeEventListener('mousedown', onMouseDownBinded)
            container.addEventListener('mousedown', onFirstClickBinded, { once: true })
            return
        }
        if (target.dataset['controlType'] === 'point') return

        lastPoint = shape.addPoint(event.offsetX, event.offsetY)

        isDragging = true
        container.addEventListener('mouseup', onMouseUpBinded)
    }

    function onMouseUp(event) {
        isDragging = false
        container.removeEventListener('mouseup', onMouseUpBinded)

        lastX = null
        lastY = null
    }

    function onMouseMove(event) {
        if (lastPoint === void 0) return

        const offsetX = event.offsetX
        const offsetY = event.offsetY

        if (isDragging && lastX && lastY) {

            if (!lastPoint.isBezier) {
                lastPoint.isBezier = true
            }

            const deltaX = event.clientX - lastX
            const deltaY = event.clientY - lastY

            lastPoint.controls[0].move(-deltaX, -deltaY)
            lastPoint.controls[1].move(deltaX, deltaY)

            lastPoint.shape.repaintAll()
        }

        const d = `M ${lastPoint.coords[0]} ${lastPoint.coords[1]} C ${lastPoint.controls[1].coords[0]} ${lastPoint.controls[1].coords[1]} ` +
            `${offsetX} ${offsetY} ${offsetX} ${offsetY}`

        drawGuide.setAttribute('d', d)

        lastX = event.clientX
        lastY = event.clientY
    }

    function onDoubleClick(event) {
        if (shape.points.length <= 1) {
            this.removeShape(shape)
        }

        container.removeEventListener('mousedown', onMouseDownBinded)
        container.removeEventListener('mousemove', onMouseMove)
        container.removeEventListener('dblclick', onDoubleClickBinded)

        container.addEventListener('mousedown', onFirstClickBinded, { once: true })

        shape.repaintAll()
        drawGuide.remove()
    }

    function onKeyDown(event) {
        if (event.key === 'Escape') {
            if (shape.points.length <= 1) {
                this.removeShape(shape)
            }

            container.removeEventListener('mousedown', onMouseDownBinded)
            container.removeEventListener('mousemove', onMouseMove)

            container.addEventListener('mousedown', onFirstClickBinded, { once: true })

            shape.repaintAll()
            drawGuide.remove()
        }
    }

    return function () {
        container.removeEventListener('mousedown', onFirstClickBinded)
        container.removeEventListener('mousedown', onMouseDownBinded)
        container.removeEventListener('mousemove', onMouseMove)
        container.removeEventListener('dblclick', onDoubleClickBinded)
        container.removeEventListener('mouseup', onMouseUpBinded)
        document.removeEventListener('keydown', onKeyDownBinded)

        if (drawGuide) drawGuide.remove()
    }
}

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

function CommandManager() {
    this.buffer = []

    const onKeyDownBinded = onKeyDown.bind(this)

    function onKeyDown(event) {
        if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
            this.undo()
        }
    }

    document.addEventListener('keydown', onKeyDownBinded)

    this.save = function (undo, arguments, context) {
        this.buffer.push({
            undo,
            arguments,
            context
        })
    }

    this.undo = function () {
        if (this.buffer.length === 0) return

        const { undo, arguments, context } = this.buffer.pop()

        undo.apply(context, arguments)
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

    this.modes = {
        draw: {
            editor: editorDrawBehavior,
            points: () => { },
            segments: segmentDrawBehavior,
            handlers: () => { },
            shapes: shapeDrawBehavior
        },
        edit: {
            editor: () => { },
            points: pointEditBehavior,
            segments: segmentEditBehavior,
            handlers: handlerEditBehavior,
            shapes: shapeEditBehavior
        }
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

    this.setBehaviors = function (behaviors) {
        this.shapes.forEach(shape => [
            shape.setBahaviors(behaviors)
        ])

        if (this.removeBehavior) this.removeBehavior()
        this.removeBehavior = behaviors['editor'].call(this)
    }

    this.createShape = function () {
        const shape = new Shape(this.container, this.modes[this.mode])

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

        const behaviors = this.modes[this.mode]
        this.setBehaviors(behaviors)

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
        })

        const behaviors = this.modes[this.mode]
        this.setBehaviors(behaviors)
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
            const behaviors = this.modes[value]

            this.setBehaviors(behaviors)
        }
    },
    commandManager: {
        get() {
            return this._commandManager
        }
    }
})

let testString = '[{"fill":"#0000ff50","stroke":"#f00","strokeWidth":1,"points":[{"coords":[311,227],"isBezier":false,"controls":[[311,227],[311,227]]},{"coords":[462,231],"isBezier":true,"controls":[[462,231],[462,231]]},{"coords":[462,434],"isBezier":true,"controls":[[666,410],[258,458]]},{"coords":[159,446],"isBezier":true,"controls":[[154,691],[164,201]]},{"coords":[188,225],"isBezier":true,"controls":[[188,225],[188,225]]}]}]'

function t_shapes__init() {
    const svgElement = document.querySelector('.js-svg')

    const svgElementRect = svgElement.getBoundingClientRect()

    const width = 800
    const height = 800

    const editor = new Editor({
        width,
        height,
        container: svgElement,
    })

    const drawModeButton = document.querySelector('.js-drawNewShape')

    drawModeButton.addEventListener('click', () => {
        editor.mode = 'draw'
    })

    const editModeButton = document.querySelector('.js-editMode')

    editModeButton.addEventListener('click', () => {
        editor.mode = 'edit'
    })

    const saveButton = document.querySelector('.js-saveJSON')
    saveButton.addEventListener('click', () => {
        testString = editor.saveToJSON()
    })

    const loadButton = document.querySelector('.js-loadJSON')
    loadButton.addEventListener('click', () => {
        editor.loadFromJSON(testString)
    })
}

window.addEventListener('DOMContentLoaded', t_shapes__init)