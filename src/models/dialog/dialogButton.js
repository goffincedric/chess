import { DialogConstants } from '../../constants/dialogConstants.js';
import { FunctionUtils } from '../../utils/functionUtils.js';

export class DialogButton {
    text;
    boundingBox;
    action;
    textSize;

    constructor(text, boundingBox, textSize = DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE, action = FunctionUtils.asyncNoOp) {
        this.text = text;
        this.boundingBox = boundingBox;
        this.action = action;
    }

    async click() {
        await this.action();
    }
}
