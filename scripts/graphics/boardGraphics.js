import {
    BOARD_BORDER_HEIGHT,
    BOARD_BORDER_STROKE_WIDTH,
    BOARD_BORDER_WIDTH,
    BOARD_OFFSET,
    BOARD_SIZE,
    COLORS,
    FILES,
    RANKS,
    SQUARE_SIZE,
    TOTAL_BOARD_SIZE,
} from '../constants/boardConstants.js';
import { BoardUtils } from '../utils/boardUtils.js';
import { GraphicsUtils } from '../utils/graphicsUtils.js';
import { CANVAS_HEIGHT } from '../constants/canvasConstants.js';

// Draw border around board
function drawBorder() {
    // Draw border
    noStroke();
    fill(color(COLORS.DARK));
    rect(0, 0, TOTAL_BOARD_SIZE, CANVAS_HEIGHT);

    // Set text color
    fill(color(COLORS.LIGHT));
    textSize(25);
    textAlign(CENTER, CENTER);

    // Add file markings to border
    function addFileMarkings(xPos, upsideDown = false) {
        let marking, yPos;
        for (let i = 0; i < FILES; i++) {
            marking = `${FILES - i}`;
            yPos = BOARD_OFFSET + SQUARE_SIZE * i + SQUARE_SIZE / 2;
            if (upsideDown) {
                push();
                translate(xPos, yPos);
                rotate(radians(180));
                text(marking, 0, 0);
                pop();
            } else {
                text(marking, xPos, yPos);
            }
        }
    }

    addFileMarkings(BOARD_OFFSET / 2);
    addFileMarkings(BOARD_SIZE + BOARD_OFFSET * 1.5, true);

    // Add rank markings to borders
    function addRankMarkings(yPos, upsideDown = false) {
        let asciiOffset = 65;
        let marking, xPos;
        for (let i = 0; i < RANKS; i++) {
            marking = String.fromCharCode(i + asciiOffset);
            xPos = BOARD_OFFSET + SQUARE_SIZE * i + SQUARE_SIZE / 2;
            if (upsideDown) {
                push();
                translate(xPos, yPos);
                rotate(radians(180));
                text(marking, 0, 0);
                pop();
            } else {
                text(marking, xPos, yPos);
            }
        }
    }

    addRankMarkings(BOARD_OFFSET / 2, true);
    addRankMarkings(BOARD_SIZE + BOARD_OFFSET * 1.5);
}

// Draw board on canvas
function drawBoard() {
    noStroke();

    // Draw small stroke around board
    const rectSize = BOARD_BORDER_STROKE_WIDTH * 2 + BOARD_SIZE;
    fill(color(COLORS.LIGHT));
    rect(BOARD_BORDER_WIDTH, BOARD_BORDER_HEIGHT, rectSize, rectSize);

    // Draw squares on board
    noStroke();
    for (let file = 1; file <= FILES; file++) {
        for (let rank = 1; rank <= RANKS; rank++) {
            // Decide if is light or dark square
            let rectColor = BoardUtils.isLightSquare(file, rank) ? COLORS.LIGHT : COLORS.DARK;
            // Draw square
            GraphicsUtils.drawSquare(file, rank, rectColor);
        }
    }
}

export const BoardGraphics = {
    drawBorder,
    drawBoard,
};
