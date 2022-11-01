import SvgElement from "./SvgElement.js";

export default class SvgRectangle extends SvgElement {
    constructor(x, y, ex, ey, svgConfig) {
        super({
            name: 'rectangle',
            tag: 'polygon',
            attrs: {
                fill: 'transparent',
                stroke: '#0000ff',
                'stroke-width': 1,
            },
            ...svgConfig
        })

        this.x = x || 0
        this.y = y || 0
        this.ex = ex || 0
        this.ey = ey || 0
    }

    setX(x) {
        this.x = x
        this.update()
    }

    setY(y) {
        this.y = y
        this.update()
    }

    setEx(ex) {
        this.ex = ex
        this.update()
    }

    setEy(ey) {
        this.ey = ey
        this.update()
    }

    setXY(x, y) {
        this.x = x
        this.y = y
        this.update()
    }

    setExEy(ex, ey) {
        this.ex = ex
        this.ey = ey
        this.update()
    }

    move(dx, dy) {
        this.x += dx
        this.y += dy
        this.ex += dx
        this.ey += dy
        this.update()
    }

    moveXY(dx, dy) {
        this.x += dx
        this.y += dy
        this.update()
    }

    moveExEy(dx, dy) {
        this.ex += dx
        this.ey += dy
        this.update()
    }

    moveTo(x, y) {
        this.ex += x - this.x
        this.ey += y - this.y
        this.x = x
        this.y = y
        this.update()
    }

    getBox() {
        const { x, y, ex, ey } = this
        return { x, y, ex, ey }
    }

    update() {
        const { x, y, ex, ey } = this

        this.setAttr('points', `${x},${y} ${ex},${y} ${ex},${ey} ${x},${ey}`)
    }
}