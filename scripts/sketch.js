import {
    BOARD_BORDER_STROKE_WIDTH,
    BOARD_BORDER_WIDTH,
    BOARD_OFFSET,
    BOARD_SIZE,
    CANVAS_SIZE,
    COLORS,
    FILES,
    GAME_END_DIALOG,
    GAMESTATES,
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
import { FENUtils } from './utils/fenUtils.js';

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

// Add listeners for dialogButtons
const dialogButtonListeners = [];

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
    background(color(COLORS.DEBUG));

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
    drawEnemyMoves();

    // Draw possible moves
    drawMoves();

    // Draw pieces
    drawPieces();

    // Draw pawn promotion screen
    if (chessBoard.pawnToPromote) {
        drawPawnPromotion();
    }

    if (![GAMESTATES.PLAYING, GAMESTATES.OBSERVING].includes(chessBoard.gameState)) {
        drawGameEndDialog();
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
    rect(BOARD_BORDER_WIDTH, BOARD_BORDER_WIDTH, rectSize, rectSize);

    // Draw squares on board
    noStroke();
    for (let file = 1; file <= FILES; file++) {
        for (let rank = 1; rank <= RANKS; rank++) {
            // Decide if is light or dark square
            let rectColor = BoardUtils.isLightSquare(file, rank) ? COLORS.LIGHT : COLORS.DARK;
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
            chessBoard.movingPieceMoves.forEach((move) => {
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
    stroke(color(COLORS.DARKER));
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

// Draw End of game dialog
function drawGameEndDialog() {
    // Define what text to show
    let title, description;
    switch (chessBoard.gameState) {
        case GAMESTATES.CHECKMATE:
            title = 'Checkmate!';
            description = `Checkmate, ${chessBoard.isWhiteTurn ? 'black' : 'white'} wins.`;
            break;
        case GAMESTATES.DRAW_STALEMATE:
        case GAMESTATES.DRAW_INSUFFICIENT_PIECES:
            title = "It's a draw!";
            if (chessBoard.gameState === GAMESTATES.DRAW_STALEMATE)
                description = `Stalemate, ${chessBoard.isWhiteTurn ? 'black' : 'white'} can't play any more moves.`;
            else description = "Insufficient pieces to finish the game, it's a draw!";
            break;
    }

    // Draw box
    strokeWeight(2);
    stroke(color(COLORS.DARK));
    fill(color(COLORS.LIGHTER));
    rect(GAME_END_DIALOG.X_POS, GAME_END_DIALOG.Y_POS, GAME_END_DIALOG.WIDTH, GAME_END_DIALOG.HEIGHT);

    // Add title to box
    let titleYOffset = 65;
    fill(color(COLORS.DARK));
    strokeWeight(0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(title, GAME_END_DIALOG.X_POS + GAME_END_DIALOG.WIDTH / 2, GAME_END_DIALOG.Y_POS + titleYOffset);

    // Add description to bx
    let descriptionYOffset = titleYOffset + 50;
    let descriptionXOffset = GAME_END_DIALOG.WIDTH / 9;
    let textHeight = GAME_END_DIALOG.HEIGHT / 4;
    let textWidth = descriptionXOffset * 7;
    stroke(color(DARKEST));
    textSize(24);
    textAlign(CENTER, TOP);
    text(description, GAME_END_DIALOG.X_POS + descriptionXOffset, GAME_END_DIALOG.Y_POS + descriptionYOffset, textWidth, textHeight);

    // Add buttons to box
    let borderOffset = GAME_END_DIALOG.WIDTH / 12;
    let buttonHeight = 50;
    let buttonWidth = borderOffset * 4;
    let buttonXOffset = borderOffset;
    let buttonYOffset = GAME_END_DIALOG.HEIGHT - buttonXOffset - buttonHeight;
    function addButton(x, y, buttonText, clickListener) {
        let x1 = x;
        let y1 = y;
        let x2 = x + buttonWidth;
        let y2 = y + buttonHeight;

        // Draw box
        strokeWeight(2);
        stroke(color(COLORS.DARK));
        if (CanvasUtils.isPositionBetweenCoordinates(mouseX, mouseY, x1, y1, x2, y2)) {
            fill(color(COLORS.BUTTON_HOVER));
        } else {
            fill(color(COLORS.LIGHT));
        }
        rect(x1, y1, buttonWidth, buttonHeight);

        // Draw text
        noStroke();
        fill(color(COLORS.DARK));
        textAlign(CENTER, CENTER);
        text(buttonText, x + buttonWidth / 2, y + buttonHeight / 2);

        // Add button to dialogListener
        const foundListener = dialogButtonListeners.find((listener) => listener.id === buttonText);
        if (!foundListener) {
            dialogButtonListeners.push({
                x1,
                y1,
                x2,
                y2,
                click: () => {
                    // Execute listener
                    clickListener();

                    // Clear listeners
                    dialogButtonListeners.splice(0);
                },
            });
        }
    }
    // View board button
    let xPos = GAME_END_DIALOG.X_POS + buttonXOffset;
    let yPos = GAME_END_DIALOG.Y_POS + buttonYOffset;
    addButton(xPos, yPos, 'View board', () => (chessBoard.gameState = GAMESTATES.OBSERVING));
    // Reset game button
    xPos = GAME_END_DIALOG.X_POS + buttonXOffset * 3 + buttonWidth;
    addButton(xPos, yPos, 'Reset game', () => chessBoard.resetGame());
}

/**
 * Event listeners
 */
// Mouse pressed listener
function mousePressed() {
    // Return if click is not on board position
    if (!CanvasUtils.isInBoard(mouseX, mouseY)) return;

    // Check if is pawn promotion
    if (chessBoard.gameState === GAMESTATES.PLAYING && chessBoard.pawnToPromote && pawnPromotion.hasSetPiecePositions) {
        choosePromotionPiece();
    } else if (chessBoard.gameState === GAMESTATES.PLAYING) {
        movePiece();
    } else if (chessBoard.gameState !== GAMESTATES.OBSERVING) {
        // Look for dialog button click listeners
        dialogButtonListeners.forEach((listener) => {
            if (CanvasUtils.isPositionBetweenCoordinates(mouseX, mouseY, listener.x1, listener.y1, listener.x2, listener.y2)) {
                listener.click();
            }
        });
    }
}

function movePiece() {
    // Check if position has piece
    const piece = chessBoard.getPieceByPosition(mouseX, mouseY);
    if (piece && piece.isWhite === chessBoard.isWhiteTurn) {
        chessBoard.setMovingPiece(piece);
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
    chessBoard.movePiece(chessBoard.movingPiece, newPlacement);
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

// Set global functions and export chessBoard
window.preload = preload;
window.setup = setup;
window.draw = draw;
window.mouseReleased = mouseReleased;
window.mousePressed = mousePressed;
window.chessBoard = chessBoard;
window.FENUtils = FENUtils;

/**
 * TODO:
 *  * Pick starting color
 *  * Show captured pieces
 *  * Add current color's turn on right side of canvas
 *  * Add FEN notation support: moves
 *  * Add resignation button
 *  * Add threefold move repetition check
 *  * Add button to export moves (initial board setup + each consequent move) to pgn file (see chess.com pgn file)
 *  * Integrate in discord bot
 *  * Add AI
 */
