import { defaultValue } from "../utils/index.js"

export default class State {
    constructor(config, callbacks, nextState) {
        this.name = defaultValue(config?.name, '')
        this.fireEvent = defaultValue(config?.fireEvent, false)
        this.select = defaultValue(config?.select, {})
        this.actions = defaultValue(config?.actions, {})
        this.beforeStart = defaultValue(callbacks?.beforeStart, () => { })
        this.beforeEnd = defaultValue(callbacks?.beforeEnd, () => { })
        this.nextState = defaultValue(nextState, null)
    }

    call(context, type, name, ...args) {
        if (!this[type]) return
        if (!this[type][name]) return
        this[type][name].apply(context, args)
    }
}