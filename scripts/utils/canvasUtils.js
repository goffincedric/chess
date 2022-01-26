import { CANVAS_SIZE, BOARD_SIZE, BOARD_OFFSET } from '../constants/boardConstants.js';

function isInCanvas(x, y) {
    return x >= 0 && y >= 0 && x < CANVAS_SIZE && y < CANVAS_SIZE;
}

function isInBoard(x, y) {
    console.log(x, y, x >= BOARD_OFFSET, y >= BOARD_OFFSET, x < BOARD_OFFSET + BOARD_SIZE, y < BOARD_OFFSET + BOARD_SIZE);
    return x >= BOARD_OFFSET && y >= BOARD_OFFSET && x < BOARD_OFFSET + BOARD_SIZE && y < BOARD_OFFSET + BOARD_SIZE;
}

export const CanvasUtils = {
    isInBoard,
    isInCanvas,
};
