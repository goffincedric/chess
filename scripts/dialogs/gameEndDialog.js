import { DialogButton } from '../models/dialog/dialogButton.js';
import { Dialog } from '../models/dialog/dialog.js';
import { DialogConstants } from '../constants/dialogConstants.js';
import { FunctionUtils } from '../utils/functionUtils.js';
import { DialogLabel } from '../models/dialog/dialogLabel.js';
import { GameConstants } from '../constants/gameConstants.js';

// Create view board button
const viewBoardButton = new DialogButton(
    'View board',
    DialogConstants.DEFAULT_DIALOG.BUTTONS_2.BUTTON_1.BOUNDING_BOX,
    DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE,
    FunctionUtils.asyncNoOp,
);

// Create reset game button
const resetGameButton = new DialogButton(
    'Reset game',
    DialogConstants.DEFAULT_DIALOG.BUTTONS_2.BUTTON_2.BOUNDING_BOX,
    DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE,
    FunctionUtils.asyncNoOp,
);

// Create game end dialog
const gameEndDialog = new Dialog(
    new DialogLabel('Title_placeholder', 32),
    new DialogLabel('Description_placeholder', 24, 'CENTER'),
    DialogConstants.DEFAULT_DIALOG.BOUNDING_BOX,
    [viewBoardButton, resetGameButton],
);

function updateGameEndDialogText(gameState, isWhiteTurn) {
    // Define what text to show
    switch (gameState) {
        case GameConstants.States.CHECKMATE:
            gameEndDialog.title.text = 'Checkmate!';
            gameEndDialog.description.text = `Checkmate, ${isWhiteTurn ? 'black' : 'white'} is victorious.`;
            break;
        case GameConstants.States.DRAW_CALLED:
        case GameConstants.States.DRAW_STALEMATE:
        case GameConstants.States.DRAW_INSUFFICIENT_PIECES:
            gameEndDialog.title.text = "It's a draw!";
            switch (gameState) {
                case GameConstants.States.DRAW_STALEMATE:
                    gameEndDialog.description.text = `Stalemate, ${isWhiteTurn ? 'black' : 'white'} can't play any more moves.`;
                    break;
                case GameConstants.States.DRAW_INSUFFICIENT_PIECES:
                    gameEndDialog.description.text = "Insufficient pieces to finish the game, it's a draw!";
                    break;
                case GameConstants.States.DRAW_CALLED:
                    gameEndDialog.description.text = 'Both players agreed to a draw!';
                    break;
            }
            break;
        case GameConstants.States.RESIGNED:
            gameEndDialog.title.text = `${isWhiteTurn ? 'White' : 'Black'} resigned!`;
            gameEndDialog.description.text = `${isWhiteTurn ? 'White' : 'Black'} resigned, ${
                isWhiteTurn ? 'black' : 'white'
            } is victorious.`;
    }
}

// Export buttons and dialog
export const GameEndDialog = {
    buttons: {
        viewBoardButton,
        resetGameButton,
    },
    dialog: gameEndDialog,
    updateGameEndDialogText,
};
