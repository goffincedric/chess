import { BOARD_SIZE } from '../constants/boardConstants.js';

function isInCanvas(x, y) {
    return x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;
}

export const CanvasUtils = {
    isInCanvas,
};
