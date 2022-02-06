import { COLORS, GAME_STATES } from '../../constants/boardConstants.js';
import { CanvasUtils } from '../../utils/canvasUtils.js';
import { GAME_END_DIALOG } from '../../constants/dialogConstants.js';

// Add listeners for dialogButtons
const dialogButtonListeners = [];

// Draw end of game dialog
function drawGameEndDialog(p, gameState, isWhiteTurn) {
    // Define what text to show
    let title, description;
    switch (gameState) {
        case GAME_STATES.CHECKMATE:
            title = 'Checkmate!';
            description = `Checkmate, ${isWhiteTurn ? 'black' : 'white'} is victorious.`;
            break;
        case GAME_STATES.DRAW_STALEMATE:
        case GAME_STATES.DRAW_INSUFFICIENT_PIECES:
            title = "It's a draw!";
            if (gameState === GAME_STATES.DRAW_STALEMATE)
                description = `Stalemate, ${isWhiteTurn ? 'black' : 'white'} can't play any more moves.`;
            else description = "Insufficient pieces to finish the game, it's a draw!";
            break;
        case GAME_STATES.RESIGNED:
            title = `${isWhiteTurn ? 'White' : 'Black' } resigned!`;
            description = `${isWhiteTurn ? 'White' : 'Black'} resigned, ${isWhiteTurn ? 'black' : 'white'} is victorious.`;
    }

    // Draw box
    p.strokeWeight(2);
    p.stroke(p.color(COLORS.DARK));
    p.fill(p.color(COLORS.LIGHTER));
    p.rect(GAME_END_DIALOG.X_POS, GAME_END_DIALOG.Y_POS, GAME_END_DIALOG.WIDTH, GAME_END_DIALOG.HEIGHT);

    // Add title to box
    let titleYOffset = 65;
    p.fill(p.color(COLORS.DARK));
    p.strokeWeight(0);
    p.textSize(32);
    p.textAlign(p.CENTER, p.CENTER);
    p.text(title, GAME_END_DIALOG.X_POS + GAME_END_DIALOG.WIDTH / 2, GAME_END_DIALOG.Y_POS + titleYOffset);

    // Add description to box
    let descriptionYOffset = titleYOffset + 50;
    let descriptionXOffset = GAME_END_DIALOG.WIDTH / 9;
    let textHeight = GAME_END_DIALOG.HEIGHT / 4;
    let textWidth = descriptionXOffset * 7;
    p.stroke(p.color(DARKEST));
    p.textSize(24);
    p.textAlign(p.CENTER, p.TOP);
    p.text(description, GAME_END_DIALOG.X_POS + descriptionXOffset, GAME_END_DIALOG.Y_POS + descriptionYOffset, textWidth, textHeight);

    // Add buttons to box
    let borderOffset = GAME_END_DIALOG.WIDTH / 12;
    let buttonHeight = 50;
    let buttonWidth = borderOffset * 4;
    let buttonXOffset = borderOffset;
    let buttonYOffset = GAME_END_DIALOG.HEIGHT - buttonXOffset - buttonHeight;
    function addButton(x, y, buttonText, clickListener) {
        let x1 = x;
        let y1 = y;
        let x2 = x + buttonWidth;
        let y2 = y + buttonHeight;

        // Draw box
        p.strokeWeight(2);
        p.stroke(p.color(COLORS.DARK));
        if (CanvasUtils.isPositionBetweenCoordinates(mouseX, mouseY, x1, y1, x2, y2)) {
            p.fill(p.color(COLORS.BUTTON_HOVER));
        } else {
            p.fill(p.color(COLORS.LIGHT));
        }
        p.rect(x1, y1, buttonWidth, buttonHeight);

        // Draw text
        p.noStroke();
        p.fill(p.color(COLORS.DARK));
        p.textAlign(p.CENTER, p.CENTER);
        p.text(buttonText, x + buttonWidth / 2, y + buttonHeight / 2);

        // Add button to dialogListener
        const foundListener = dialogButtonListeners.find((listener) => listener.id === buttonText);
        if (!foundListener) {
            dialogButtonListeners.push({
                id: buttonText,
                x1,
                y1,
                x2,
                y2,
                click: () => {
                    // Execute listener
                    clickListener();

                    // Clear listeners
                    dialogButtonListeners.splice(0);
                },
            });
        }
    }
    // View board button
    let xPos = GAME_END_DIALOG.X_POS + buttonXOffset;
    let yPos = GAME_END_DIALOG.Y_POS + buttonYOffset;
    addButton(xPos, yPos, 'View board', GameEndDialog.viewBoardListener);
    // Reset game button
    xPos = GAME_END_DIALOG.X_POS + buttonXOffset * 3 + buttonWidth;
    addButton(xPos, yPos, 'Reset game', GameEndDialog.resetGameListener);
}

function checkDialogActions(p) {
    // Look for dialog button click listeners
    dialogButtonListeners.forEach((listener) => {
        if (CanvasUtils.isPositionBetweenCoordinates(p.mouseX, p.mouseY, listener.x1, listener.y1, listener.x2, listener.y2)) {
            listener.click();
        }
    });
}

export const GameEndDialog = {
    drawGameEndDialog,
    checkDialogActions,

    // Set default listeners
    viewBoardListener: () => {
        throw new Error('No GameEndDialog.viewBoardListener listener was supplied');
    },
    resetGameListener: () => {
        throw new Error('No EndGameDialog.resetGameListener listener was supplied');
    },
};
