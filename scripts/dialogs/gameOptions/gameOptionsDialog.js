import { DialogButton } from '../../models/dialog/dialogButton.js';
import { Dialog } from '../../models/dialog/dialog.js';
import { DialogConstants } from '../../constants/dialogConstants.js';
import { DialogLabel } from '../../models/dialog/dialogLabel.js';
import { ExportGameDialog } from './exportGame/exportGameDialog.js';
import { WebStorageConstants } from '../../constants/webStorageConstants.js';

// Create export game button
const exportGameAction = async () => {
    gameOptionsDialog.hide();
    ExportGameDialog.dialog.show();
};
const exportGameButton = new DialogButton(
    'Export game',
    DialogConstants.DEFAULT_DIALOG.BUTTONS_2.BUTTON_1.BOUNDING_BOX,
    DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE,
    exportGameAction,
);

// Create reset game button
const resetGameAction = async () => {
    localStorage.removeItem(WebStorageConstants.SAVED_GAME_PGN);
    chessBoard.resetGame();
    gameOptionsDialog.hide();
};
const resetGameButton = new DialogButton(
    'Reset game',
    DialogConstants.DEFAULT_DIALOG.BUTTONS_2.BUTTON_2.BOUNDING_BOX,
    DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE,
    resetGameAction,
);

// Create game options dialog
const gameOptionsDialog = new Dialog(new DialogLabel('Game options', 28), null, DialogConstants.DEFAULT_DIALOG.BOUNDING_BOX, [
    resetGameButton,
    exportGameButton,
]);

// Export buttons and dialog
export const GameOptionsDialog = {
    buttons: {
        resetGameButton,
        exportGameButton,
    },
    dialog: gameOptionsDialog,
};
