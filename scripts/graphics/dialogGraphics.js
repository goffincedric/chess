import { COLORS } from '../constants/boardConstants.js';
import { Dialog } from '../models/dialog/dialog.js';
import { CanvasUtils } from '../utils/canvasUtils.js';
import { DialogConstants } from '../constants/dialogConstants.js';

const dialogs = [];

function addDialog(dialog) {
    dialogs.push(dialog);
}

function removeDialog(dialog) {
    dialogs.splice(dialogs.indexOf(dialog), 1);
}

function drawDialogs(p) {
    dialogs.forEach((dialog) => drawDialog(p, dialog));
}

function drawDialog(p, dialog) {
    if (!(dialog instanceof Dialog) || !dialog.isShown) return;

    // Draw box
    p.strokeWeight(2);
    p.stroke(p.color(COLORS.DARK));
    p.fill(p.color(COLORS.LIGHTER));
    p.rect(dialog.boundingBox.x1, dialog.boundingBox.y1, dialog.boundingBox.getWidth(), dialog.boundingBox.getHeight());

    // Add title to box
    let titleYOffset = DialogConstants.DEFAULT_DIALOG.BORDER_OFFSET;
    let textSize = dialog.title?.textSize ?? 32;
    p.fill(p.color(COLORS.DARK));
    p.strokeWeight(0);
    p.textSize(textSize);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(dialog.title.text, dialog.boundingBox.x1 + dialog.boundingBox.getWidth() / 2, dialog.boundingBox.y1 + titleYOffset);

    // Add description to box
    if (dialog.description) {
        let descriptionYOffset = titleYOffset + textSize;
        let descriptionXOffset = dialog.boundingBox.getWidth() / 9;
        let textHeight = dialog.boundingBox.getHeight() / 2.5;
        let textWidth = descriptionXOffset * 7;
        p.stroke(p.color(p.DARKEST));
        p.textSize(dialog.description?.textSize ?? 24);
        p.textAlign(p.CENTER, dialog.description.verticalAlign === 'CENTER' ? p.CENTER : p.TOP);
        p.text(
            dialog.description.text,
            dialog.boundingBox.x1 + descriptionXOffset,
            dialog.boundingBox.y1 + descriptionYOffset,
            textWidth,
            textHeight,
        );
    }

    // Draw dialog buttons
    dialog.buttons.forEach((button) => drawDialogButton(p, button));
}

function drawDialogButton(p, button) {
    // Draw button box
    p.strokeWeight(2);
    p.stroke(p.color(COLORS.DARK));
    if (
        CanvasUtils.isPositionBetweenCoordinates(
            p.mouseX,
            p.mouseY,
            button.boundingBox.x1,
            button.boundingBox.y1,
            button.boundingBox.x2,
            button.boundingBox.y2,
        )
    ) {
        p.fill(p.color(COLORS.BUTTON_HOVER));
    } else {
        p.fill(p.color(COLORS.LIGHT));
    }
    p.rect(button.boundingBox.x1, button.boundingBox.y1, button.boundingBox.getWidth(), button.boundingBox.getHeight());

    // Draw text
    p.noStroke();
    p.fill(p.color(COLORS.DARK));
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(button.textSize || DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE);
    p.text(
        button.text,
        button.boundingBox.x1 + button.boundingBox.getWidth() / 2,
        button.boundingBox.y1 + button.boundingBox.getHeight() / 2,
    );
}

function checkDialogActions(p) {
    const { dialog, button } =
        dialogs.reduce((foundAction, dialog) => {
            if (foundAction || !dialog.isShown) return foundAction;
            const button = dialog.buttons.find((button) =>
                CanvasUtils.isPositionBetweenCoordinates(
                    p.mouseX,
                    p.mouseY,
                    button.boundingBox.x1,
                    button.boundingBox.y1,
                    button.boundingBox.x2,
                    button.boundingBox.y2,
                ),
            );
            if (button) return { dialog, button };
        }, null) ?? {};
    if (button) {
        button.click();
    }
}

function isDrawingDialogs() {
    return dialogs.some((dialog) => dialog.isShown);
}

export const DialogGraphics = {
    addDialog,
    removeDialog,
    drawDialogs,
    checkDialogActions,
    isDrawingDialogs,
};
