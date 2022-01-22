import { BOARD_SIZE, COLORS, FILE_SIZE, FILES, RANK_SIZE, RANKS } from './constants/boardConstants.js';
import { Board } from './models/board.js';
import { BoardUtils } from './utils/boardUtils.js';
import { CanvasUtils } from './utils/canvasUtils.js';

// Initialize board
let chessBoard = new Board();

// Preload data
function preload() {
    // Load piece assets
    chessBoard.pieces.forEach((piece) => piece.loadAsset());
}

// Canvas initialization function, called once at start
function setup() {
    // Set background for debug purposes
    background(color('#833030'))

    // Create canvas element to draw on
    createCanvas(BOARD_SIZE, BOARD_SIZE);

    // Draw chess board
    drawBoard();

    // Draw pieces
    drawPieces();
}

// Canvas update function
function draw() {
    // Clear canvas
    clear();

    // Draw chess board
    drawBoard();

    // Draw possible moves
    drawMoves();

    // Draw pieces
    drawPieces();
}

// Draw board on canvas
function drawBoard() {
    noStroke();
    for (let file = 1; file <= FILES; file++) {
        for (let rank = 1; rank <= RANKS; rank++) {
            let rectColor = color((file + rank) % 2 !== 0 ? COLORS.LIGHT : COLORS.DARK);
            fill(rectColor);
            const position = BoardUtils.placementToPosition(file, rank);
            rect(position.x, position.y, RANK_SIZE, FILE_SIZE);
        }
    }
}

// Draw potential moves on board for moving piece
function drawMoves() {
    if (chessBoard.movingPiece) {
        try {
            // Color possible moves
            chessBoard.possibleMoves.forEach((move) => {
                // Get piece if present
                let piece = chessBoard.getPieceByPlacement(move.file, move.rank);
                let rectColor;
                // Set color depending on if there is no piece or it is an enemy piece
                if (!piece) {
                    rectColor = color(COLORS.MOVES.EMPTY);
                } else if (piece.isWhite !== chessBoard.movingPiece.isWhite) {
                    rectColor = color(COLORS.MOVES.TAKE_PIECE);
                }

                // If color was set, set square to that color
                if (rectColor) {
                    fill(rectColor);
                    const position = BoardUtils.placementToPosition(move.file, move.rank);
                    rect(position.x, position.y, RANK_SIZE, FILE_SIZE);
                }
            });

            // Color current square
            fill(color(COLORS.MOVES.CURRENT));
            const currenPosition = BoardUtils.placementToPosition(chessBoard.movingPiece.file, chessBoard.movingPiece.rank);
            rect(currenPosition.x, currenPosition.y, RANK_SIZE, FILE_SIZE);
        } catch (e) {
            console.warn(`Couldn't generate possible moves for piece ${chessBoard.movingPiece.constructor.name}`, e);
        }
    }
}

// Draw pieces on board
function drawPieces() {
    chessBoard.pieces.forEach((piece) => {
        if (piece !== chessBoard.movingPiece) {
            let position = piece.getPosition();
            image(piece.asset, position.x, position.y, RANK_SIZE, FILE_SIZE);
        }
    });
    if (chessBoard.movingPiece) {
        image(chessBoard.movingPiece.asset, mouseX - FILE_SIZE / 2, mouseY - RANK_SIZE / 2, RANK_SIZE, FILE_SIZE);
    }
}

// Mouse pressed listener
function mousePressed() {
    if (CanvasUtils.isInCanvas(mouseX, mouseY)) {
        // Check if position has piece
        const piece = chessBoard.getPieceByPosition(mouseX, mouseY);
        if (piece && piece.isWhite === chessBoard.isWhiteTurn) {
            chessBoard.setMovingPiece(piece);
        }
    }
}

// Mouse released listener
function mouseReleased() {
    if (CanvasUtils.isInCanvas(mouseX, mouseY) && chessBoard.movingPiece) {
        // Get placement on board
        const newPlacement = BoardUtils.positionToPlacement(mouseX, mouseY);
        // Set piece to new placement
        chessBoard.movePiece(chessBoard.movingPiece, newPlacement.file, newPlacement.rank);
    }
}

// Set global functions
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.mouseReleased = mouseReleased;
window.mousePressed = mousePressed;
