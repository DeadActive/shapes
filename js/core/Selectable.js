import { defaultValue, isIntersectBoxes, isPointInBox, normalizeBox } from "../utils/index.js"

export default class Selectable {
    constructor(svgElement, selectable, selected, selectionType) {
        this.svgElement = svgElement

        this.isSelectable = defaultValue(selectable, true)
        this.isSelected = defaultValue(selected, false)
        this.selectionType = defaultValue(selectionType, 'point')
    }

    setSelected(value) {
        if (!this.isSelectable) return
        this.isSelected = value
        this.svgElement.setClass('selected', value)
    }

    select() {
        this.setSelected(true)
    }

    deselect() {
        this.setSelected(false)
    }

    isInBox(box) {
        if (this.selectionType === 'point') {
            return isPointInBox(this.pathElement.coords[0], this.pathElement.coords[1], box)
        }
        if (this.selectionType === 'box') {
            return isIntersectBoxes(this.svgElement.getBox(), normalizeBox(box))
        }
    }
}