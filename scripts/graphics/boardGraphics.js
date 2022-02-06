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
function drawBorder(p) {
    // Draw border
    p.noStroke();
    p.fill(p.color(COLORS.DARK));
    p.rect(0, 0, TOTAL_BOARD_SIZE, CANVAS_HEIGHT);

    // Set text color
    p.fill(p.color(COLORS.LIGHT));
    p.textSize(25);
    p.textAlign(p.CENTER, p.CENTER);

    // Add file markings to border
    function addFileMarkings(xPos, upsideDown = false) {
        let marking, yPos;
        for (let i = 0; i < FILES; i++) {
            marking = `${FILES - i}`;
            yPos = BOARD_OFFSET + SQUARE_SIZE * i + SQUARE_SIZE / 2;
            if (upsideDown) {
                p.push();
                p.translate(xPos, yPos);
                p.rotate(p.radians(180));
                p.text(marking, 0, 0);
                p.pop();
            } else {
                p.text(marking, xPos, yPos);
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
                p.push();
                p.translate(xPos, yPos);
                p.rotate(p.radians(180));
                p.text(marking, 0, 0);
                p.pop();
            } else {
                p.text(marking, xPos, yPos);
            }
        }
    }

    addRankMarkings(BOARD_OFFSET / 2, true);
    addRankMarkings(BOARD_SIZE + BOARD_OFFSET * 1.5);
}

// Draw board on canvas
function drawBoard(p) {
    p.noStroke();

    // Draw small stroke around board
    const rectSize = BOARD_BORDER_STROKE_WIDTH * 2 + BOARD_SIZE;
    p.fill(p.color(COLORS.LIGHT));
    p.rect(BOARD_BORDER_WIDTH, BOARD_BORDER_HEIGHT, rectSize, rectSize);

    // Draw squares on board
    p.noStroke();
    for (let file = 1; file <= FILES; file++) {
        for (let rank = 1; rank <= RANKS; rank++) {
            // Decide if is light or dark square
            let rectColor = BoardUtils.isLightSquare(file, rank) ? COLORS.LIGHT : COLORS.DARK;
            // Draw square
            GraphicsUtils.drawSquare(p, file, rank, rectColor);
        }
    }
}

export const BoardGraphics = {
    drawBorder,
    drawBoard,
};
