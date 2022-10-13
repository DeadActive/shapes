function CommandManager() {
    this.buffer = []

    const onKeyDownBinded = onKeyDown.bind(this)

    function onKeyDown(event) {
        if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
            this.undo()
        }
    }

    document.addEventListener('keydown', onKeyDownBinded)

    this.save = function (undo, arguments, context) {
        this.buffer.push({
            undo,
            arguments,
            context
        })
    }

    this.undo = function () {
        if (this.buffer.length === 0) return

        const { undo, arguments, context } = this.buffer.pop()

        undo.apply(context, arguments)
    }
}