export class BoundingBox {
    x1;
    x2;
    y1;
    y2;

    constructor(position1, position2) {
        this.x1 = Math.min(position1.x, position2.x);
        this.x2 = Math.max(position1.x, position2.x);
        this.y1 = Math.min(position1.y, position2.y);
        this.y2 = Math.max(position1.y, position2.y);
    }

    getWidth() {
        return this.x2 - this.x1;
    }

    getHeight() {
        return this.y2 - this.y1;
    }
}
