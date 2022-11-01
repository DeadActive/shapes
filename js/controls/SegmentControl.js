import Control from "../core/Control.js";
import SvgSegment from "../svg/SvgSegment.js";

export default class SegmentControl extends Control {
    constructor(pathSegment, pointControls, collection, layer, options) {
        const svgElement = new SvgSegment(pathSegment, {
            name: 'segmentControl',
            attrs: {
                fill: 'transparent',
                stroke: '#0597ff',
                'stroke-width': 5
            },
            ...options?.element
        })

        super(pathSegment, svgElement, collection, options?.control)

        this.pointControls = pointControls
        this.layer = layer

        this.pathElement.bindElement(this)
        // console.log(this.pathElement)
    }

    bend(dx, dy) {
        const leftPoint = this.pathElement.pathPoints[0]
        const rightPoint = this.pathElement.pathPoints[1]

        leftPoint.isBezier = true
        rightPoint.isBezier = true

        leftPoint.controls[1].move(dx, dy, leftPoint.controls[1].mode === 'mirrorAll')
        rightPoint.controls[0].move(dx, dy, rightPoint.controls[0].mode === 'mirrorAll')

        if (leftPoint.controls[1].mode !== 'mirrorAll') {
            leftPoint.controls[0].mode = 'default'
            leftPoint.controls[1].mode = 'default'
        }
        if (rightPoint.controls[0].mode !== 'mirrorAll') {
            rightPoint.controls[0].mode = 'default'
            rightPoint.controls[1].mode = 'default'
        }
    }

    update() {
        this.svgElement.update()
    }
}