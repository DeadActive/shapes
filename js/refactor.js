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

        const isLastPoint = +this.pointElement.dataset['index'] === this.shape.points.length - 1

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

        if (target.dataset['controlType'] === 'point' && target.dataset['index'] === '0') {
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