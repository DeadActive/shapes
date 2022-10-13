function Shape(container, index) {
    this.points = []
    this.segments = []
    this.handlers = []
    this.isClosed = false
    this.isDrawHandlers = true
    this.index = index

    this.container = container

    this.shapeElement = createSVGElement('path')
    this.segmentsContainer = createSVGElement('g')
    this.controlsContainer = createSVGElement('g')

    this.shapeElement.dataset['controlType'] = 'shape'
    this.shapeElement.dataset['controlPath'] = 'shapes'
    this.shapeElement.dataset['index'] = index

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

        if (this.isDrawHandlers) {
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

    this.clear = function () {
        this.points.forEach(function (point) { point.clear() })
        this.handlers.forEach(function (handler) { handler.clear() })
        this.segments.forEach(function (segment) { segment.clear() })
        this.shapeElement.remove()
        this.controlsContainer.remove()
        this.segmentsContainer.remove()
    }
}