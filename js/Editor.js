import LayerControl from "./controls/LayerControl.js"
import SegmentControl from "./controls/SegmentControl.js"
import ControlCollection from "./core/ControlCollection.js"
import PathControl from "./svg/path/PathControl.js"
import PathPoint from "./svg/path/PathPoint.js"
import PathSegment from "./svg/path/PathSegment.js"
import Svg from "./svg/Svg.js"
import SvgGroup from "./svg/SvgGroup.js"
import SvgSegment from "./svg/SvgSegment.js"
import { arrayFlatten, emitter } from "./utils/index.js"

export default class Editor {
    constructor(container, stateMachine) {
        this.container = container
        this.stateMachine = stateMachine

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
        this.setupCollections()
        this.handleEvents()
    }

    createLayer() {
        const layer = new LayerControl(this.collections, {
            path: {
                attrs: {
                    fill: this.defaultColors.fill.color,
                    'fill-opacity': this.defaultColors.fill.opacity,
                    stroke: this.defaultColors.stroke.color,
                    'stroke-opacity': this.defaultColors.stroke.opacity,
                    'stroke-width': this.defaultStrokeWidth
                }
            }
        })
        this.layersContainer.addChild(layer.path)
        return layer
    }

    addLayer(layerControl) {
        this.layersContainer.addChild(layerControl.path)
        layerControl.path.update()
        console.log(layerControl.path)
        return layerControl
    }

    addLayers(layers) {
        layers.forEach(l => {
            this.addLayer(l)
        })
    }

    setRootElementMode(state) {
        this.rootContainer.el.dataset.mode = state.name
    }

    handleEvents() {
        emitter.on('stateChange', this.setRootElementMode.bind(this))
        this.setRootElementMode(this.stateMachine.currentState)
    }

    // setupGradient(){
    //     const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    //     const handlerGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')

    //     handlerGradient.id = 'handlerGradient'
    //     handlerGradient.setAttribute('gradientTransform', 'gradientTransform="translate(-0.5 -0.5) scale(2, 2)"')
    //     handlerGradient.innerHTML = `
    //     <stop offset="0%" stop-color="#ffffff"></stop>
    //     `
    // }

    setupDrawContainer() {
        this.drawContainer = new SvgGroup({}, { name: 'draw', id: 'draw' })
        this.rootContainer.addChild(this.drawContainer)

        const startLeftControl = new PathControl([0, 0], null, null)
        const startRightControl = new PathControl([0, 0], null, startLeftControl)
        startLeftControl.bindSibling(startRightControl)
        const startPoint = new PathPoint([0, 0], [startLeftControl, startRightControl], null, false)

        const endLeftControl = new PathControl([0, 0], null, null)
        const endRightControl = new PathControl([0, 0], null, endLeftControl)
        endLeftControl.bindSibling(endRightControl)
        const endPoint = new PathPoint([0, 0], [endLeftControl, endRightControl], null, false)

        const pathSegment = new PathSegment([startPoint, endPoint], null)
        const segment = new SvgSegment(pathSegment)

        this.drawContainer.addChild(segment)

        this.drawGuide = {
            segment,
            startPoint,
            endPoint
        }
    }

    setupContainers() {
        this.rootContainer = new Svg(this.container)
        this.controlsContainer = new SvgGroup({}, { name: 'controls', id: 'controls' })

        this.layersControlsContainer = new SvgGroup({}, { name: 'layers', id: 'layersControls' })
        this.pointsContainer = new SvgGroup({}, { name: 'points', id: 'points' })
        this.handlersContainer = new SvgGroup({}, { name: 'handlers', id: 'handlers' })
        this.segmentsContainer = new SvgGroup({}, { name: 'segments', id: 'segments' })

        this.layersContainer = new SvgGroup({}, { name: 'layers', id: 'layers' })

        this.controlsContainer.addChild(this.segmentsContainer)
        this.controlsContainer.addChild(this.pointsContainer)
        this.controlsContainer.addChild(this.handlersContainer)
        this.controlsContainer.addChild(this.layersControlsContainer)

        this.rootContainer.addChild(this.layersContainer)
        this.rootContainer.addChild(this.controlsContainer)
        this.setupDrawContainer()
    }

    setupCollections() {
        this.layersControlsCollection = new ControlCollection(this, this.layersControlsContainer)
        this.pointsCollection = new ControlCollection(this, this.pointsContainer)
        this.handlersCollection = new ControlCollection(this, this.handlersContainer)
        this.segmentsCollection = new ControlCollection(this, this.segmentsContainer)

        this.collections = {
            layersCollection: this.layersControlsCollection,
            handlersCollection: this.handlersCollection,
            pointsCollection: this.pointsCollection,
            segmentsCollection: this.segmentsCollection
        }
    }

    getControlsInBox(box, collections) {
        return arrayFlatten(collections.map(collection => collection.getControlsInsindeBox(box)))
    }

    getControlById(id, collections) {
        let result = null

        for (let i = 0; i < collections.length; i++) {
            const collection = collections[i];
            result = collection.getControlById(id)
            if (result) return result
        }
    }

    getLayerControlById(id) {
        const path = this.layersContainer.getChildById(id)
        return this.layersControlsCollection.controls.find(l => l.path === path)
    }
}
