import { BoardUtils } from './boardUtils.js';
import { SQUARE_SIZE } from '../constants/boardConstants.js';

// Draw square on canvas using placement
function drawSquare(p, file, rank, squareColor) {
    p.fill(p.color(squareColor));
    const position = BoardUtils.placementToPosition(file, rank);
    p.rect(position.x, position.y, SQUARE_SIZE, SQUARE_SIZE);
}

export const GraphicsUtils = {
    drawSquare,
};
