import { BOARD_SIZE, COLORS, FILE_SIZE, FILES, RANK_SIZE, RANKS } from './constants/boardConstants.js';
import { Board } from './models/board.js';
import { BoardUtils } from './utils/boardUtils.js';
import { CanvasUtils } from './utils/canvasUtils.js';
import { Rook } from './models/pieces/rook.js';
import { Knight } from './models/pieces/knight.js';
import { Bishop } from './models/pieces/bishop.js';
import { Queen } from './models/pieces/queen.js';

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

// Preload data
function preload() {
    // Load piece assets
    chessBoard.pieces.forEach((piece) => piece.loadAsset());

    // Load promotion piece assets
    [...Object.values(pawnPromotion.white), ...Object.values(pawnPromotion.dark)].forEach((piece) => piece.loadAsset());
}

// Canvas initialization function, called once at start
function setup() {
    // Set background for debug purposes
    background(color('#833030'));

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

// Draw board on canvas
function drawBoard() {
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

function drawSquare(file, rank, moveColor) {
    fill(color(moveColor));
    const position = BoardUtils.placementToPosition(file, rank);
    rect(position.x, position.y, RANK_SIZE, FILE_SIZE);
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

function drawPawnPromotion() {
    // Get pawn to promote
    const pawnToPromote = chessBoard.pawnToPromote;
    // Get pieces to promote to
    let promotionPieces = [
        (chessBoard.isWhiteTurn ? pawnPromotion.white : pawnPromotion.dark).rook,
        (chessBoard.isWhiteTurn ? pawnPromotion.white : pawnPromotion.dark).knight,
        (chessBoard.isWhiteTurn ? pawnPromotion.white : pawnPromotion.dark).bishop,
        (chessBoard.isWhiteTurn ? pawnPromotion.white : pawnPromotion.dark).queen,
    ];
    // Calculate file for box and pieces
    let file = chessBoard.isWhiteTurn ? pawnToPromote.file : promotionPieces.length;

    // Draw box
    const boxPosition = BoardUtils.placementToPosition(file, pawnToPromote.rank);
    const strokeWidth = 1;
    stroke('#222');
    strokeWeight(strokeWidth);
    fill(COLORS.LIGHT);
    rect(boxPosition.x, boxPosition.y + strokeWidth / 2, RANK_SIZE, FILE_SIZE * 4 - strokeWidth);

    // Set piece positions if not done yet
    if (!pawnPromotion.hasSetPiecePositions) {
        console.log(file, file, FILES);

        // Set piece positions
        promotionPieces.forEach((piece, index) => piece.setPlacement(Math.min(file, FILES) - index, pawnToPromote.rank));

        pawnPromotion.hasSetPiecePositions = true;
    }

    // Get position from pieces and set image position
    let position;
    promotionPieces.forEach((piece) => {
        position = BoardUtils.placementToPosition(piece.file, piece.rank);
        // Draw promotion pieces
        image(piece.asset, position.x, position.y, RANK_SIZE, FILE_SIZE);
        line(position.x, position.y, position.x + RANK_SIZE, position.y);
    });
}

// Mouse pressed listener
function mousePressed() {
    // Return if click is not on canvas position
    if (!CanvasUtils.isInCanvas(mouseX, mouseY)) return;

    // Check if is pawn promotion
    if (chessBoard.pawnToPromote && pawnPromotion.hasSetPiecePositions) {
        choosePromotionPiece();
    } else {
        movePiece();
    }
}

// Mouse released listener
function mouseReleased() {
    // Return if release is not on canvas position, is not moving piece or is promoting pawn
    if (!CanvasUtils.isInCanvas(mouseX, mouseY) || !chessBoard.movingPiece || chessBoard.pawnToPromote) return;

    // Get placement on board
    const newPlacement = BoardUtils.positionToPlacement(mouseX, mouseY);
    // Set piece to new placement
    chessBoard.movePiece(chessBoard.movingPiece, newPlacement.file, newPlacement.rank);
}

function choosePromotionPiece() {
    console.log('Choose promotion piece');
    // Get pawn to promote
    const pawnToPromote = chessBoard.pawnToPromote;

    // TODO: Check which piece to promote to (load image issues, don't reuse pawnPromotion object piece -> problems with duplicate placements, assets, ...)
    const queen = new Queen(pawnToPromote.file, pawnToPromote.rank, pawnToPromote.isWhite, false);
    queen.asset = pawnPromotion.white.queen;
    chessBoard.promotePawn(queen);
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
 *  * Pick Rook/Knight/Bishop/Queen when pawn reaches other side
 *  * Reset game on win/loss
 *  * Pick starting color
 *  * Chessboard markings (files, ranks)
 *  * Show captured pieces
 *  * Add FEN notation support (board initialization & moves)
 *  * Integrate in discord bot
 *  * Add AI
 */
