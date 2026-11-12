export class Point {
    x: number;
    y: number;

    private _parent: Point[];

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    get parent(): Point[] {
        return this._parent;
    }
    set parent(value: Point[]) {
        if (this._parent !== value) {
            if (!!this._parent) {
                let index = this._parent.indexOf(this);
                if (index !== -1) {
                    this._parent.splice(index, 1);
                }
            }
            if (!!value) {
                value.push(this);
            }
            this._parent = value;
        }
    }

}

export class Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    set(x = 0, y = 0, width = 0, height = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(point: Point): boolean {
        return (
            point.x >= this.x &&
            point.x < this.x + this.width &&
            point.y >= this.y &&
            point.y < this.y + this.height
        );
    }

    intersects(range: Rectangle): boolean {
        return (
            this.x < range.x + range.width &&
            this.x + this.width > range.x &&
            this.y < range.y + range.height &&
            this.y + this.height > range.y
        );
    }
}

export class QuadTree<T extends Point> {
    boundary: Rectangle;
    capacity: number;
    points: T[];
    children: QuadTree<T>[];

    constructor(boundary: Rectangle, capacity: number) {
        this.boundary = boundary;
        this.capacity = capacity;
        this.points = [];

        this.children = [];
    }

    subdivide(): void {
        const x = this.boundary.x;
        const y = this.boundary.y;
        const w = this.boundary.width / 2;
        const h = this.boundary.height / 2;

        this.children.push(new QuadTree(new Rectangle(x, y, w, h), this.capacity));
        this.children.push(new QuadTree(new Rectangle(x + w, y, w, h), this.capacity));
        this.children.push(new QuadTree(new Rectangle(x, y + h, w, h), this.capacity));
        this.children.push(new QuadTree(new Rectangle(x + w, y + h, w, h), this.capacity));
    }

    add(point: T): boolean {
        if (!this.boundary.contains(point)) {
            return false;
        }

        if (this.points.length < this.capacity) {
            point.parent = this.points;
            return true;
        } else {
            if (this.children.length === 0) {
                this.subdivide();
            }
            let inserted = false;
            for (const child of this.children) {
                inserted = child.add(point);
                if (inserted) break;
            }
            return inserted;
        }
    }

    delete(point: T) {
        point.parent = null;
    }

    query(range: Rectangle): T[] {
        const foundPoints: T[] = [];

        if (!this.boundary.intersects(range)) {
            return foundPoints;
        }

        for (const point of this.points) {
            if (range.contains(point)) {
                foundPoints.push(point);
            }
        }

        if (this.children.length > 0) {
            for (const child of this.children) {
                const points = child.query(range);
                foundPoints.push(...points);
            }
        }

        return foundPoints;
    }
}
