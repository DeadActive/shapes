import { emitter } from "../utils/index.js"

export default class CommandsManager {
    constructor(shapeEditor) {
        this.editor = shapeEditor.editor
        this.select = shapeEditor.select

        this.undoBuffer = []
        this.redoBuffer = []

        this.initEvents()
    }

    save(type, context, command, args) {
        this.undoBuffer.push({
            context, command, type, args
        })
    }

    saveBatch(context, command, args) {
        this.undoBuffer.push({
            type: 'batch',
            context,
            command,
            args
        })
    }

    undo() {
        if (this.undoBuffer.length < 1) return
        const { type, context, command, args } = this.undoBuffer.pop()

        if (type === 'batch') {
            context.forEach(c => {
                command.apply(c, args)
            })
        } else {
            command.apply(context, args)
        }
    }

    initEvents() {
        function onKeyDown(event) {
            if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey) && !event.shiftKey) {
                this.undo()
            }

            if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
                this.redo()
            }
        }

        const keyDown = onKeyDown.bind(this)

        document.addEventListener('keydown', keyDown)

        emitter.on('saveCommand', (...args) => this.save(...args))
        emitter.on('saveCommands', (...args) => this.saveBatch(...args))
    }
}