import PathElement from "./PathElement.js";
import Vector2 from "../../utils/vector2.js";

export default class PathControl extends PathElement {
    constructor(coords, path, sibling) {
        super(coords, path)
        this.sibling = sibling
        this.mode = 'mirrorAngle'
    }

    move(dx, dy, useMode = false) {
        if (useMode) {
            if (this.mode === 'mirrorAngle') {
                this.moveMirrorAngle(dx, dy)
            }
            else if (this.mode === 'mirrorAll') {
                this.moveMirrorAll(dx, dy)
            }
            else {
                super.move(dx, dy)
            }
            return
        }

        super.move(dx, dy)
    }

    moveMirrorAll(dx, dy) {
        super.move(dx, dy)

        const cx = this.coords[0]
        const cy = this.coords[1]

        const px = this.point.coords[0]
        const py = this.point.coords[1]

        const x = -cx + 2 * px
        const y = -cy + 2 * py

        this.sibling.moveTo(x, y)
    }

    moveMirrorAngle(dx, dy) {
        super.move(dx, dy)

        const cx = this.coords[0]
        const cy = this.coords[1]

        const px = this.point.coords[0]
        const py = this.point.coords[1]

        const sx = this.sibling.coords[0]
        const sy = this.sibling.coords[1]

        const mx = -cx + 2 * px
        const my = -cy + 2 * py

        const pointToSiblingVector = Vector2.fromPoints([px, py], [sx, sy])



        if (pointToSiblingVector.magnitude() <= 0) return

        const pointToMirrorVector = Vector2.fromPoints([mx, my], [px, py])
        const addVector = pointToSiblingVector.normalize().addVector(pointToMirrorVector.normalize())

        const deltaVector = addVector.scalarProduct(pointToSiblingVector.magnitude())

        if (isNaN(deltaVector.x) || isNaN(deltaVector.y)) return

        const x = sx - deltaVector.x
        const y = sy - deltaVector.y

        this.sibling.moveTo(x, y)
    }

    bindPoint(point) {
        this.point = point
    }

    bindSibling(sibling) {
        this.sibling = sibling
    }
}