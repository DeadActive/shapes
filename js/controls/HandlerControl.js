import Control from "../core/Control.js";
import SvgCircle from "../svg/SvgCircle.js";
import SvgGroup from "../svg/SvgGroup.js";
import SvgLine from "../svg/SvgLine.js";
import { defaultValue } from "../utils/index.js";
import Vector2 from "../utils/vector2.js"


export default class HandlerControl extends Control {
    constructor(pathControl, pointControl, sibling, collection, options) {
        const circleElement = new SvgCircle(
            pathControl.coords[0],
            pathControl.coords[1],
            {
                name: 'handlerControl',
                attrs: {
                    r: 3,
                    fill: '#ffffff',
                    stroke: '#0000ff'
                },
                ...options?.element
            }
        )

        const group = new SvgGroup({}, { name: 'handlerControlWrapper', id: circleElement.id })
        group.addChild(circleElement)

        super(pathControl, group, collection, options?.control)

        this.pointControl = pointControl
        this.sibling = sibling
        this.mode = defaultValue(options?.control?.mode, 'mirrorAngle')
        this.group = group
        this.circleElement = circleElement

        this.pathElement.bindElement(this)

        if (pointControl) this.createLine()
    }

    bindPointControl(pointControl) {
        this.pointControl = pointControl
        if (pointControl) this.createLine()
    }

    bindSibling(sibling) {
        this.sibling = sibling
    }

    move(dx, dy, useMode) {
        this.pathElement.move(dx, dy, useMode)
    }

    update() {
        this.circleElement.moveTo(this.pathElement.coords[0], this.pathElement.coords[1])
        this.lineElement.setXY(this.pathElement.coords[0], this.pathElement.coords[1])
        this.lineElement.setExEy(
            this.pointControl.pathElement.coords[0],
            this.pointControl.pathElement.coords[1]
        )
    }

    createLine() {
        this.lineElement = new SvgLine(
            this.pathElement.coords[0],
            this.pathElement.coords[1],
            this.pointControl.pathElement.coords[0],
            this.pointControl.pathElement.coords[1],
            {
                id: 'line'
            }
        )
        this.group.addChild(this.lineElement)
    }

    get mode() {
        return this.pathElement.mode
    }

    set mode(value) {
        this.pathElement.mode = value
    }
}