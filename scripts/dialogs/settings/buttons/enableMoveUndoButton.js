import { Position } from '../../../models/position.js';
import { Settings } from '../../../config/settings.js';
import { DialogButton } from '../../../models/dialog/dialogButton.js';
import { BoundingBox } from '../../../models/boundingBox.js';
import { DialogConstants } from '../../../constants/dialogConstants.js';

export function createEnableMoveUndoButton(x, y, buttonWidth, buttonHeight) {
    // Create enable move undo button
    const enableMoveUndoButton = new DialogButton(
        '',
        new BoundingBox(new Position(x, y), new Position(x + buttonWidth, y + buttonHeight)),
        DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE,
    );

    // Set button properties
    const getEnableMoveUndoButtonText = () => `${Settings.getSetting(Settings.Names.EnableMoveUndo) ? 'Enable' : 'Disable'} undo last move`; // Create function that sets button text
    enableMoveUndoButton.text = getEnableMoveUndoButtonText();
    enableMoveUndoButton.action = () => {
        const enableMoveUndo = Settings.getSetting(Settings.Names.EnableMoveUndo);
        Settings.setSetting(Settings.Names.EnableMoveUndo, !enableMoveUndo);
        enableMoveUndoButton.text = getEnableMoveUndoButtonText();
    };

    // Return newly created button
    return enableMoveUndoButton;
}
