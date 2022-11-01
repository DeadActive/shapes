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
    let startPointerEvent = null
    let timeoutId

    function onMouseDown(event) {
        timeoutId = setTimeout(() => {
            isMouseDown = true
            startPointerEvent = event
            clearTimeout(timeoutId)
        }, 50);
    }

    function onMouseUp(event) {
        clearTimeout(timeoutId)
        if (isDragging) dragEnd(event)
        isDragging = false
        isMouseDown = false
        lastPointerEvent = null
        startPointerEvent = null
    }

    function onMouseMove(event) {
        if (isMouseDown && lastPointerEvent === null && startPointerEvent) {
            dragStart(startPointerEvent)
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

export function isPointInBox(px, py, box) {
    const { x, y, ex, ey } = box
    return px > x && px < ex && py > y && py < ey
}

export function normalizeBox(box) {
    return {
        x: box.x > box.ex ? box.ex : box.x,
        y: box.y > box.ey ? box.ey : box.y,
        ex: box.ex > box.x ? box.ex : box.x,
        ey: box.ey > box.y ? box.ey : box.y
    }
}

export function isIntersectBoxes(b1, b2) {
    return !(b2.x > b1.ex || b2.ex < b1.x || b2.y > b1.ey || b2.ey < b2.y)
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

export function defined(value) {
    return value !== void 0 || value !== undefined
}

export function defaultValue(value, defaultVal) {
    return defined(value) ? value : defaultVal
}

export const debounce = (callback, wait) => {
    let timeoutId = null;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
}

export const throttle = (fn, wait) => {
    let inThrottle, lastFn, lastTime;
    return function () {
        const context = this,
            args = arguments;
        if (!inThrottle) {
            fn.apply(context, args);
            lastTime = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFn);
            lastFn = setTimeout(function () {
                if (Date.now() - lastTime >= wait) {
                    fn.apply(context, args);
                    lastTime = Date.now();
                }
            }, Math.max(wait - (Date.now() - lastTime), 0));
        }
    };
};