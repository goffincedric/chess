import { DialogButton } from '../../models/dialog/dialogButton.js';
import { Dialog } from '../../models/dialog/dialog.js';
import { DialogConstants } from '../../constants/dialogConstants.js';
import { DialogLabel } from '../../models/dialog/dialogLabel.js';
import { BoundingBox } from '../../models/boundingBox.js';
import { Position } from '../../models/position.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../constants/canvasConstants.js';
import { createAutoFlipBoardButton } from './buttons/autoflipBoardButton.js';
import { createEnableMoveUndoButton } from './buttons/enableMoveUndoButton.js';

// Set dialog position variables
const dialogWidth = 600;
const dialogHeight = 500;
const dialogBoundingBox = new BoundingBox(
    new Position(CANVAS_WIDTH / 2 - dialogWidth / 2, CANVAS_HEIGHT / 2 - dialogHeight / 2),
    new Position(CANVAS_WIDTH / 2 + dialogWidth / 2, CANVAS_HEIGHT / 2 + dialogHeight / 2),
);
const dialogBorderOffset = 50;
const dialogTitleSize = 32;

// Default setting button variables
const buttonWidth = (dialogWidth - dialogBorderOffset * 3) / 2;
const buttonLeftX = dialogBoundingBox.x1 + dialogBorderOffset;

// Create buttons
const autoFlipBoardButton = createAutoFlipBoardButton(
    buttonLeftX,
    dialogBoundingBox.y1 + dialogBorderOffset + dialogTitleSize,
    buttonWidth,
    DialogConstants.DEFAULT_DIALOG.BUTTON_HEIGHT,
);
const enableMoveUndoButton = createEnableMoveUndoButton(
    buttonLeftX + buttonWidth + dialogBorderOffset,
    dialogBoundingBox.y1 + dialogBorderOffset + dialogTitleSize,
    buttonWidth,
    DialogConstants.DEFAULT_DIALOG.BUTTON_HEIGHT,
);

// Create close dialog button
const closeAction = () => {
    settingsDialog.hide();
};
const closeButtonWidth = DialogConstants.DEFAULT_DIALOG.BUTTON_WIDTH;
const closeButtonHeight = DialogConstants.DEFAULT_DIALOG.BUTTON_HEIGHT;
const closeDialogButton = new DialogButton(
    'Close',
    new BoundingBox(
        new Position(
            dialogBoundingBox.x1 + dialogWidth / 2 - closeButtonWidth / 2,
            dialogBoundingBox.y2 - dialogBorderOffset - closeButtonHeight,
        ),
        new Position(dialogBoundingBox.x1 + dialogWidth / 2 + closeButtonWidth / 2, dialogBoundingBox.y2 - dialogBorderOffset),
    ),
    DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE,
    closeAction,
);

// Create settings dialog
const settingsDialog = new Dialog(new DialogLabel('Settings', dialogTitleSize), null, dialogBoundingBox, [
    autoFlipBoardButton,
    enableMoveUndoButton,
    closeDialogButton,
]);

// Export buttons and dialog
export const SettingsDialog = {
    buttons: {
        autoFlipBoardButton,
        closeDialogButton,
    },
    dialog: settingsDialog,
};
