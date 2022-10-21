import { SvgElement } from "./SvgElement.js"

export class SvgPathElement {
    constructor(coords) {
        this.coords = coords
    }

    move(dx, dy) {
        this.coords[0] += dx
        this.coords[1] += dy
    }

    moveTo(x, y) {
        this.coords[0] = x
        this.coords[1] = y
    }
}

export class SvgPathPointControl extends SvgPathElement {
    constructor(coords) {
        super(coords)
    }
}

export class SvgPathPoint extends SvgPathElement {
    constructor(coords, controls) {
        super(coords)
        this.controls = controls
    }

    moveControls(x, y) {
        this.controls.forEach(c => c.moveTo(x, y))
    }
}

export class SvgPath extends SvgElement {
    constructor(config) {
        super(
            {
                name: 'path',
                tag: 'path',
                attrs: {
                    fill: '#0000ff',
                    stroke: '#000000',
                    'fill-opacity': 0.4,
                    'stroke-width': 1,
                    'stroke-opacity': 1
                },
                ...config
            }
        )

        this.points = config?.points || []
        this.isClosed = false
    }

    addPoint(point) {
        this.points.push(point)
    }

    removePoint(point) {
        const pointIndex = this.points.findIndex(p => p === point)
        if (pointIndex < 0) return

        this.points.splice(pointIndex, 1)
    }

    move(dx, dy) {
        this.points.forEach(p => {
            p.move(dx, dy)
            p.controls.forEach(c => c.move(dx, dy))
        })
    }

    getBBox() {
        return this.el.getBBox()
    }

    getNextPoint(point) {
        const pointIndex = this.points.findIndex(p => p === point)
        if (pointIndex < 0) return

        if (this.isClosed && pointIndex === this.points.length - 1) return this.points[0]
        return this.points[pointIndex + 1]
    }

    getPrevPoint(point) {
        const pointIndex = this.points.findIndex(p => p === point)
        if (pointIndex < 0) return

        if (this.isClosed && pointIndex === 0) return this.points[this.points.length - 1]
        return this.points[pointIndex - 1]
    }

    repaint() {
        let d = ''

        if (this.points.length < 2) {
            this.attrs.d = ''
            return super.repaint()
        }

        d = this.points.map((point, index) => {
            if (index === 0) return `M ${point.coords[0]} ${point.coords[1]} C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]}`
            if (index === this.points.length - 1)
                return `${point.controls[0].coords[0]} ${point.controls[0].coords[1]} ${point.coords[0]} ${point.coords[1]}`
            return `${point.controls[0].coords[0]} ${point.controls[0].coords[1]} ${point.coords[0]} ${point.coords[1]} C ${point.controls[1].coords[0]} ${point.controls[1].coords[1]}`
        }).join(' ')

        if (this.isClosed) {
            const firstPoint = this.points[0]
            const lastPoint = this.points[this.points.length - 1]

            d += `C ${lastPoint.controls[1].coords[0]} ${lastPoint.controls[1].coords[1]} ${firstPoint.controls[0].coords[0]} ${firstPoint.controls[0].coords[1]} ${firstPoint.coords[0]} ${firstPoint.coords[1]}`
        }

        this.attrs.d = d
        super.repaint()
    }
}