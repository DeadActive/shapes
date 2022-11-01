import Control from "../core/Control.js";
import SvgRectangle from "../svg/SvgRectangle.js";
import HandlerControl from './HandlerControl.js'
import PointControl from './PointControl.js'
import SvgPath from '../svg/path/SvgPath.js'
import { emitter } from "../utils/index.js";
import SegmentControl from "./SegmentControl.js";

export default class LayerControl extends Control {
    constructor(collections, options) {
        const path = new SvgPath(null, null, options?.path)

        const pathBox = path.getBBox()
        const svgElement = new SvgRectangle(
            pathBox.x,
            pathBox.y,
            pathBox.x + pathBox.width,
            pathBox.y + pathBox.height,
            {
                name: 'layerControl',
                ...options?.element
            }
        )

        super(path, svgElement, collections?.layersCollection, {
            selectionType: 'box',
            ...options?.control
        })

        this.path = this.pathElement
        this.pointsCollection = collections?.pointsCollection
        this.handlersCollection = collections?.handlersCollection
        this.layersCollection = collections?.layersCollection
        this.segmentsCollection = collections?.segmentsCollection

        this.segments = []
        this.points = []
        this.handlers = []

        this.layersCollection.addControl(this)
        emitter.on('update', (path) => this.update.call(this, path))
        emitter.on('segmentsUpdate', (collection) => this.updateSegments.call(this, collection))
    }

    update(path) {
        if (path !== this.path) return
        if (path.points.length < 1) this.remove()

        const box = this.path.getBBox()
        this.svgElement.x = box.x
        this.svgElement.y = box.y
        this.svgElement.ex = box.x + box.width
        this.svgElement.ey = box.y + box.height
        this.svgElement.update()
    }

    updateSegments(colleciton) {
        if (colleciton !== this.path.segmentCollection) return
        if (this.path.points.length < 1) this.remove()
        this.segments.forEach(s => s.remove())
        this.segments = []

        this.path.segmentCollection.segments.forEach(s => {
            const segment = new SegmentControl(s, null, this.segmentsCollection, this)
            this.segments.push(segment)
            this.segmentsCollection.addControl(segment)
        })
    }

    createPoint(coords, controls = null) {
        const point = this.path.pointCollection.createPoint(coords, controls)

        return this.addPoint(point)
    }

    addPoint(point) {
        const leftHandler = new HandlerControl(point.controls[0], null, null, this.handlersCollection)
        const rightHandler = new HandlerControl(point.controls[1], null, leftHandler, this.handlersCollection)
        leftHandler.bindSibling(rightHandler)

        const pointControl = new PointControl(point, [leftHandler, rightHandler], this.pointsCollection, this)

        this.pointsCollection.addControl(pointControl)
        this.handlersCollection.addControl(leftHandler, rightHandler)

        this.points.push(pointControl)
        this.handlers.push(leftHandler, rightHandler)

        return pointControl
    }

    split(prevPoint, t) {
        const point = this.path.split(prevPoint, t)
        return this.addPoint(point)
    }

    remove() {
        super.remove()

        this.points.forEach(p => p.remove())
        this.handlers.forEach(h => h.remove())
        this.segments.forEach(s => s.remove())
    }
}