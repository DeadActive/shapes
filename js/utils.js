function createSVGElement(tag, options) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag, options)
}

function setCSSProperty(el, property, value) {
    el.style.setProperty(property, value)
}

function vectorDistance(x, y, x1, y1) {
    return Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2))
}

function distance(point1, point2) {
    return vectorDistance(point1[0], point1[1], point2[0], point2[1])
}

function calculateBezier(t, p1, p2, p3, p4) {
    const x = Math.pow(1 - t, 3) * p1[0] + 3 * Math.pow(1 - t, 2) * t * p2[0] + 3 * (1 - t) * t * t * p3[0] + (t * t * t * p4[0])
    const y = Math.pow(1 - t, 3) * p1[1] + 3 * Math.pow(1 - t, 2) * t * p2[1] + 3 * (1 - t) * t * t * p3[1] + (t * t * t * p4[1])

    return [x, y]
}

function calculateQuadraticBezier(t, p1, p2, p3) {
    const x = Math.pow(1 - t, 2) * p1[0] + 2 * (1 - t) * t * p2[0] + t * t * p3[0]
    const y = Math.pow(1 - t, 2) * p1[1] + 2 * (1 - t) * t * p2[1] + t * t * p3[1]

    return [x, y]
}

function calculateBezierDerivative(t, p0, p1, p2, p3) {
    const x = 3 * Math.pow(1 - t, 2) * (p1[0] - p0[0]) + 6 * (1 - t) * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0])
    const y = 3 * Math.pow(1 - t, 2) * (p1[1] - p0[1]) + 6 * (1 - t) * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1])

    return [x, y]
}

let AUTO_HANDLERS_MULTIPLIER = 1