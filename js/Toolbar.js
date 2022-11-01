import { emitter } from "./utils/index.js"
import LayerControl from './controls/LayerControl.js'

const HELP_HTML = `
                <div class="tn-shape__help-grid">
                    <div class="tn-shape__help-shortcuts">
                        <div class="tn-shape__help-title">Shortcuts</div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name"
                                >Select mode</span
                            >
                            <span class="tn-shape__help-item-key">1</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name"
                                >Draw mode</span
                            >
                            <span class="tn-shape__help-item-key">2</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name"
                                >Edit mode</span
                            >
                            <span class="tn-shape__help-item-key">3</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name"
                                >Bend mode</span
                            >
                            <span class="tn-shape__help-item-key">4</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name">Undo</span>
                            <span class="tn-shape__help-item-key">⌘ + Z</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name">Redo</span>
                            <span class="tn-shape__help-item-key"
                                >⌘ + ⇧ + Z</span
                            >
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name">Copy</span>
                            <span class="tn-shape__help-item-key">⌘ + C</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name">Paste</span>
                            <span class="tn-shape__help-item-key">⌘ + V</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name">Remove</span>
                            <span class="tn-shape__help-item-key">Backspace/Delete</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name">Send to front</span>
                            <span class="tn-shape__help-item-key">]</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name">Move to back</span>
                            <span class="tn-shape__help-item-key">[</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name">Move step front</span>
                            <span class="tn-shape__help-item-key">⌘ + ]</span>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name">Move step back</span>
                            <span class="tn-shape__help-item-key">⌘ + [</span>
                        </div>
                    </div>
                    <div class="tn-shape__help-select">
                        <div class="tn-shape__help-title">Select mode</div>
                        <div>
                            <p>
                                TODO: Change text to pictograms <br />Select
                                shape with left mouse button, double click to
                                switch to edit mode.
                            </p>
                        </div>
                    </div>
                    <div class="tn-shape__help-draw">
                        <div class="tn-shape__help-title">Draw mode</div>
                        <div>
                            <p>
                                TODO: Change text to pictograms <br />
                                Use left mouse button to draw new shape, drag to
                                curve.
                            </p>
                        </div>
                    </div>
                    <div class="tn-shape__help-edit">
                        <div class="tn-shape__help-title">Edit mode</div>
                        <div>
                            <p>
                                TODO: Change text to pictograms <br />
                                Use left mouse button to drag shape controls.
                            </p>
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name"
                                >No mirror</span
                            >
                            <span class="tn-shape__help-item-key"
                                >Drag + ⌘</span
                            >
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name"
                                >Mirror angle</span
                            >
                            <span class="tn-shape__help-item-key"
                                >Drag + ⌥</span
                            >
                        </div>
                        <div class="tn-shape__help-item">
                            <span class="tn-shape__help-item-name"
                                >Toggle curve mode</span
                            >
                            <span class="tn-shape__help-item-key"
                                >Doubleclick</span
                            >
                        </div>
                    </div>
                    <div class="tn-shape__help-bend">
                        <div class="tn-shape__help-title">Bend mode</div>
                        <div>
                            <p>
                                TODO: Change text to pictograms <br />
                                Drag to smooth segments or points.
                            </p>
                        </div>
                    </div>
                    <div class="tn-shape__help-stuff"></div>
                </div>
            
`

export default class Toolbar {
    constructor(shapeEditor) {
        this.shapeEditor = shapeEditor
        this.container = shapeEditor.editor.container
        this.editor = shapeEditor.editor
        this.select = shapeEditor.select
        this.stateMachine = shapeEditor.stateMachine

        this.toolbarElement = document.createElement('div')
        this.editModeButton = document.createElement('button')
        this.drawModeButton = document.createElement('button')
        this.bendModeButton = document.createElement('button')
        this.selectModeButton = document.createElement('button')
        this.helpButton = document.createElement('button')

        this.helpMessage = document.createElement('div')

        this.fillWrapper = document.createElement('div')
        this.strokeWrapper = document.createElement('div')

        this.fillInput = document.createElement('input')
        this.strokeInput = document.createElement('input')

        this.strokeWidthWrapper = document.createElement('div')
        this.strokeWidthInput = document.createElement('input')
        this.strokeWidthInput.type = 'number'
        this.strokeWidthInput.min = 0

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

    updateInputs() {
        const selection = this.select.selection


        if (selection.length > 0 && selection[0] instanceof LayerControl) {
            const pathEl = selection[0].path
            this.fillMinicolor.minicolors('value', { color: pathEl.attrs.fill, opacity: pathEl.attrs['fill-opacity'] })
            this.strokeMinicolor.minicolors('value', { color: pathEl.attrs.stroke, opacity: pathEl.attrs['stroke-opacity'] })
            this.strokeWidthInput.value = pathEl.attrs['stroke-width']
        } else {
            const defaultColors = this.editor.defaultColors

            this.fillMinicolor.minicolors('value', { color: defaultColors.fill.color, opacity: defaultColors.fill.opacity })
            this.strokeMinicolor.minicolors('value', { color: defaultColors.stroke.color, opacity: defaultColors.stroke.opacity })
            this.strokeWidthInput.value = this.editor.defaultStrokeWidth
        }
    }

    onFillColorChange(color) {
        const selection = this.select.selection

        if (selection.length > 0 && selection[0] instanceof LayerControl) {
            selection.forEach(shape => {
                shape.path.setAttrsBatch({
                    fill: color,
                    'fill-opacity': this.fillMinicolor.minicolors('opacity')
                })
            })
            return
        }

        if (selection.length < 1) {
            this.editor.defaultColors.fill.color = color
            this.editor.defaultColors.fill.opacity = this.fillMinicolor.minicolors('opacity')

            return
        }
    }

    onStrokeColorChange(color) {
        const selection = this.select.selection

        if (selection.length > 0 && selection[0] instanceof LayerControl) {

            selection.forEach(shape => {
                shape.path.setAttrsBatch({
                    stroke: color,
                    'stroke-opacity': this.strokeMinicolor.minicolors('opacity')
                })
            })

            return
        }

        if (selection.length < 1 && (this.editor.mode === 'select' || this.editor.mode === 'draw')) {
            this.editor.defaultColors.stroke.color = color
            this.editor.defaultColors.stroke.opacity = this.strokeMinicolor.minicolors('opacity')
        }
    }

    onStrokeWidthChange(event) {
        const selection = this.select.selection

        if (selection.length > 0 && selection[0] instanceof LayerControl) {

            selection.forEach(shape => {
                shape.path.setAttr('stroke-width', event.target.value)
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

    onStateChanged(state) {
        this.setActiveModeClass(state.name)
    }

    setVisibility(value) {
        this.toolbarElement.classList.toggle('tn-shape__toolbar_hidden', !value)
    }

    handleEvents() {
        const eventListeners = Object.entries(this.modeButtons).map(([mode, b]) => {
            const onClick = () => {
                this.stateMachine.setState(mode)
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
            emitter.emit('stopEvents')
        }

        function onMouseLeave() {
            emitter.emit('resumeEvents')
        }

        function onMouseMove() {
            emitter.emit('stopEvents')
        }

        const mouseEnter = onMouseEnter.bind(this)
        const mouseLeave = onMouseLeave.bind(this)
        const mouseMove = onMouseMove.bind(this)

        emitter.on('dragging', (params) => onDragging.call(this, params))
        emitter.on('shapeChanged', (shape) => this.onShapeChanged.call(this, shape))
        emitter.on('changeSelection', (selection) => this.updateInputs.call(this, selection))
        this.toolbarElement.addEventListener('mouseenter', mouseEnter)
        this.toolbarElement.addEventListener('mouseleave', mouseLeave)
        this.toolbarElement.addEventListener('mousemove', mouseMove)
        this.strokeWidthInput.addEventListener('change', (event) => this.onStrokeWidthChange(event))
        this.helpButton.addEventListener('click', () => {
            this.helpMessage.classList.toggle('tn-shape__help-show')
        })
        this.helpMessage.addEventListener('click', () => {
            this.helpMessage.classList.toggle('tn-shape__help-show', false)
        })

        return function () {
            eventListeners.forEach(({ mode, fn }) => this.modeButtons[mode].removeEventListener('click', fn))
            this.toolbarElement.removeEventListener('mouseenter', mouseEnter)
            this.toolbarElement.removeEventListener('mouseleave', mouseLeave)
            this.toolbarElement.removeEventListener('mousemove', mouseMove)
        }
    }

    init() {
        this.toolbarElement.classList.add('tn-shape__toolbar')

        this.selectModeButton.classList.add('tn-shape__toolbar-button', 'tn-shape__toolbar-button_select')
        this.editModeButton.classList.add('tn-shape__toolbar-button', 'tn-shape__toolbar-button_edit')
        this.drawModeButton.classList.add('tn-shape__toolbar-button', 'tn-shape__toolbar-button_draw')
        this.bendModeButton.classList.add('tn-shape__toolbar-button', 'tn-shape__toolbar-button_bend')
        this.helpButton.classList.add('tn-shape__toolbar-button', 'tn-shape__toolbar-button_help')

        this.selectModeButton.setAttribute('title', 'Select mode')
        this.editModeButton.setAttribute('title', 'Edit mode')
        this.drawModeButton.setAttribute('title', 'Draw mode')
        this.bendModeButton.setAttribute('title', 'Bend mode')
        this.helpButton.setAttribute('title', 'Help')

        this.fillWrapper.classList.add('tn-shape__toolbar-color', 'tn-shape__toolbar-color_fill')
        this.strokeWrapper.classList.add('tn-shape__toolbar-color', 'tn-shape__toolbar-color_stroke')

        this.strokeWidthWrapper.classList.add('tn-shape__toolbar-width')

        const fillLabel = document.createElement('label')
        fillLabel.innerText = 'FILL'

        const strokeLabel = document.createElement('label')
        strokeLabel.innerHTML = 'STROKE'

        const widthLabel = document.createElement('label')
        widthLabel.innerText = 'WIDTH'

        this.fillWrapper.append(fillLabel)
        this.fillWrapper.append(this.fillInput)

        this.strokeWrapper.append(strokeLabel)
        this.strokeWrapper.append(this.strokeInput)

        this.strokeWidthWrapper.append(widthLabel)
        this.strokeWidthWrapper.append(this.strokeWidthInput)

        this.setActiveModeClass(this.stateMachine.currentState.name)

        this.toolbarElement.append(this.selectModeButton)
        this.toolbarElement.append(this.drawModeButton)
        this.toolbarElement.append(this.editModeButton)
        this.toolbarElement.append(this.bendModeButton)
        this.toolbarElement.append(this.fillWrapper)
        this.toolbarElement.append(this.strokeWrapper)
        this.toolbarElement.append(this.strokeWidthWrapper)
        this.toolbarElement.append(this.helpButton)

        this.helpMessage.classList.add('tn-shape__help')
        this.helpMessage.innerHTML = HELP_HTML
        this.container.append(this.toolbarElement)
        this.container.append(this.helpMessage)


        emitter.on('stateChange', (state) => this.onStateChanged(state))

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