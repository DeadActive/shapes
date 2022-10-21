import { SvgRect } from "../svg/SvgRect.js"
import Control from "./Control.js"

export default class PathControl extends Control {
    constructor(path, options) {
        const bbox = path.getBBox()

        const svgEl = new SvgRect({
            x: bbox.x,
            y: bbox.y,
            width: bbox.width,
            height: bbox.height,
            name: 'pathControl',
            id: options?.id,
        })

        super({ svgEl, ...options })

        this.path = path
    }

    move(dx, dy) {
        this.path.move(dx, dy)
        super.move(dx, dy)
    }

    update() {
        const bbox = this.path.getBBox()

        this.svgEl.x = bbox.x
        this.svgEl.y = bbox.y
        this.svgEl.width = bbox.width
        this.svgEl.height = bbox.height
        this.svgEl.repaint()
    }

}