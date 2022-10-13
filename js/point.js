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

    this.clear = function () {
        this.pointElement.remove()
    }

    this.repaint = function () {
        this.pointElement.setAttribute('cx', this.coords[0])
        this.pointElement.setAttribute('cy', this.coords[1])
        this.pointElement.dataset['index'] = this.shape.points.findIndex((p) => p === this)
    }

    this.draw = function () {
        const { coords, container, pointElement } = this

        pointElement.setAttribute('cx', coords[0])
        pointElement.setAttribute('cy', coords[1])
        pointElement.setAttribute('r', 5)

        pointElement.dataset['controlType'] = `point`
        pointElement.dataset['controlPath'] = `shapes.${this.shape.index}.points`
        this.pointElement.dataset['index'] = this.shape.points.length - 1

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