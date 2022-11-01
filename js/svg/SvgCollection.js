import SvgElement from "./SvgElement.js"

export default class SvgCollection extends SvgElement {
    constructor(options, svgConfig) {
        super(svgConfig)

        this.children = options?.children || []
    }

    update() {
        this.children.forEach(c => c.update())
        super.update()
    }

    addChild(child) {
        child.collection = this

        this.children.push(child)
        this.el.append(child.el)
        this.children.zIndex = this.getTopChild().zIndex + 1
    }

    removeChild(child) {
        const index = this.children.findIndex(c => c === child)
        if (child !== -1) this.children.splice(index, 1)
    }

    getChildById(id) {
        return this.children.find(c => c.id === id)
    }

    getTopChild() {
        const sortedChildren = this.children.sort((a, b) => b.zIndex - a.zIndex)
        return sortedChildren[0]
    }

    getBottomChild() {
        const sortedChildren = this.children.sort((a, b) => b.zIndex - a.zIndex)
        return sortedChildren[sortedChildren.length - 1]
    }

    bringChildToFront(child) {
        const topChild = this.getTopChild()
        child.setZIndex(topChild.zIndex + 1)
    }

    sendChildToBack(child) {
        const bottomChild = this.getBottomChild()
        child.setZIndex(bottomChild.zIndex - 1)
    }

    swapChildren(leftChild, rightChild) {
        if (leftChild === void 0) return
        const lastZIndex = leftChild.zIndex
        leftChild.zIndex = rightChild.zIndex
        rightChild.setZIndex(lastZIndex)
    }

    moveChildBack(child) {
        const sortedChildren = this.children.sort((a, b) => a.zIndex - b.zIndex)
        const childIndex = sortedChildren.findIndex(c => c === child)
        if (childIndex === 0) return

        sortedChildren.forEach((c, i) => {
            c.zIndex = i
        })

        const bottomChild = sortedChildren[childIndex - 1]

        this.swapChildren(bottomChild, child)
    }

    moveChildFront(child) {
        const sortedChildren = this.children.sort((a, b) => a.zIndex - b.zIndex)
        const childIndex = sortedChildren.findIndex(c => c === child)
        if (childIndex === sortedChildren.length - 1) return

        sortedChildren.forEach((c, i) => {
            c.zIndex = i
        })

        const topChild = sortedChildren[childIndex + 1]

        this.swapChildren(topChild, child)
    }

    reorder() {
        this.children.forEach(c => c.el.remove())
        const sortedChildren = this.children.sort((a, b) => a.zIndex - b.zIndex)
        sortedChildren.forEach(c => this.el.append(c.el))

        console.log(this)
    }
}