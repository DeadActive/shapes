export default class Action {
    constructor(actionManager) {
        this.actionManager = actionManager
    }

    initEvents(callbacks) {
        this.callbacks = callbacks

        Object.entries(callbacks).forEach(([event, cb]) => {
            this.actionManager.emitter.on(event, cb)
        })
    }
}