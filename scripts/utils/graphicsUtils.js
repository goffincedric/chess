import { BoardUtils } from './boardUtils.js';
import { SQUARE_SIZE } from '../constants/boardConstants.js';

// Draw square on canvas using placement
function drawSquare(file, rank, squareColor) {
    fill(color(squareColor));
    const position = BoardUtils.placementToPosition(file, rank);
    rect(position.x, position.y, SQUARE_SIZE, SQUARE_SIZE);
}

export const GraphicsUtils = {
    drawSquare,
};
