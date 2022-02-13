import { CanvasUtils } from '../../utils/canvasUtils.js';

export class Dialog {
    title;
    description;
    boundingBox;
    buttons;
    isShown;

    constructor(title, description, boundingBox, buttons = []) {
        this.title = title;
        this.description = description;
        this.boundingBox = boundingBox;
        this.buttons = [];
        this.isShown = false;

        buttons.forEach((button) => this.addButton(button));
    }

    addButton(button) {
        if (
            CanvasUtils.isPositionBetweenCoordinates(
                button.boundingBox.x1,
                button.boundingBox.y1,
                this.boundingBox.x1,
                this.boundingBox.y1,
                this.boundingBox.x2,
                this.boundingBox.y2,
            ) &&
            CanvasUtils.isPositionBetweenCoordinates(
                button.boundingBox.x2,
                button.boundingBox.y2,
                this.boundingBox.x1,
                this.boundingBox.y1,
                this.boundingBox.x2,
                this.boundingBox.y2,
            )
        ) {
            this.buttons.push(button);
        }
    }

    show() {
        this.isShown = true;
    }

    hide() {
        this.isShown = false;
    }
}
