import Control from './Control.js'
import { SvgCircle } from '../svg/SvgCircle.js'

export default class PointControl extends Control {
    constructor(pathPoint, handlers, options) {
        const svgEl = new SvgCircle({
            x: pathPoint.coords[0],
            y: pathPoint.coords[1],
            name: 'pointControl',
            id: options?.id
        })

        super({
            svgEl,
            ...options
        })

        this.handlers = handlers
        this.pathPoint = pathPoint
        this._isBezier = false
        // this.isBezier = options?.isBezier === void 0 ? false : options?.isBezier
        this.isBezier = true
    }

    move(dx, dy) {
        this.pathPoint.move(dx, dy)
        super.move(dx, dy)
        this.handlers.forEach(h => h.move(dx, dy))
    }

    moveTo(x, y) {
        this.pathPoint.moveTo(x, y)
        super.moveTo(x, y)
    }

    get isBezier() {
        return this._isBezier
    }

    set isBezier(value) {
        this._isBezier = value

        this.handlers.forEach(h => {
            h.isVisible = value
        })
    }

    setSelected(value) {
        super.setSelected(value)
        this.handlers.forEach(h => {
            if (this.isBezier) h.setVisible(value)
        })
    }

    update() {
        this.svgEl.moveTo(...this.pathPoint.coords)

        this.handlers.forEach(h => h.moveTo(...h.pathControl.coords))
    }

    setVisible(value) {
        this.isVisible = value
        this.svgEl.style.display = value ? 'block' : 'none'
    }
}