import { emitter } from "../utils/index.js"

export default class StateMachine {
    constructor(states, initialState) {
        this.states = states
        this.currentState = null
        this.setState(initialState)
    }

    setState(stateName, context) {
        if (this.currentState) this.currentState.beforeEnd.call(context)
        const state = this.states[stateName]
        if (state.fireEvent) {
            this.emitStateChange(state, { ...this.currentState })
        }
        this.currentState = state
        this.currentState.beforeStart.call(context)
    }

    next(context) {
        if (!this.currentState) return
        if (!this.currentState.nextState) return
        const state = this.currentState.nextState
        if (state.fireEvent) {
            this.emitStateChange(state, { ...this.currentState })
        }
        this.currentState.beforeEnd.call(context)
        this.currentState = state
        this.currentState.beforeStart.call(context)
    }

    emitStateChange(newState, oldState) {
        emitter.emit('stateChange', newState, oldState)
    }
}