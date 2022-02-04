import { COLORS, GAME_STATES } from './constants/boardConstants.js';
import { Board } from './models/board.js';
import { BoardUtils } from './utils/boardUtils.js';
import { CanvasUtils } from './utils/canvasUtils.js';
import { AssetUtils } from './utils/assetUtils.js';
import { FENUtils } from './utils/fenUtils.js';
import { GameEndDialog } from './graphics/dialogs/gameEndDialog.js';
import { Bishop, King, Knight, Pawn, Queen, Rook } from './models/pieces/index.js';
import { BoardGraphics } from './graphics/boardGraphics.js';
import { MoveGraphics } from './graphics/moveGraphics.js';
import { PieceGraphics } from './graphics/pieceGraphics.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants/canvasConstants.js';
import { InfoPanelGraphics } from './graphics/infoPanelGraphics.js';
import { Player } from './models/player.js';

// Create players
const player1 = new Player('Player 1', true);
const player2 = new Player('Player 2', false);
// Initialize board
let chessBoard = new Board(player1, player2);

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

    // Create listeners
    const resetGameListener = () => chessBoard.resetGame();
    const resignGameListener = () => chessBoard.resignGame();
    // Set info panel button listeners
    InfoPanelGraphics.resetGameListener = resetGameListener;
    InfoPanelGraphics.resignGameListener = resignGameListener;
    InfoPanelGraphics.exportBoardLayoutListener = async () => {
        const fenString = FENUtils.generateFenFromBoard(
            chessBoard.pieces,
            chessBoard.isWhiteTurn,
            chessBoard.halfMovesCount,
            chessBoard.currentPlayerMoves,
            chessBoard.pastMoves,
        );
        await navigator.clipboard.writeText(fenString);
    };
    InfoPanelGraphics.exportGameListener = async () => {
        const pgnString = FENUtils.generatePGNFromBoard(
            chessBoard.players,
            chessBoard.pastMoves,
            chessBoard.gameState,
            chessBoard.initialFENString,
        );
        await navigator.clipboard.writeText(pgnString);
    };
    // Set end game dialog listeners
    GameEndDialog.viewBoardListener = () => (chessBoard.gameState = GAME_STATES.OBSERVING);
    GameEndDialog.resetGameListener = resetGameListener;
}

// Canvas initialization function, called once at start
function setup() {
    // Create canvas element to draw on
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw border
    BoardGraphics.drawBorder();

    // Draw chess board
    BoardGraphics.drawBoard();

    // Draw info panel
    drawInfoPanelContents();

    // Draw pieces
    PieceGraphics.drawPieces(chessBoard.pieces, chessBoard.movingPiece);
}

// Canvas update function
function draw() {
    // Clear canvas
    clear();

    // Set background for debug purposes
    background(color(COLORS.DEBUG));

    // Draw border
    BoardGraphics.drawBorder();

    // Draw chess board
    BoardGraphics.drawBoard();

    // Draw info panel
    drawInfoPanelContents();

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

    if (![GAME_STATES.PLAYING, GAME_STATES.OBSERVING].includes(chessBoard.gameState)) {
        GameEndDialog.drawGameEndDialog(chessBoard.gameState, chessBoard.isWhiteTurn);
    }
}

/**
 * Functions that draw on canvas
 */

function drawInfoPanelContents() {
    // Draw info panel
    InfoPanelGraphics.drawPanel();

    // Draw timestamp text
    InfoPanelGraphics.drawTimestamp();
    // Draw current turn
    InfoPanelGraphics.drawCurrentTurn(chessBoard.isWhiteTurn);
    // Draw player stats
    InfoPanelGraphics.drawPlayerStats(chessBoard.players[0], chessBoard.players[1]);
    // Draw past moves
    InfoPanelGraphics.drawPastMoves(chessBoard.pastMoves);
    // Draw action buttons
    const canResign = chessBoard.gameState === GAME_STATES.PLAYING;
    const canReset = [GAME_STATES.PLAYING, GAME_STATES.OBSERVING].includes(chessBoard.gameState);
    InfoPanelGraphics.drawActionButtons(canResign, canReset);
}

/**
 * Event listeners
 */
// Mouse pressed listener
function mousePressed() {
    // Return if click is not on board position
    if (!CanvasUtils.isInCanvas(mouseX, mouseY)) return;

    // Check for actions
    InfoPanelGraphics.checkInfoPanelActions();

    // Check if is pawn promotion
    if (CanvasUtils.isInBoard(mouseX, mouseY) && chessBoard.gameState === GAME_STATES.PLAYING) {
        if (chessBoard.pawnToPromote) {
            choosePromotionPiece();
        } else {
            setMovingPiece();
        }
    } else if (chessBoard.gameState !== GAME_STATES.OBSERVING) {
        // Check dialog actions
        GameEndDialog.checkDialogActions();
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
 *  * TODO: Fix king run away from check
 *  * Pick starting color
 *  * Add threefold move repetition check
 *  * Integrate in discord bot
 *  * Add AI
 */
