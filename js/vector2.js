function Vector2(coords) {
    this.x = coords[0]
    this.y = coords[1]

    this.distance = function (vector) {
        return Math.sqrt(Math.pow(this.x - vector.x, 2) + Math.pow(this.y - vector.y, 2))
    }

    this.perpendecular = function (clockwise = false) {
        return clockwise ? new Vector2([this.y, -this.x]) : new Vector2([-this.y, this.x])
    }

    this.magnitude = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    this.scalarProduct = function (scalar) {
        return new Vector2([this.x * scalar, this.y * scalar])
    }

    this.dotProduct = function (vector) {
        return this.x * vector.x + this.y * vector.y
    }

    this.addVector = function (vector) {
        return new Vector2([this.x + vector.x, this.y + vector.y])
    }

    this.addVectorCoords = function (coords) {
        return new Vector2([this.x + coords[0], this.y + coords[1]])
    }

    this.normalize = function () {
        const magnitude = this.magnitude()
        return new Vector2([this.x / magnitude, this.y / magnitude])
    }

    this.rotate = function (angle) {
        const x = Math.cos(angle) * this.x - Math.sin(angle) * this.y
        const y = Math.sin(angle) * this.x + Math.cos(angle) * this.y

        return new Vector2([x, y])
    }

    this.reverse = function () {
        return new Vector2([-this.x, -this.y])
    }

    this.toArray = function () {
        return [this.x, this.y]
    }
}

Vector2.fromPoints = function (p1, p2) {
    return new Vector2([p2[0] - p1[0], p2[1] - p1[1]])
}