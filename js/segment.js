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

    this.clear = function () {
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