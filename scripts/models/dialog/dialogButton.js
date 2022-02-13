export class DialogButton {
    text;
    boundingBox;
    action;

    constructor(text, boundingBox, action = () => Promise.resolve()) {
        this.text = text;
        this.boundingBox = boundingBox;
        this.action = action;
    }

    async click() {
        await this.action();
    }
}
