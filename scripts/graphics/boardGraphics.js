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
import { Placement } from '../models/placement.js';

// Adds file markings around board
function addFileMarkings(p, yPos, upsideDown = false) {
    let asciiOffset = 65;
    let marking, xPos;
    for (let i = 0; i < FILES; i++) {
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

// Adds rank markings around board
function addRankMarkings(p, xPos, upsideDown = false) {
    let marking, yPos;
    for (let i = 0; i < RANKS; i++) {
        marking = `${RANKS - i}`;
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

// Draw border around board
function drawBorder(p, isFlipped) {
    // Draw border
    p.noStroke();
    p.fill(p.color(COLORS.DARK));
    p.rect(0, 0, TOTAL_BOARD_SIZE, CANVAS_HEIGHT);

    // Set text color
    p.fill(p.color(COLORS.LIGHT));
    p.textSize(25);
    p.textAlign(p.CENTER, p.CENTER);

    // Check if markings need to be flipped
    if (isFlipped) GraphicsUtils.flipBoard(p);

    // Add file markings to borders
    addFileMarkings(p, BOARD_OFFSET / 2, true);
    addFileMarkings(p, BOARD_SIZE + BOARD_OFFSET * 1.5);

    // Add rank markings to border
    addRankMarkings(p, BOARD_OFFSET / 2);
    addRankMarkings(p, BOARD_SIZE + BOARD_OFFSET * 1.5, true);

    // Revert flip of markings
    if (isFlipped) GraphicsUtils.unFlip(p);
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

// Highlight a square on the board
function highlightSquares(p, placements, color, isFlipped) {
    if (isFlipped) GraphicsUtils.flipBoard(p);

    // Highlight each square on the board
    placements.forEach((placement) => GraphicsUtils.drawSquare(p, placement.file, placement.rank, color, isFlipped));

    if (isFlipped) GraphicsUtils.unFlip(p);
}

// Highlight a square on the board
function highlightLastMoveSquares(p, pastMoves, isFlipped) {
    // Highlight each from and to squares of last move on the board
    if (!pastMoves.length) return;
    const lastMove = pastMoves[chessBoard.pastMoves.length - 1];
    if (!lastMove?.movingPiece) return;
    const lastMovePlacements = [new Placement(lastMove.movingPiece.file, lastMove.movingPiece.rank), new Placement(lastMove.file, lastMove.rank)];

    if (isFlipped) GraphicsUtils.flipBoard(p);
    BoardGraphics.highlightSquares(p, lastMovePlacements, COLORS.MOVES.LAST_MOVE, isFlipped);
    if (isFlipped) GraphicsUtils.unFlip(p);
}

export const BoardGraphics = {
    drawBorder,
    drawBoard,
    highlightSquares,
    highlightLastMoveSquares
};
