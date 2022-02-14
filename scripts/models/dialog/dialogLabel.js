export class DialogLabel {
    text;
    textSize;
    boundingBox;
    verticalAlign;

    constructor(text, textSize, verticalAlign = 'TOP') {
        this.text = text;
        this.textSize = textSize;
        this.verticalAlign = verticalAlign;
    }
}
