import PathControl from "./controls/PathControl.js"
import { emitter } from "./utils/index.js"

export default class Toolbar {
    constructor(shapeEditor) {
        this.shapeEditor = shapeEditor
        this.container = shapeEditor.editor.container
        this.editor = shapeEditor.editor
        this.select = shapeEditor.select

        this.toolbarElement = document.createElement('div')
        this.editModeButton = document.createElement('button')
        this.drawModeButton = document.createElement('button')
        this.bendModeButton = document.createElement('button')
        this.selectModeButton = document.createElement('button')

        this.fillWrapper = document.createElement('div')
        this.strokeWrapper = document.createElement('div')

        this.fillInput = document.createElement('input')
        this.strokeInput = document.createElement('input')

        this.strokeWidthWrapper = document.createElement('div')
        this.strokeWidthInput = document.createElement('input')
        this.strokeWidthInput.type = 'number'

        this.modeButtons = {
            'select': this.selectModeButton,
            'draw': this.drawModeButton,
            'edit': this.editModeButton,
            'bend': this.bendModeButton
        }

        this.init()
    }

    setActiveModeClass(mode) {
        Object.values(this.modeButtons).forEach(b => b.classList.toggle('active', false))

        this.modeButtons[mode].classList.toggle('active', true)
    }

    updateInputs(shape) {
        if (shape) {
            this.fillMinicolor.minicolors('value', { color: shape.path.attrs.fill, opacity: shape.path.attrs['fill-opacity'] })
            this.strokeMinicolor.minicolors('value', { color: shape.path.attrs.stroke, opacity: shape.path.attrs['stroke-opacity'] })
            this.strokeWidthInput.value = shape.path.attrs['stroke-width']
        }
    }

    onFillColorChange(color) {
        const shape = this.select.currentShape

        if (shape) {
            shape.path.attrs.fill = color
            shape.path.attrs['fill-opacity'] = this.fillMinicolor.minicolors('opacity')

            shape.path.repaint()
            return
        }

        const selection = this.select.selection

        if (selection.length > 0 && selection[0] instanceof PathControl) {
            selection.forEach(shape => {
                shape.path.attrs.fill = color
                shape.path.attrs['fill-opacity'] = this.fillMinicolor.minicolors('opacity')

                shape.path.repaint()
            })
            return
        }

        if (selection.length < 1 && (this.editor.mode === 'select' || this.editor.mode === 'draw')) {
            this.editor.defaultColors.fill.color = color
            this.editor.defaultColors.fill.opacity = this.fillMinicolor.minicolors('opacity')

            return
        }
    }

    onStrokeColorChange(color) {
        const shape = this.select.currentShape

        if (shape) {
            shape.path.attrs.stroke = color
            shape.path.attrs['stroke-opacity'] = this.strokeMinicolor.minicolors('opacity')

            shape.path.repaint()
            return
        }

        const selection = this.select.selection

        if (selection.length > 0 && selection[0] instanceof PathControl) {

            selection.forEach(shape => {
                shape.path.attrs.stroke = color
                shape.path.attrs['stroke-opacity'] = this.strokeMinicolor.minicolors('opacity')

                shape.path.repaint()
            })

            return
        }

        if (selection.length < 1 && (this.editor.mode === 'select' || this.editor.mode === 'draw')) {
            this.editor.defaultColors.stroke.color = color
            this.editor.defaultColors.stroke.opacity = this.strokeMinicolor.minicolors('opacity')
        }
    }

    onStrokeWidthChange(event) {
        const shape = this.select.currentShape

        console.log(shape)

        if (shape) {
            shape.path.attrs['stroke-width'] = event.target.value
            shape.path.repaint()
            return
        }

        const selection = this.select.selection

        if (selection.length > 0 && selection[0] instanceof PathControl) {

            selection.forEach(shape => {
                shape.path.attrs['stroke-width'] = event.target.value
                shape.path.repaint()
            })

            return
        }

        if (selection.length < 1 && (this.editor.mode === 'select' || this.editor.mode === 'draw')) {
            this.editor.defaultStrokeWidth = event.target.value
        }
    }

    onChangeSelection(selection) {
        if (selection.length > 0 && selection[0] instanceof PathControl) {
            const shape = selection[0]

            this.fillMinicolor.minicolors('value', { color: shape.path.attrs.fill, opacity: shape.path.attrs['fill-opacity'] })
            this.strokeMinicolor.minicolors('value', { color: shape.path.attrs.stroke, opacity: shape.path.attrs['stroke-opacity'] })
            this.strokeWidthInput.value = shape.path.attrs['stroke-width']
        }

        if (selection.length < 1 && (this.editor.mode === 'select' || this.editor.mode === 'draw')) {
            const defaultColors = this.editor.defaultColors

            this.fillMinicolor.minicolors('value', { color: defaultColors.fill.color, opacity: defaultColors.fill.opacity })
            this.strokeMinicolor.minicolors('value', { color: defaultColors.stroke.color, opacity: defaultColors.stroke.opacity })
            this.strokeWidthInput.value = this.editor.defaultStrokeWidth
        }
    }

    onShapeChanged(shape) {
        this.updateInputs(shape)
    }

    onModeChanged(mode) {
        this.setActiveModeClass(mode)
    }

    handleEvents() {
        const eventListeners = Object.entries(this.modeButtons).map(([mode, b]) => {
            const onClick = () => {
                this.editor.mode = mode
            }

            b.addEventListener('click', onClick)

            return { mode, fn: onClick }
        })

        function onDragging({ event }) {
            // if (this.toolbarElement.contains(event.target)) {
            //     this.toolbarElement.classList.toggle('tn-shape__toolbar_hidden', true)
            // }
        }

        function onMouseEnter() {
            // this.toolbarElement.classList.toggle('tn-shape__toolbar_hidden', false)
            emitter.emit('stopSelection')
        }

        function onMouseLeave() {
            emitter.emit('resumeSelection')
        }

        function onMouseMove() {
            emitter.emit('stopSelection')
        }


        const mouseEnter = onMouseEnter.bind(this)
        const mouseLeave = onMouseLeave.bind(this)
        const mouseMove = onMouseMove.bind(this)

        emitter.on('dragging', (params) => onDragging.call(this, params))
        emitter.on('shapeChanged', (shape) => this.onShapeChanged.call(this, shape))
        emitter.on('changeSelection', (selection) => this.onChangeSelection.call(this, selection))
        this.toolbarElement.addEventListener('mouseenter', mouseEnter)
        this.toolbarElement.addEventListener('mouseleave', mouseLeave)
        this.toolbarElement.addEventListener('mousemove', mouseMove)
        this.strokeWidthInput.addEventListener('change', (event) => this.onStrokeWidthChange(event))

        return function () {
            eventListeners.forEach(({ mode, fn }) => this.modeButtons[mode].removeEventListener('click', fn))
            this.toolbarElement.removeEventListener('mouseenter', mouseEnter)
            this.toolbarElement.removeEventListener('mouseleave', mouseLeave)
            this.toolbarElement.removeEventListener('mousemove', mouseMove)
        }
    }

    init() {
        this.toolbarElement.classList.add('tn-shape__toolbar')

        this.selectModeButton.classList.add('tn-shape__toolbar-button', 'tn-shape__toolbar-button_edit')
        this.editModeButton.classList.add('tn-shape__toolbar-button', 'tn-shape__toolbar-button_edit')
        this.drawModeButton.classList.add('tn-shape__toolbar-button', 'tn-shape__toolbar-button_draw')
        this.bendModeButton.classList.add('tn-shape__toolbar-button', 'tn-shape__toolbar-button_bend')

        this.fillWrapper.classList.add('tn-shape__toolbar-color', 'tn-shape__toolbar-color_fill')
        this.strokeWrapper.classList.add('tn-shape__toolbar-color', 'tn-shape__toolbar-color_stroke')

        this.strokeWidthWrapper.classList.add('tn-shape__toolbar-width')

        const fillLabel = document.createElement('label')
        fillLabel.innerText = 'FILL'

        const strokeLabel = document.createElement('label')
        strokeLabel.innerHTML = 'STROKE'

        const widthLabel = document.createElement('label')
        widthLabel.innerText = 'STROKE WIDTH'

        this.fillWrapper.append(fillLabel)
        this.fillWrapper.append(this.fillInput)

        this.strokeWrapper.append(strokeLabel)
        this.strokeWrapper.append(this.strokeInput)

        this.strokeWidthWrapper.append(widthLabel)
        this.strokeWidthWrapper.append(this.strokeWidthInput)

        this.setActiveModeClass(this.editor.mode)

        this.toolbarElement.append(this.selectModeButton)
        this.toolbarElement.append(this.drawModeButton)
        this.toolbarElement.append(this.editModeButton)
        this.toolbarElement.append(this.bendModeButton)
        this.toolbarElement.append(this.fillWrapper)
        this.toolbarElement.append(this.strokeWrapper)
        this.toolbarElement.append(this.strokeWidthWrapper)

        this.container.append(this.toolbarElement)

        emitter.on('modechange', (mode) => this.onModeChanged(mode))

        this.clearEvents = this.handleEvents()

        const defaultColors = this.editor.defaultColors

        this.fillMinicolor = $(this.fillInput).minicolors({
            opacity: true,
            letterCase: 'uppercase',
            defaultValue: defaultColors.fill.color,
            opacity: defaultColors.fill.opacity,
            change: (event) => this.onFillColorChange.call(this, event)
        })
        this.strokeMinicolor = $(this.strokeInput).minicolors({
            opacity: true,
            letterCase: 'uppercase',
            defaultValue: defaultColors.stroke.color,
            opacity: defaultColors.stroke.opacity,
            change: (event) => this.onStrokeColorChange.call(this, event)
        })
        this.strokeWidthInput.value = this.editor.defaultStrokeWidth
    }

    remove() {
        this.toolbarElement.remove()
        this.clearEvents()
    }
}