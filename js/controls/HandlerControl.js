import Control from "./Control.js"
import { SvgCircle } from "../svg/SvgCircle.js"

export default class HandlerControl extends Control {
    constructor(pathControl, lineElement, options) {
        const svgEl = new SvgCircle({
            x: pathControl.coords[0],
            y: pathControl.coords[1],
            name: 'handlerControl',
            id: options?.id,
            attrs: {
                r: 3,
                fill: '#ffffff',
                stroke: '#0000ff'
            }
        })

        super({ svgEl, selectable: false, ...options })

        this.lineElement = lineElement
        this.pathControl = pathControl
        this.mode = 'mirrorAngle'
        this.setVisible(false)
    }

    move(dx, dy) {
        this.pathControl.move(dx, dy)
        super.move(dx, dy)
    }

    moveTo(x, y) {
        this.pathControl.moveTo(x, y)
        super.moveTo(x, y)
    }

    bindSibling(sibling) {
        this.sibling = sibling
    }

    bindPointControl(pointControl) {
        this.pointControl = pointControl
    }

    setVisible(value) {
        this.isVisible = value
        this.svgEl.style.display = this.isVisible ? 'block' : 'none'
        this.lineElement.style.display = this.isVisible ? 'block' : 'none'
        this.svgEl.repaint()
        this.lineElement.repaint()
    }
}