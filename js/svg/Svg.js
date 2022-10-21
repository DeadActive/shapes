import { SvgElement } from './SvgElement.js'

export class Svg extends SvgElement {
    constructor(container, options) {
        const containerRect = container.getBoundingClientRect()

        super({
            tag: 'svg',
            name: 'svg',
            attrs: {
                width: containerRect.width,
                height: containerRect.height
            },
            ...options
        })

        this.container = container
        this.children = new Set()

        this.container.append(this.el)
        this.repaint()
    }

    addChild(child) {
        this.children.add(child)
        this.el.append(child.el)

        this.repaint()
    }

    removeChild(child) {
        if (child === void 0) return

        this.children.delete(child)
        this.child.el.remove()

        this.repaint()
    }

    getChildById(id) {
        return [...this.children].find(c => c.id === id)
    }

    repaint() {
        super.repaint()
        this.children.forEach(c => c.repaint())
    }


}