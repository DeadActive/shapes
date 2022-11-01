import PathElement from "./PathElement.js";

export default class PathPoint extends PathElement {
    constructor(coords, controls, path, isBezier = false) {
        super(coords, path)
        this.controls = controls
        this.isBezier = isBezier
    }

    move(dx, dy, moveControls = true, update) {
        super.move(dx, dy, update)
        if (moveControls) this.moveControls(dx, dy)
    }

    moveControls(dx, dy) {
        this.controls.forEach(c => c.move(dx, dy))
    }
}