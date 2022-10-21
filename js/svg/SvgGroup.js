import { SvgElement } from "./SvgElement.js"

export class SvgGroup extends SvgElement {
    constructor(config) {
        super({
            name: 'group',
            tag: 'g',
            ...config
        })

        this.children = config?.children || new Set()
    }

    addChild(child) {
        this.children.add(child)
        this.el.append(child.el)
    }

    removeChild(child) {
        this.children.delete(child)
        child.el.remove()
    }

    clear() {
        this.children.forEach(c => c.el.remove())
        this.children.clear()
    }

    getChildById(id) {
        return [...this.children].find(c => c.id === id)
    }

    repaint() {
        this.children.forEach(c => c.repaint())

        super.repaint()
    }

    reorder() {
        this.children.forEach(c => c.el.remove())

        const zSortedChildren = [...this.children].sort((a, b) => a.zIndex - b.zIndex)

        console.log(zSortedChildren)

        zSortedChildren.forEach(c => this.el.append(c.el))
    }
}