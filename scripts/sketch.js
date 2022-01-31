import { CANVAS_SIZE, COLORS, FILES, GAMESTATES, SQUARE_SIZE } from './constants/boardConstants.js';
import { Board } from './models/board.js';
import { BoardUtils } from './utils/boardUtils.js';
import { CanvasUtils } from './utils/canvasUtils.js';
import { AssetUtils } from './utils/assetUtils.js';
import { FENUtils } from './utils/fenUtils.js';
import { EndGameDialog } from './graphics/dialogs/endGameDialog.js';
import { Bishop, King, Knight, Pawn, Queen, Rook } from './models/pieces';
import { BoardGraphics } from './graphics/boardGraphics.js';
import { MoveGraphics } from './graphics/moveGraphics.js';
import { PieceGraphics } from './graphics/pieceGraphics.js';

// Initialize board
let chessBoard = new Board();

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

    // Create end game dialog listeners
    EndGameDialog.viewBoardListener = () => (chessBoard.gameState = GAMESTATES.OBSERVING);
    EndGameDialog.resetGameListener = () => chessBoard.resetGame();
}

// Canvas initialization function, called once at start
function setup() {
    // Set background for debug purposes
    background(color(COLORS.DEBUG));

    // Create canvas element to draw on
    createCanvas(CANVAS_SIZE, CANVAS_SIZE);

    // Draw border
    BoardGraphics.drawBorder();

    // Draw chess board
    BoardGraphics.drawBoard();

    // Draw pieces
    PieceGraphics.drawPieces(chessBoard.pieces, chessBoard.movingPiece);
}

// Canvas update function
function draw() {
    // Clear canvas
    clear();

    // Draw border
    BoardGraphics.drawBorder();

    // Draw chess board
    BoardGraphics.drawBoard();

    // Draw enemy moves
    MoveGraphics.drawEnemyMoves(chessBoard.enemyAttacks);

    // Draw possible moves
    MoveGraphics.drawMoves(chessBoard.pieces, chessBoard.movingPiece, chessBoard.movingPieceMoves);

    // Draw pieces
    PieceGraphics.drawPieces(chessBoard.pieces, chessBoard.movingPiece);

    // Draw pawn promotion screen
    if (chessBoard.pawnToPromote) {
        PieceGraphics.drawPawnPromotion(chessBoard.pawnToPromote, chessBoard.isWhiteTurn);
    }

    if (![GAMESTATES.PLAYING, GAMESTATES.OBSERVING].includes(chessBoard.gameState)) {
        EndGameDialog.drawGameEndDialog(chessBoard.gameState, chessBoard.isWhiteTurn);
    }
}

/**
 * Functions that draw on canvas
 */

/**
 * Event listeners
 */
// Mouse pressed listener
function mousePressed() {
    // Return if click is not on board position
    if (!CanvasUtils.isInBoard(mouseX, mouseY)) return;

    // Check if is pawn promotion
    if (chessBoard.gameState === GAMESTATES.PLAYING) {
        if (chessBoard.pawnToPromote) {
            choosePromotionPiece();
        } else {
            setMovingPiece();
        }
    } else if (chessBoard.gameState !== GAMESTATES.OBSERVING) {
        // Check dialog actions
        EndGameDialog.checkDialogActions();
    }
}

function setMovingPiece() {
    // Check if position has piece
    const piece = chessBoard.getPieceByPosition(mouseX, mouseY);
    if (piece && piece.isWhite === chessBoard.isWhiteTurn) {
        chessBoard.setMovingPiece(piece);
    }
}

function choosePromotionPiece() {
    // Get pawn to promote
    const { pawnToPromote } = chessBoard;

    // Get piece to promote to
    const placement = BoardUtils.positionToPlacement(mouseX, mouseY);
    const chosenPiece = Object.values(chessBoard.isWhiteTurn ? PieceGraphics.pawnPromotion.white : PieceGraphics.pawnPromotion.dark).find(
        (piece) => piece.file === placement.file && piece.rank === placement.rank,
    );
    if (chosenPiece) {
        // Create new instance of chosen piece
        const promotedPiece = new chosenPiece.constructor(pawnToPromote.file, pawnToPromote.rank, pawnToPromote.isWhite, false);

        // Promote piece
        chessBoard.promotePawn(promotedPiece);

        // Set promotion pieces position flag to false
        PieceGraphics.pawnPromotion.hasSetPiecePositions = false;
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
