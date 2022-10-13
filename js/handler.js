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

    this.clear = function () {
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

        // handlerElement.dataset['index'] = pointIndex
        // handlerElement.dataset['controlIndex'] = controlIndex
        handlerElement.dataset['controlType'] = 'control'
        handlerElement.dataset['controlPath'] = `shapes.${this.shape.index}.handlers`

        container.append(controlElem)
    }
}