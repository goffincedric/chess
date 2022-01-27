import { CANVAS_SIZE, BOARD_SIZE, BOARD_OFFSET } from '../constants/boardConstants.js';

function isInCanvas(x, y) {
    return isPositionBetweenCoordinates(x, y, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function isInBoard(x, y) {
    return isPositionBetweenCoordinates(x, y, BOARD_OFFSET, BOARD_OFFSET, BOARD_OFFSET + BOARD_SIZE, BOARD_OFFSET + BOARD_SIZE);
}

function isPositionBetweenCoordinates(xPos, yPos, x1, y1, x2, y2) {
    let smallestX = Math.min(x1, x2);
    let smallestY = Math.min(y1, y2);
    let largestX = Math.max(x1, x2);
    let largestY = Math.max(y1, y2);
    return xPos >= smallestX && yPos >= smallestY && xPos < largestX && yPos < largestY;
}

export const CanvasUtils = {
    isInBoard,
    isInCanvas,
    isPositionBetweenCoordinates,
};
