import { COLORS, GAME_STATES } from './constants/boardConstants.js';
import { Board } from './models/board.js';
import { BoardUtils } from './utils/boardUtils.js';
import { CanvasUtils } from './utils/canvasUtils.js';
import { AssetUtils } from './utils/assetUtils.js';
import { Bishop, King, Knight, Pawn, Queen, Rook } from './models/pieces/index.js';
import { BoardGraphics } from './graphics/boardGraphics.js';
import { MoveGraphics } from './graphics/moveGraphics.js';
import { PieceGraphics } from './graphics/pieceGraphics.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants/canvasConstants.js';
import { InfoPanelGraphics } from './graphics/infoPanelGraphics.js';
import { Player } from './models/player.js';
import { Placement } from './models/placement.js';
import { MovesUtils } from './utils/movesUtils.js';
import { DialogGraphics } from './graphics/dialogGraphics.js';
import { GameEndDialog } from './dialogs/gameEndDialog.js';
import { ExportGameDialog } from './dialogs/exportGame/exportGameDialog.js';
import { GameExportedDialog } from './dialogs/exportGame/gameExportedDialog.js';
import { EnvironmentUtils } from './utils/environmentUtils.js';
import { SettingsDialog } from './dialogs/settingsDialog.js';
import { Settings } from './config/settings.js';

// Create chessboard variable
let chessBoard;

/**
 * P5 hooks
 */
// Preload data
export function preload(p = window, board, preloadedAssets) {
    if (!board) {
        // Create players
        const player1 = new Player('Player 1', true);
        const player2 = new Player('Player 2', false);
        // Create chessboard
        board = new Board(player1, player2);
    }
    setChessBoard(board);

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

    // Initialize dialogs
    initializeDialogs();

    // Setup info panel button listeners
    initializeInfoPanelButtons();
}

function initializeDialogs() {
    // Create listeners
    const resetGameListener = () => {
        chessBoard.resetGame();
        GameEndDialog.dialog.hide();
    };
    const viewBoardListener = () => {
        chessBoard.gameState = GAME_STATES.OBSERVING;
        GameEndDialog.dialog.hide();
    };

    // Setup game end dialog
    GameEndDialog.buttons.resetGameButton.action = resetGameListener;
    GameEndDialog.buttons.viewBoardButton.action = viewBoardListener;

    // Add initialized dialogs to DialogGraphics
    DialogGraphics.addDialog(ExportGameDialog.dialog);
    DialogGraphics.addDialog(GameExportedDialog.dialog);
    DialogGraphics.addDialog(SettingsDialog.dialog);
    DialogGraphics.addDialog(GameEndDialog.dialog);
}

function initializeInfoPanelButtons() {
    // Create listeners
    const resetGameListener = () => chessBoard.resetGame();
    const resignGameListener = () => chessBoard.resignGame();

    // Set info panel button listeners
    InfoPanelGraphics.resetGameListener = resetGameListener;
    InfoPanelGraphics.resignGameListener = resignGameListener;
    InfoPanelGraphics.exportGameListener = () => ExportGameDialog.dialog.show();
    InfoPanelGraphics.settingsListener = () => SettingsDialog.dialog.show();
}

// Canvas initialization function, called once at start
export function setup(p = window, loops = true) {
    // Create canvas element to draw on
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Check if board needs to be flipped
    const flipBoard = Settings.autoFlipBoard && !chessBoard.isWhiteTurn;

    // Draw border
    BoardGraphics.drawBorder(p, flipBoard);
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
export function draw(p = window) {
    // Check if board needs to be flipped
    const flipBoard = Settings.autoFlipBoard && !chessBoard.isWhiteTurn;

    // Clear canvas
    p.clear();

    // Set background for debug purposes
    p.background(p.color(COLORS.DEBUG));

    // Draw border
    BoardGraphics.drawBorder(p, flipBoard);

    // Draw chess board
    BoardGraphics.drawBoard(p);

    // Draw enemy moves
    // MoveGraphics.drawEnemyMoves(p, chessBoard.enemyAttacks, flipBoard);

    // Draw possible moves
    MoveGraphics.drawMoves(p, chessBoard.pieces, chessBoard.movingPiece, chessBoard.movingPieceMoves, flipBoard);

    // Draw info panel
    drawInfoPanelContents(p);

    // Draw pieces
    PieceGraphics.drawPieces(p, chessBoard.pieces, chessBoard.movingPiece, flipBoard);

    // Draw pawn promotion screen
    if (chessBoard.pawnToPromote) {
        PieceGraphics.drawPawnPromotion(p, chessBoard.pawnToPromote, chessBoard.isWhiteTurn, flipBoard);
    }

    if (![GAME_STATES.PLAYING, GAME_STATES.OBSERVING].includes(chessBoard.gameState)) {
        GameEndDialog.updateGameEndDialogText(chessBoard.gameState, chessBoard.isWhiteTurn);
        GameEndDialog.dialog.show();
    }

    DialogGraphics.drawDialogs(p);
}

/**
 * Functions that draw on canvas
 */

function drawInfoPanelContents(p = window) {
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
    // Return if click is not on canvas position
    if (!CanvasUtils.isInCanvas(mouseX, mouseY)) return;

    if (DialogGraphics.isDrawingDialogs()) {
        // Check for dialog actions
        DialogGraphics.checkDialogActions(window);
    } else {
        // Check for info panel actions
        InfoPanelGraphics.checkInfoPanelActions(window);

        if (CanvasUtils.isInBoard(mouseX, mouseY) && chessBoard.gameState === GAME_STATES.PLAYING) {
            // Check if is pawn promotion
            if (chessBoard.pawnToPromote) {
                choosePromotionPiece(window);
            } else {
                setMovingPiece(window);
            }
        }
    }
}

export function setMovingPiece(p = window) {
    // Check if board is flipped
    const isFlipped = Settings.autoFlipBoard && !chessBoard.isWhiteTurn;
    // Convert mouse position to placement
    const placement = BoardUtils.positionToPlacement(p.mouseX, p.mouseY, isFlipped);
    // Check if placement has a piece
    const piece = chessBoard.getPieceByPlacement(placement.file, placement.rank);
    if (piece && piece.isWhite === chessBoard.isWhiteTurn) {
        chessBoard.setMovingPiece(piece);
    }
}

export function choosePromotionPiece(p = window) {
    // Check if board is flipped
    const isFlipped = Settings.autoFlipBoard && !chessBoard.isWhiteTurn;

    // Get piece to promote to
    const placement = BoardUtils.positionToPlacement(p.mouseX, p.mouseY, isFlipped);
    const chosenPiece = Object.values(
        chessBoard.isWhiteTurn ? PieceGraphics.pawnPromotion.whitePieces : PieceGraphics.pawnPromotion.blackPieces,
    ).find((piece) => piece.file === placement.file && piece.rank === placement.rank);
    if (chosenPiece) {
        // Promote piece
        chessBoard.promotePawn(chosenPiece.constructor);

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

    // Check if board is flipped
    const isFlipped = Settings.autoFlipBoard && !chessBoard.isWhiteTurn;
    // Get placement on board
    const newPlacement = BoardUtils.positionToPlacement(mouseX, mouseY, isFlipped);
    // Set piece to new placement
    chessBoard.movePiece(newPlacement);
}

export function setChessBoard(board) {
    chessBoard = board;
    if (EnvironmentUtils.isBrowserEnvironment()) {
        window.chessBoard = chessBoard;
    }
}

export function setAutoFlipBoard(flipBoard) {
    Settings.autoFlipBoard = flipBoard;
}

export function movePieceByFEN(fenMove) {
    const { from, to } = fenMove;
    const FENMoveRegex = /^[A-H][1-8]$/i;
    if (FENMoveRegex.test(from) && FENMoveRegex.test(to)) {
        // Convert fen to placements
        const fromPlacement = new Placement(+from[1], BoardUtils.rankCharToNumber(from[0]));
        const toPlacement = new Placement(+to[1], BoardUtils.rankCharToNumber(to[0]));

        // Get move linked to from and to placements
        const move = MovesUtils.getMoveByPlacements(chessBoard.currentPlayerMoves, fromPlacement, toPlacement);
        if (move && move.movingPiece.isWhite === chessBoard.isWhiteTurn) {
            const piece = chessBoard.getPieceByPlacement(fromPlacement.file, fromPlacement.rank);
            chessBoard.setMovingPiece(piece);
            chessBoard.movePiece(toPlacement);
            return true;
        }
    }
    return false;
}

// Set global functions and export chessBoard
if (EnvironmentUtils.isBrowserEnvironment()) {
    window.preload = preload;
    window.setup = setup;
    window.draw = draw;
    window.mousePressed = mousePressed;
    window.mouseReleased = mouseReleased;
    window.movePieceByFEN = movePieceByFEN;
    window.setAutoFlipBoard = setAutoFlipBoard;
}

/**
 * TODO:
 *  * Add undo / redo buttons just above info panel action buttons
 *  * Add caching game to localStorage if available (store PGN on each move and import PGN after refresh)
 *  * Pick starting color
 *  * Add threefold move repetition check
 *  * Add AI
 *  * Check for p5 update to 1.4.1
 */
