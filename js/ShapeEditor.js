import ActionManager from "./actions/ActionManager.js"
import Editor from "./Editor.js"
import Select from "./Select.js"
import Toolbar from "./Toolbar.js"
import { emitter } from "./utils/index.js"

export default class ShapeEditor {
    constructor(container) {
        this.container = container
        this.editor = new Editor(container)
        this.select = new Select(this.editor)
        this.actionManager = new ActionManager(this.editor, this.select)
        this.toolbar = new Toolbar(this)
    }
}