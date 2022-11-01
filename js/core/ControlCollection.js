import { defaultValue } from "../utils/index.js"

export default class ControlCollection {
    constructor(editor, container, controls, options) {
        this.editor = editor
        this.container = container
        this.controls = controls || []
    }

    addControl(...controls) {
        controls.forEach(c => {
            this.controls.push(c)
            this.container.addChild(c.svgElement)
        })
    }

    removeControl(control) {
        const index = this.findControl(control)
        if (index === -1) return
        this.controls.splice(index, 1)
        control.svgElement.remove()
    }

    clear() {
        this.controls.forEach(c => c.remove())
        this.controls = []
    }

    findControl(control) {
        return this.controls.findIndex(c => c === control)
    }

    getControlById(id) {
        return this.controls.find(c => c.svgElement.id === id)
    }

    getControlsInsindeBox(box) {
        return this.controls.filter(control => control.isInBox(box))
    }
}