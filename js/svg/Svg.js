import SvgCollection from "./SvgCollection.js";

export default class Svg extends SvgCollection {
    constructor(container, options, svgConfig) {
        const containerRect = container.getBoundingClientRect()

        super(options, {
            tag: 'svg',
            name: 'svg',
            id: 'root',
            attrs: {
                width: containerRect.width,
                height: containerRect.height
            },
            ...svgConfig
        })

        this.container = container
        this.container.append(this.el)
    }
}