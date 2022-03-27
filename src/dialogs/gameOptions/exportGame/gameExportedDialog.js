import { DialogButton } from '../../../models/dialog/dialogButton.js';
import { Dialog } from '../../../models/dialog/dialog.js';
import { DialogConstants } from '../../../constants/dialogConstants.js';
import { DialogLabel } from '../../../models/dialog/dialogLabel.js';

// Create close dialog button
const closeAction = () => {
    gameExportedDialog.hide();
};
const closeDialogButton = new DialogButton('Close', DialogConstants.DEFAULT_DIALOG.BUTTONS_1.BUTTON_1.BOUNDING_BOX, DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE, closeAction);

// Create game exported dialog
const gameExportedDialog = new Dialog(
    new DialogLabel('Export game for analysis', 28),
    new DialogLabel(
        'The game has been exported to your clipboard and can be used for analysis on sites such as ' +
            'chess.com/analysis, lichess.org/paste or any other site accepting the exported format.',
        18,
        'TOP',
    ),
    DialogConstants.DEFAULT_DIALOG.BOUNDING_BOX,
    [closeDialogButton],
);

// Export buttons and dialog
export const GameExportedDialog = {
    buttons: {
        closeDialogButton,
    },
    dialog: gameExportedDialog,
};
