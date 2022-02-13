import { BOARD_OFFSET, BOARD_SIZE } from './boardConstants.js';

const GAME_END_DIALOG_WIDTH = 500; // Temp variable for later calculations
const GAME_END_DIALOG_HEIGHT = 300; // Temp variable for later calculations
export const DialogConstants = {
    GAME_END_DIALOG: {
        WIDTH: GAME_END_DIALOG_WIDTH,
        HEIGHT: GAME_END_DIALOG_HEIGHT,
        X_POS: BOARD_OFFSET + BOARD_SIZE / 2 - GAME_END_DIALOG_WIDTH / 2,
        Y_POS: BOARD_OFFSET + BOARD_SIZE / 2 - GAME_END_DIALOG_HEIGHT / 2,
    },
};
