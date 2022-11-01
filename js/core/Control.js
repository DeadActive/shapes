import Selectable from "./Selectable.js"
import { defined } from "../utils/index.js"

export default class Control extends Selectable {
    constructor(pathElement, svgElement, collection, options) {
        super(svgElement, options?.isSelectable, options?.isSelected, options?.selectionType)

        this.pathElement = pathElement
        this.svgElement = svgElement
        this.collection = collection
        this.isVisible = defined(options?.isVisible) ? options.isVisible : true
    }

    move(dx, dy) {
        this.pathElement.move(dx, dy)
    }

    moveTo(x, y) {
        this.pathElement.moveTo(x, y)
    }

    setVisible(value) {
        this.isVisible = value
        this.svgElement.setClass('show', value)
    }

    show() {
        this.setVisible(true)
    }

    hide() {
        this.setVisible(false)
    }

    remove() {
        this.svgElement.remove()
        this.pathElement.remove()
        this.collection.removeControl(this)
    }
}