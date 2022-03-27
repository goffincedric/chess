import { BOARD_OFFSET, BOARD_SIZE } from './boardConstants.js';
import { BoundingBox } from '../models/boundingBox.js';
import { Position } from '../models/position.js';

// Temp variables for later calculations
const DEFAULT_WIDTH = 500;
const DEFAULT_BORDER_OFFSET = DEFAULT_WIDTH / 12;
const DEFAULT_HEIGHT = 300;
const DEFAULT_X_POS = BOARD_OFFSET + BOARD_SIZE / 2 - DEFAULT_WIDTH / 2;
const DEFAULT_Y_POS = BOARD_OFFSET + BOARD_SIZE / 2 - DEFAULT_HEIGHT / 2;
const DEFAULT_BUTTON_WIDTH = DEFAULT_BORDER_OFFSET * 4;
const DEFAULT_BUTTON_HEIGHT = 50;
const DEFAULT_BUTTON_X_OFFSET = DEFAULT_BORDER_OFFSET;
const DEFAULT_BUTTON_Y_OFFSET = DEFAULT_HEIGHT - DEFAULT_BUTTON_X_OFFSET - DEFAULT_BUTTON_HEIGHT;

export const DialogConstants = {
    DEFAULT_DIALOG: {
        BOUNDING_BOX: new BoundingBox(
            new Position(DEFAULT_X_POS, DEFAULT_Y_POS),
            new Position(DEFAULT_X_POS + DEFAULT_WIDTH, DEFAULT_Y_POS + DEFAULT_HEIGHT),
        ),
        BORDER_OFFSET: DEFAULT_BORDER_OFFSET,
        BUTTON_WIDTH: DEFAULT_BUTTON_WIDTH,
        BUTTON_HEIGHT: DEFAULT_BUTTON_HEIGHT,
        BUTTON_TEXT_SIZE: 20,
        BUTTONS_2: {
            BUTTON_1: {
                BOUNDING_BOX: new BoundingBox(
                    new Position(DEFAULT_X_POS + DEFAULT_BUTTON_X_OFFSET, DEFAULT_Y_POS + DEFAULT_BUTTON_Y_OFFSET),
                    new Position(
                        DEFAULT_X_POS + DEFAULT_BUTTON_X_OFFSET + DEFAULT_BUTTON_WIDTH,
                        DEFAULT_Y_POS + DEFAULT_BUTTON_Y_OFFSET + DEFAULT_BUTTON_HEIGHT,
                    ),
                ),
            },
            BUTTON_2: {
                BOUNDING_BOX: new BoundingBox(
                    new Position(
                        DEFAULT_X_POS + DEFAULT_BUTTON_X_OFFSET * 3 + DEFAULT_BUTTON_WIDTH,
                        DEFAULT_Y_POS + DEFAULT_BUTTON_Y_OFFSET,
                    ),
                    new Position(
                        DEFAULT_X_POS + DEFAULT_BUTTON_X_OFFSET * 3 + DEFAULT_BUTTON_WIDTH * 2,
                        DEFAULT_Y_POS + DEFAULT_BUTTON_Y_OFFSET + DEFAULT_BUTTON_HEIGHT,
                    ),
                ),
            },
        },
        BUTTONS_1: {
            BUTTON_1: {
                BOUNDING_BOX: new BoundingBox(
                    new Position(DEFAULT_X_POS + DEFAULT_WIDTH / 2 - DEFAULT_BUTTON_WIDTH / 2, DEFAULT_Y_POS + DEFAULT_BUTTON_Y_OFFSET),
                    new Position(
                        DEFAULT_X_POS + DEFAULT_WIDTH / 2 - DEFAULT_BUTTON_WIDTH / 2 + DEFAULT_BUTTON_WIDTH,
                        DEFAULT_Y_POS + DEFAULT_BUTTON_Y_OFFSET + DEFAULT_BUTTON_HEIGHT,
                    ),
                ),
            },
        },
    },
};
