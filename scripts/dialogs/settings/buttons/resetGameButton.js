import { Position } from '../../../models/position.js';
import { Settings } from '../../../config/settings.js';
import { DialogButton } from '../../../models/dialog/dialogButton.js';
import { BoundingBox } from '../../../models/boundingBox.js';
import { DialogConstants } from '../../../constants/dialogConstants.js';

export function createAutoFlipBoardButton(x, y, buttonWidth, buttonHeight) {
    // Create auto flip board button
    const autoFlipBoardButton = new DialogButton(
        '',
        new BoundingBox(new Position(x, y), new Position(x + buttonWidth, y + buttonHeight)),
        DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE,
    );

    // Set button properties
    const getAutoFlipButtonText = () => `Auto-flip board: ${Settings.getSetting(Settings.Names.AutoFlipBoard) ? 'On' : 'Off'}`; // Create function that sets button text
    autoFlipBoardButton.text = getAutoFlipButtonText();
    autoFlipBoardButton.action = () => {
        const autoFlip = Settings.getSetting(Settings.Names.AutoFlipBoard);
        Settings.setSetting(Settings.Names.AutoFlipBoard, !autoFlip);
        autoFlipBoardButton.text = getAutoFlipButtonText();
    };

    // Return newly created button
    return autoFlipBoardButton;
}
