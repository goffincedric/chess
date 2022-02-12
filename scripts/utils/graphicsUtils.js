import { BoardUtils } from './boardUtils.js';
import { BOARD_OFFSET, BOARD_SIZE, SQUARE_SIZE } from '../constants/boardConstants.js';

// Draw square on canvas using placement
function drawSquare(p, file, rank, squareColor, isFlipped = false) {
    p.fill(p.color(squareColor));
    const position = BoardUtils.placementToPosition(file, rank, isFlipped);
    p.rect(position.x, position.y, SQUARE_SIZE, SQUARE_SIZE);
}

function flipBoard(p) {
    p.push();
    p.translate(BOARD_OFFSET * 2 + BOARD_SIZE, BOARD_OFFSET * 2 + BOARD_SIZE);
    p.rotate(p.radians(180));
}

function flipLocally(p, xPos, yPos) {
    p.push();
    p.translate(xPos, yPos);
    p.rotate(p.radians(180));
}

function unFlip(p) {
    p.pop();
}

export const GraphicsUtils = {
    drawSquare,
    flipBoard,
    flipLocally,
    unFlip
};
