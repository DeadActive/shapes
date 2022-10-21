export default class Control {
    constructor(options) {
        this.svgEl = options.svgEl

        this.selectable = options.selectable !== void 0 ? options.selectable : true
        this.isSelected = options?.isSelected || false
        this.isVisible = options?.isVisible !== void 0 ? options?.isVisible : false
    }

    move(dx, dy) {
        this.svgEl.move(dx, dy)
        this.svgEl.repaint()
    }

    moveTo(x, y) {
        this.svgEl.moveTo(x, y)
        this.svgEl.repaint()
    }

    get id() {
        return this.svgEl.id
    }

    set id(value) {
        this.svgEl.id = value
    }

    get selected() {
        return this.isSelected
    }

    setSelected(value) {
        this.isSelected = value

        this.svgEl.class.selected = value
        this.svgEl.repaint()
    }
}