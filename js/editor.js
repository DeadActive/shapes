import Shape from './entities/Shape.js'
import { Svg, SvgCircle, SvgGroup } from './svg/index.js'
import { arrayFlatten, emitter } from './utils/index.js'

export default class Editor {
    constructor(container) {
        this.container = container

        this.shapes = []
        this._mode = ''
        this.defaultColors = {
            fill: {
                color: '#E2E2E2',
                opacity: 1
            },
            stroke: {
                color: '#000000',
                opacity: 1
            }
        }
        this.defaultStrokeWidth = 1

        this.setupContainers()
    }

    setupContainers() {
        this.containers = {}

        this.containers.pathContainer = new SvgGroup({ name: 'paths', id: 'paths' })

        this.containers.pointControlsContainer = new SvgGroup({ name: 'points', id: 'points' })
        this.containers.handlerControlsContainer = new SvgGroup({ name: 'handlers', id: 'handlers' })
        this.containers.pathControlsContainer = new SvgGroup({ name: 'pathControls', id: 'pathControls' })
        this.containers.segmentControlsContainer = new SvgGroup({ name: 'segments', id: 'segments' })

        this.containers.controlsContainer = new SvgGroup({ name: 'controls', id: 'controls' })
        this.containers.controlsContainer.addChild(this.containers.pathControlsContainer)
        this.containers.controlsContainer.addChild(this.containers.segmentControlsContainer)
        this.containers.controlsContainer.addChild(this.containers.pointControlsContainer)
        this.containers.controlsContainer.addChild(this.containers.handlerControlsContainer)

        this.containers.drawContainer = new SvgGroup({ name: 'draw', id: 'draw' })
        this.ghostPoint = new SvgCircle({
            x: -9999,
            y: -9999,
            name: 'ghostPoint',
            id: 'ghostPoint',
            attrs: {
                r: 5,
                fill: '#ffffff',
                stroke: '#0000ff',
                opacity: 0.5
            }
        })

        this.containers.drawContainer.addChild(this.ghostPoint)

        this.svg = new Svg(this.container)
        this.svg.addChild(this.containers.pathContainer)
        this.svg.addChild(this.containers.controlsContainer)
        this.svg.addChild(this.containers.drawContainer)

        this.mode = 'select'
    }

    unselectAll() {
        this.shapes.forEach(s => s.unselectAll())
    }

    addShape() {
        const shape = new Shape(this.containers, {
            attrs: {
                fill: this.defaultColors.fill.color,
                'fill-opacity': this.defaultColors.fill.opacity,
                stroke: this.defaultColors.stroke.color,
                'stroke-opacity': this.defaultColors.stroke.opacity,
                'stroke-width': this.defaultStrokeWidth
            }
        }, this.shapes.length)

        this.shapes.push(shape)

        return shape
    }

    sendShapeToFront(shape) {
        shape.zIndex = 0
        this.containers.pathContainer.reorder()
    }

    sendShapeToBack(shape) {
        shape.zIndex = this.shapes.length - 1
        this.containers.pathContainer.reorder()
    }

    getControlById(id) {
        let result = null

        for (let index = 0; index < this.shapes.length; index++) {
            const shape = this.shapes[index];

            result = shape.getControlById(id)
            if (result) return result
        }

        return result
    }

    getControlsInsideBox(box) {
        const result = this.shapes.map(s =>
            s.getControlsInsideBox(box)
        )

        return arrayFlatten(result)
    }

    getShapeByControlId(id) {
        let result = null

        for (let index = 0; index < this.shapes.length; index++) {
            const shape = this.shapes[index];

            result = shape.getControlById(id)
            if (result) return shape
        }

        return result
    }

    onModeChange() {
        if (this.mode === 'draw') {
            console.log('draw')
            this.shapes.forEach(s => {
                s.pointControls.forEach(p => p.setVisible(true))
            })
            this.repaint()
        }
    }

    repaint() {
        Object.values(this.containers).forEach(c => c.repaint())
        this.shapes.forEach(s => s.update())
    }

    setMode(value) {
        emitter.emit('modechange', value, this._mode)

        this._mode = value
        this.svg.el.dataset.mode = value

        this.onModeChange()
    }

    get mode() {
        return this._mode
    }

    set mode(value) {
        this.setMode(value)
    }
}