import { DialogButton } from '../models/dialog/dialogButton.js';
import { BoundingBox } from '../models/boundingBox.js';
import { Dialog } from '../models/dialog/dialog.js';
import { DialogConstants } from '../constants/dialogConstants.js';
import { Position } from '../models/position.js';
import { FunctionUtils } from '../utils/functionUtils.js';
import { GAME_STATES } from '../constants/boardConstants.js';

// Create global gameEndDialog button constants
let borderOffset = DialogConstants.GAME_END_DIALOG.WIDTH / 12;
let buttonHeight = 50;
let buttonWidth = borderOffset * 4;
let buttonXOffset = borderOffset;
let buttonYOffset = DialogConstants.GAME_END_DIALOG.HEIGHT - buttonXOffset - buttonHeight;

// Create view board button
const viewBoardButtonPosition = {
    x1: DialogConstants.GAME_END_DIALOG.X_POS + buttonXOffset,
    y1: DialogConstants.GAME_END_DIALOG.Y_POS + buttonYOffset,
};
const viewBoardButton = new DialogButton(
    'View board',
    new BoundingBox(
        new Position(viewBoardButtonPosition.x1, viewBoardButtonPosition.y1),
        new Position(viewBoardButtonPosition.x1 + buttonWidth, viewBoardButtonPosition.y1 + buttonHeight),
    ),
    FunctionUtils.asyncNoOp,
);

// Create reset game button
const resetGameButtonPosition = {
    x1: DialogConstants.GAME_END_DIALOG.X_POS + buttonXOffset * 3 + buttonWidth,
    y1: viewBoardButtonPosition.y1,
};
const resetGameButton = new DialogButton(
    'Reset game',
    new BoundingBox(
        new Position(resetGameButtonPosition.x1, resetGameButtonPosition.y1),
        new Position(resetGameButtonPosition.x1 + buttonWidth, resetGameButtonPosition.y1 + buttonHeight),
    ),
    FunctionUtils.asyncNoOp,
);

// Create game end dialog
const gameEndDialog = new Dialog(
    'Title_placeholder',
    'Description_placeholder',
    new BoundingBox(
        new Position(DialogConstants.GAME_END_DIALOG.X_POS, DialogConstants.GAME_END_DIALOG.Y_POS),
        new Position(
            DialogConstants.GAME_END_DIALOG.X_POS + DialogConstants.GAME_END_DIALOG.WIDTH,
            DialogConstants.GAME_END_DIALOG.Y_POS + DialogConstants.GAME_END_DIALOG.HEIGHT,
        ),
    ),
    [viewBoardButton, resetGameButton],
);

function updateGameEndDialogText(gameState, isWhiteTurn) {
    // Define what text to show
    switch (gameState) {
        case GAME_STATES.CHECKMATE:
            gameEndDialog.title = 'Checkmate!';
            gameEndDialog.description = `Checkmate, ${isWhiteTurn ? 'black' : 'white'} is victorious.`;
            break;
        case GAME_STATES.DRAW_STALEMATE:
        case GAME_STATES.DRAW_INSUFFICIENT_PIECES:
            gameEndDialog.title = "It's a draw!";
            if (gameState === GAME_STATES.DRAW_STALEMATE)
                gameEndDialog.description = `Stalemate, ${isWhiteTurn ? 'black' : 'white'} can't play any more moves.`;
            else gameEndDialog.description = "Insufficient pieces to finish the game, it's a draw!";
            break;
        case GAME_STATES.RESIGNED:
            gameEndDialog.title = `${isWhiteTurn ? 'White' : 'Black'} resigned!`;
            gameEndDialog.description = `${isWhiteTurn ? 'White' : 'Black'} resigned, ${isWhiteTurn ? 'black' : 'white'} is victorious.`;
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
