export default class PathElement {
    constructor(coords, path) {
        this.coords = coords
        this.path = path
        this.bindedElements = []
    }

    bindElement(element) {
        this.bindedElements.push(element)
    }

    unbindElement(element) {
        const index = this.bindedElements.findIndex(element)
        if (index !== -1) this.bindedElements.splice(index, 1)
    }

    remove() {
        this.path.pointCollection.removePoint(this)
    }

    updateBinded() {
        this.bindedElements.forEach(el => el.update())
    }

    move(dx, dy, update = true) {
        this.coords[0] += dx
        this.coords[1] += dy
        if (!update) return
        if (this.path) this.path.update()
        this.updateBinded()
    }

    moveTo(x, y, update = true) {
        this.coords[0] = x
        this.coords[1] = y
        if (!update) return
        if (this.path) this.path.update()
        this.updateBinded()
    }
}