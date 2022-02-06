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

// Create chessboard variable
let chessBoard;

/**
 * P5 hooks
 */
// Preload data
export function preload(p, board, preloadedAssets) {
    // If no p5 instance was supplied, use global window
    p = p ?? window;
    chessBoard = board;
    if (!board) {
        // Create players
        const player1 = new Player('Player 1', true);
        const player2 = new Player('Player 2', false);
        // Create chessboard
        chessBoard = new Board(player1, player2);
    }

    if (!preloadedAssets) {
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
            AssetUtils.storeAsset(url, p.loadImage(url));
        });
    } else {
        Object.keys(preloadedAssets).forEach((url) => AssetUtils.storeAsset(url, preloadedAssets[url]));
    }

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
export function setup(p, loops = true) {
    // If no p5 instance was supplied, use global window
    p = p ?? window;

    // Create canvas element to draw on
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw border
    BoardGraphics.drawBorder(p);

    // Draw chess board
    BoardGraphics.drawBoard(p);

    // Draw info panel
    drawInfoPanelContents(p);

    // Draw pieces
    PieceGraphics.drawPieces(p, chessBoard.pieces, chessBoard.movingPiece);

    if (!loops) {
        p.noLoop();
    }

    // Return canvas element
    return canvas;
}

// Canvas update function
export function draw(p) {
    // If no p5 instance was supplied, use global window
    p = p ?? window;

    // Clear canvas
    p.clear();

    // Set background for debug purposes
    p.background(p.color(COLORS.DEBUG));

    // Draw border
    BoardGraphics.drawBorder(p);

    // Draw chess board
    BoardGraphics.drawBoard(p);

    // Draw info panel
    drawInfoPanelContents(p);

    // Draw enemy moves
    // MoveGraphics.drawEnemyMoves(p, chessBoard.enemyAttacks);

    // Draw possible moves
    MoveGraphics.drawMoves(p, chessBoard.pieces, chessBoard.movingPiece, chessBoard.movingPieceMoves);

    // Draw pieces
    PieceGraphics.drawPieces(p, chessBoard.pieces, chessBoard.movingPiece);

    // Draw pawn promotion screen
    if (chessBoard.pawnToPromote) {
        PieceGraphics.drawPawnPromotion(p, chessBoard.pawnToPromote, chessBoard.isWhiteTurn);
    }

    if (![GAME_STATES.PLAYING, GAME_STATES.OBSERVING].includes(chessBoard.gameState)) {
        GameEndDialog.drawGameEndDialog(p, chessBoard.gameState, chessBoard.isWhiteTurn);
    }
}

/**
 * Functions that draw on canvas
 */

function drawInfoPanelContents(p) {
    // If no p5 instance was supplied, use global window
    p = p ?? window;

    // Draw info panel
    InfoPanelGraphics.drawPanel(p);

    // Draw timestamp text
    InfoPanelGraphics.drawTimestamp(p);
    // Draw current turn
    InfoPanelGraphics.drawCurrentTurn(p, chessBoard.isWhiteTurn);
    // Draw player stats
    InfoPanelGraphics.drawPlayerStats(p, chessBoard.players[0], chessBoard.players[1]);
    // Draw past moves
    InfoPanelGraphics.drawPastMoves(p, chessBoard.pastMoves);
    // Draw action buttons
    const canResign = chessBoard.gameState === GAME_STATES.PLAYING;
    const canReset = [GAME_STATES.PLAYING, GAME_STATES.OBSERVING].includes(chessBoard.gameState);
    InfoPanelGraphics.drawActionButtons(p, canResign, canReset);
}

/**
 * Event listeners
 */
// Mouse pressed listener
function mousePressed() {
    // Return if click is not on board position
    if (!CanvasUtils.isInCanvas(mouseX, mouseY)) return;

    // Check for actions
    InfoPanelGraphics.checkInfoPanelActions(window);

    // Check if is pawn promotion
    if (CanvasUtils.isInBoard(mouseX, mouseY) && chessBoard.gameState === GAME_STATES.PLAYING) {
        if (chessBoard.pawnToPromote) {
            choosePromotionPiece(window);
        } else {
            setMovingPiece(window);
        }
    } else if (chessBoard.gameState !== GAME_STATES.OBSERVING) {
        // Check dialog actions
        GameEndDialog.checkDialogActions(window);
    }
}

export function setMovingPiece(p) {
    // If no p5 instance was supplied, use global window
    p = p ?? window;

    // Check if position has piece
    const piece = chessBoard.getPieceByPosition(p.mouseX, p.mouseY);
    if (piece && piece.isWhite === chessBoard.isWhiteTurn) {
        chessBoard.setMovingPiece(piece);
    }
}

export function choosePromotionPiece(p) {
    // If no p5 instance was supplied, use global window
    p = p ?? window;

    // Get pawn to promote
    const { pawnToPromote } = chessBoard;

    // Get piece to promote to
    const placement = BoardUtils.positionToPlacement(p.mouseX, p.mouseY);
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
if (typeof process !== 'object') {
    window.preload = preload;
    window.setup = setup;
    window.draw = draw;
    window.mousePressed = mousePressed;
    window.mouseReleased = mouseReleased;
    window.chessBoard = chessBoard;
    window.FENUtils = FENUtils;
}

/**
 * TODO:
 *  * Pick starting color
 *  * Add threefold move repetition check
 *  * Integrate in discord bot
 *  * Add AI
 */
