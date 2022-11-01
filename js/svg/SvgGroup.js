import SvgCollection from "./SvgCollection.js";

export default class SvgGroup extends SvgCollection {
    constructor(options, svgConfig) {
        super(options, {
            tag: 'g',
            ...svgConfig
        })
    }
} 