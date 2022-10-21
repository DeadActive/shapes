export function createEmitter() {
    const events = {}
    return {
        on: (event, callback) => {
            events[event]?.push(callback) || (events[event] = [callback])
            return () => {
                events[event] = this.event[event]?.filter(i => cb !== i)
            }
        },
        emit: (event, ...args) => {
            const callbacks = events[event] || []
            callbacks.forEach(cb => cb(...args))
        }
    }
}
export const emitter = createEmitter()

export const createIdCounter = (lastId = 0) => () => lastId++
export const getId = createIdCounter()

export function dragEvents(container, dragStart, dragging, dragEnd) {
    let isDragging = false
    let isMouseDown = false
    let lastPointerEvent = null

    function onMouseDown(event) {
        isMouseDown = true
    }

    function onMouseUp(event) {
        if (isDragging) dragEnd(event)

        isDragging = false
        isMouseDown = false
        lastPointerEvent = null
    }

    function onMouseMove(event) {
        if (isMouseDown && lastPointerEvent === null) {
            dragStart(event)
            isDragging = true
        }

        if (isDragging) {
            if (lastPointerEvent === null) lastPointerEvent = event
            dragging(lastPointerEvent, event)
            lastPointerEvent = event
        }
    }

    container.addEventListener('mousedown', onMouseDown)
    container.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mousemove', onMouseMove)

    return function () {
        container.removeEventListener('mousedown', onMouseDown)
        container.removeEventListener('mouseup', onMouseUp)
        document.removeEventListener('mousemove', onMouseMove)
    }
}

export function isPointInBox(px, py, x, y, ex, ey) {
    return px > x && px < ex && py > y && py < ey
}

export function arrayFlatten(array) {
    const result = []

    array.forEach(arr => {
        if (Array.isArray(arr)) {
            return result.push(...arr)
        }
        result.push(arr)
    })

    return result
}

export function distance(point1, point2) {
    return vectorDistance(point1[0], point1[1], point2[0], point2[1])
}

export function calculateBezier(t, p1, p2, p3, p4) {
    const x = Math.pow(1 - t, 3) * p1[0] + 3 * Math.pow(1 - t, 2) * t * p2[0] + 3 * (1 - t) * t * t * p3[0] + (t * t * t * p4[0])
    const y = Math.pow(1 - t, 3) * p1[1] + 3 * Math.pow(1 - t, 2) * t * p2[1] + 3 * (1 - t) * t * t * p3[1] + (t * t * t * p4[1])

    return [x, y]
}

export function calculateQuadraticBezier(t, p1, p2, p3) {
    const x = Math.pow(1 - t, 2) * p1[0] + 2 * (1 - t) * t * p2[0] + t * t * p3[0]
    const y = Math.pow(1 - t, 2) * p1[1] + 2 * (1 - t) * t * p2[1] + t * t * p3[1]

    return [x, y]
}

export function vectorDistance(x, y, x1, y1) {
    return Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2))
}