import {
    BOARD_BORDER_STROKE_WIDTH,
    BOARD_BORDER_WIDTH,
    BOARD_OFFSET,
    BOARD_SIZE,
    CANVAS_SIZE,
    COLORS,
    FILES,
    RANKS,
    SQUARE_SIZE,
} from './constants/boardConstants.js';
import { Board } from './models/board.js';
import { BoardUtils } from './utils/boardUtils.js';
import { CanvasUtils } from './utils/canvasUtils.js';
import { Rook } from './models/pieces/rook.js';
import { Knight } from './models/pieces/knight.js';
import { Bishop } from './models/pieces/bishop.js';
import { Queen } from './models/pieces/queen.js';
import { AssetUtils } from './utils/assetUtils.js';
import { Pawn } from './models/pieces/pawn.js';
import { King } from './models/pieces/king.js';

// Initialize board
let chessBoard = new Board();

// Initialize pawn promotion object
let pawnPromotion = {
    hasSetPiecePositions: false,
    white: {
        rook: new Rook(1, 1, true, false),
        knight: new Knight(1, 1, true, false),
        bishop: new Bishop(1, 1, true, false),
        queen: new Queen(1, 1, true, false),
    },
    dark: {
        rook: new Rook(1, 1, false, false),
        knight: new Knight(1, 1, false, false),
        bishop: new Bishop(1, 1, false, false),
        queen: new Queen(1, 1, false, false),
    },
};

/**
 * P5 hooks
 */
// Preload data
function preload() {
    // Load piece assets and store in AssetUtils
    const assetUrls = [
        new Pawn(1, 1, true).getAssetUrl(),
        new Pawn(1, 1, false).getAssetUrl(),
        new Rook(1, 1, true).getAssetUrl(),
        new Rook(1, 1, false).getAssetUrl(),
        new Knight(1, 1, true).getAssetUrl(),
        new Knight(1, 1, false).getAssetUrl(),
        new Bishop(1, 1, true).getAssetUrl(),
        new Bishop(1, 1, false).getAssetUrl(),
        new Queen(1, 1, true).getAssetUrl(),
        new Queen(1, 1, false).getAssetUrl(),
        new King(1, 1, true).getAssetUrl(),
        new King(1, 1, false).getAssetUrl(),
    ];
    assetUrls.forEach((url) => {
        AssetUtils.storeAsset(url, loadImage(url));
    });
}

// Canvas initialization function, called once at start
function setup() {
    // Set background for debug purposes
    background(color('#833030'));

    // Create canvas element to draw on
    createCanvas(CANVAS_SIZE, CANVAS_SIZE);

    // Draw border
    drawBorder();

    // Draw chess board
    drawBoard();

    // Draw pieces
    drawPieces();
}

// Canvas update function
function draw() {
    // Clear canvas
    clear();

    // Draw border
    drawBorder();

    // Draw chess board
    drawBoard();

    // Draw enemy moves
    // drawEnemyMoves();

    // Draw possible moves
    drawMoves();

    // Draw pieces
    drawPieces();

    // Draw pawn promotion screen
    if (chessBoard.pawnToPromote) {
        drawPawnPromotion();
    }
}

/**
 * Functions that draw on canvas
 */
// Draw border around board
function drawBorder() {
    // Draw border
    noStroke();
    fill(color(COLORS.DARK));
    rect(0, 0, BOARD_OFFSET * 2 + BOARD_SIZE, CANVAS_SIZE);

    // Set text color
    fill(color(COLORS.LIGHT));
    textSize(25);
    textAlign(CENTER, CENTER);

    // Add file markings to border
    function addFileMarkings(xOffset, upsideDown = false) {
        for (let i = 0; i < FILES; i++) {
            if (upsideDown) {
                push();
                translate(xOffset, BOARD_OFFSET + SQUARE_SIZE * i + SQUARE_SIZE / 2);
                rotate(radians(180));
                text(`${FILES - i}`, 0, 0);
                pop();
            } else {
                text(`${FILES - i}`, xOffset, BOARD_OFFSET + SQUARE_SIZE * i + SQUARE_SIZE / 2);
            }
        }
    }
    addFileMarkings(BOARD_OFFSET / 2);
    addFileMarkings(BOARD_SIZE + BOARD_OFFSET * 1.5, true);
    // Add rank markings to borders
    function addRankMarkings(yOffset, upsideDown = false) {
        let asciiOffset = 65;
        for (let i = 0; i < RANKS; i++) {
            if (upsideDown) {
                push();
                translate(BOARD_OFFSET + SQUARE_SIZE * i + SQUARE_SIZE / 2, yOffset);
                rotate(radians(180));
                text(String.fromCharCode(i + asciiOffset), 0, 0);
                pop();
            } else {
                text(String.fromCharCode(i + asciiOffset), BOARD_OFFSET + SQUARE_SIZE * i + SQUARE_SIZE / 2, yOffset);
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
    rect(BOARD_BORDER_WIDTH, BOARD_BORDER_WIDTH, rectSize, rectSize);

    // Draw squares on board
    noStroke();
    for (let file = 1; file <= FILES; file++) {
        for (let rank = 1; rank <= RANKS; rank++) {
            // Decide if is light or dark square
            let rectColor = (file + rank) % 2 !== 0 ? COLORS.LIGHT : COLORS.DARK;
            // Draw square
            drawSquare(file, rank, rectColor);
        }
    }
}

function drawEnemyMoves() {
    if (chessBoard.enemyAttacks?.length) {
        // Color possible moves
        chessBoard.enemyAttacks.reduce((drawnMoves, move) => {
            // Check if move has not been drawn on board yet
            if (!drawnMoves.some((drawnMove) => drawnMove.file === move.file && drawnMove.rank === move.rank)) {
                // Draw square for move
                drawSquare(move.file, move.rank, COLORS.MOVES.ENEMY);
                // Add move to drawn moves
                drawnMoves.push(move);
            }
            return drawnMoves;
        }, []);
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
                    drawSquare(move.file, move.rank, rectColor);
                }
            });

            // Color current square
            drawSquare(chessBoard.movingPiece.file, chessBoard.movingPiece.rank, COLORS.MOVES.CURRENT);
        } catch (e) {
            console.warn(`Couldn't generate possible moves for piece ${chessBoard.movingPiece.constructor.name}`, e);
        }
    }
}

// Draw square on canvas using placement
function drawSquare(file, rank, squareColor) {
    fill(color(squareColor));
    const position = BoardUtils.placementToPosition(file, rank);
    rect(position.x, position.y, SQUARE_SIZE, SQUARE_SIZE);
}

// Draw pieces on board
function drawPieces() {
    chessBoard.pieces.forEach((piece) => {
        if (piece !== chessBoard.movingPiece) {
            let position = piece.getPosition();
            const asset = AssetUtils.getAsset(piece.getAssetUrl());
            image(asset, position.x, position.y, SQUARE_SIZE, SQUARE_SIZE);
        }
    });
    if (chessBoard.movingPiece) {
        const asset = AssetUtils.getAsset(chessBoard.movingPiece.getAssetUrl());
        image(asset, mouseX - SQUARE_SIZE / 2, mouseY - SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
    }
}

// Draw pawn promotion container
function drawPawnPromotion() {
    // Get pawn to promote
    const pawnToPromote = chessBoard.pawnToPromote;
    // Get pieces to promote to
    let promotionPieces = Object.values(chessBoard.isWhiteTurn ? pawnPromotion.white : pawnPromotion.dark);
    // Calculate file for box and pieces
    let file = chessBoard.isWhiteTurn ? pawnToPromote.file : promotionPieces.length;

    // Draw box
    const boxPosition = BoardUtils.placementToPosition(file, pawnToPromote.rank);
    const strokeWidth = 1;
    stroke('#222');
    strokeWeight(strokeWidth);
    fill(COLORS.LIGHT);
    rect(boxPosition.x, boxPosition.y + strokeWidth / 2, SQUARE_SIZE, SQUARE_SIZE * 4 - strokeWidth);

    // Set piece positions if not done yet
    if (!pawnPromotion.hasSetPiecePositions) {
        // Set piece positions
        promotionPieces.forEach((piece, index) => piece.setPlacement(Math.min(file, FILES) - index, pawnToPromote.rank));

        pawnPromotion.hasSetPiecePositions = true;
    }

    // Get position from pieces and set image position
    let position;
    promotionPieces.forEach((piece) => {
        position = BoardUtils.placementToPosition(piece.file, piece.rank);
        // Draw promotion pieces
        const asset = AssetUtils.getAsset(piece.getAssetUrl());
        image(asset, position.x, position.y, SQUARE_SIZE, SQUARE_SIZE);
        line(position.x, position.y, position.x + SQUARE_SIZE, position.y);
    });
}

/**
 * Event listeners
 */
// Mouse pressed listener
function mousePressed() {
    // Return if click is not on board position
    if (!CanvasUtils.isInBoard(mouseX, mouseY)) return;

    // Check if is pawn promotion
    if (chessBoard.pawnToPromote && pawnPromotion.hasSetPiecePositions) {
        choosePromotionPiece();
    } else {
        movePiece();
    }
}

// Mouse released listener
function mouseReleased() {
    // Reset moving piece if is released outside board position
    if (!CanvasUtils.isInBoard(mouseX, mouseY)) {
        chessBoard.clearMovingPiece();
    }

    // Return if is not moving piece or is promoting pawn
    if (!chessBoard.movingPiece || chessBoard.pawnToPromote) return;

    // Get placement on board
    const newPlacement = BoardUtils.positionToPlacement(mouseX, mouseY);
    // Set piece to new placement
    chessBoard.movePiece(chessBoard.movingPiece, newPlacement.file, newPlacement.rank);
}

function choosePromotionPiece() {
    // Get pawn to promote
    const pawnToPromote = chessBoard.pawnToPromote;

    // Get piece to promote to
    const placement = BoardUtils.positionToPlacement(mouseX, mouseY);
    const chosenPiece = Object.values(chessBoard.isWhiteTurn ? pawnPromotion.white : pawnPromotion.dark).find(
        (piece) => piece.file === placement.file && piece.rank === placement.rank,
    );
    if (chosenPiece) {
        // Create new instance of chosen piece
        const promotedPiece = new chosenPiece.constructor(pawnToPromote.file, pawnToPromote.rank, pawnToPromote.isWhite, false);

        // Promote piece
        chessBoard.promotePawn(promotedPiece);

        // Set promotion pieces position flag to false
        pawnPromotion.hasSetPiecePositions = false;
    }
}

function movePiece() {
    // Check if position has piece
    const piece = chessBoard.getPieceByPosition(mouseX, mouseY);
    if (piece && piece.isWhite === chessBoard.isWhiteTurn) {
        chessBoard.setMovingPiece(piece);
    }
}

// Set global functions
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.mouseReleased = mouseReleased;
window.mousePressed = mousePressed;

/**
 * TODO:
 *  * Reset game on win/loss
 *  * Pick starting color
 *  * Chessboard markings (files, ranks)
 *  * Show captured pieces
 *  * Add FEN notation support (board initialization & moves)
 *  * Integrate in discord bot
 *  * Add AI
 */
