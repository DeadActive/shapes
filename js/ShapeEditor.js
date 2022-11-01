import Editor from "./Editor.js";
import Select from "./Select.js";
import StateMachine from './core/StateMachine.js'
import states from './states/index.js'
import Toolbar from "./Toolbar.js";
import ActionsManager from "./core/ActionsManager.js";
import CommandsManager from "./core/CommandsManager.js";

export default class ShapeEditor {
    constructor(container) {
        this.stateMachine = new StateMachine(states, 'select')
        this.editor = new Editor(container, this.stateMachine)
        this.select = new Select(this.editor, this.stateMachine)
        this.toolbar = new Toolbar(this)
        this.actionsManager = new ActionsManager(this)
        this.commandsManager = new CommandsManager(this)
    }
}