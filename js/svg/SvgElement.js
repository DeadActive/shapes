import { getId } from '../utils/index.js'

export default class SvgElement {
    constructor(config) {
        this.collection = config?.collection || null
        this.el = document.createElementNS('http://www.w3.org/2000/svg', config.tag)
        this.init(config)
    }

    init(config) {
        this.attrs = config?.attrs || {}
        this.classes = config?.classes || {}
        this.name = config?.name
        this.id = config?.id || getId()
        this.zIndex = config?.zIndex || 0

        Object.entries(this.attrs).forEach(([attr, value]) => {
            this.el.setAttribute(attr, value)
        })
        Object.entries(this.classes).forEach(([key, value]) => {
            this.el.classList.toggle(key, value)
        })

        this.el.dataset['svgName'] = this.name
        this.el.dataset['svgId'] = this.id
    }

    update(config) {
        this.init(config)

        Object.entries(this.attrs).forEach(([attr, value]) => {
            this.el.setAttribute(attr, value)
        })
        Object.entries(this.classes).forEach(([key, value]) => {
            this.el.classList.toggle(key, value)
        })

        this.el.dataset['svgName'] = this.name
        this.el.dataset['svgId'] = this.id
    }

    remove() {
        this.el.remove()
        this.collection.removeChild(this)
    }

    setId(id) {
        this.id = id
        this.el.dataset['svgId'] = this.id
    }

    setName(name) {
        this.name = name
        this.el.dataset['svgName'] = this.name
    }

    setZIndex(zIndex) {
        this.zIndex = zIndex
        this.collection.reorder()
    }

    setAttrs(attrs) {
        this.attrs = attrs
        Object.entries(this.attrs).forEach(([attr, value]) => {
            this.el.setAttribute(attr, value)
        })
    }

    setAttr(name, value) {
        this.attrs[name] = value

        this.el.setAttribute(name, value)
    }

    setAttrsBatch(attrs) {
        Object.assign(this.attrs, attrs)

        Object.entries(attrs).forEach(([attr, value]) => {
            this.el.setAttribute(attr, value)
        })
    }

    setClass(key, value) {
        this.classes[key] = value
        this.el.classList.toggle(key, value)
    }

    setClasses(classes) {
        this.classes = classes
        Object.entries(classes).forEach(([key, value]) => {
            this.el.classList.toggle(key, value)
        })
    }

    setClassesBatch(classes) {
        Object.assign(this.classes, classes)
        Object.entries(classes).forEach(([key, value]) => {
            this.el.classList.toggle(key, value)
        })
    }

    bringToFront() {
        this.collection.bringChildToFront(this)
    }

    sendToBack() {
        this.collection.sendChildToBack(this)
    }

    moveBack() {
        this.collection.moveChildBack(this)
    }

    moveFront() {
        this.collection.moveChildFront(this)
    }
}