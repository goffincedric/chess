import { COLORS } from './constants/boardConstants.js';
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
import { ExportGameDialog } from './dialogs/gameOptions/exportGame/exportGameDialog.js';
import { GameExportedDialog } from './dialogs/gameOptions/exportGame/gameExportedDialog.js';
import { EnvironmentUtils } from './utils/environmentUtils.js';
import { SettingsDialog } from './dialogs/settings/settingsDialog.js';
import { Settings } from './config/settings.js';
import { WebStorageConstants } from './constants/webStorageConstants.js';
import { FENUtils } from './utils/fenUtils.js';
import { RegexConstants } from './constants/regexConstants.js';
import { GameConstants } from './constants/gameConstants.js';
import { GameOptionsDialog } from './dialogs/gameOptions/gameOptionsDialog.js';
import { EvaluationFunctions } from './ai/evaluate.js';
import { alphabeta } from './ai/alphabeta.js';

// Create chessboard variable
/**
 * @type {Board}
 */
let chessBoard;

/**
 * P5 hooks
 */
// Preload data
export function preload(p, board, preloadedAssets) {
    let importedBoard;
    if (board) {
        importedBoard = board;
    } else if (EnvironmentUtils.isBrowserEnvironment()) {
        // Check if is browser environment
        // Check if a previously saved PGN is available
        const savedPGN = localStorage.getItem(WebStorageConstants.SAVED_GAME_PGN);
        if (savedPGN) {
            // Import board from PGN
            importedBoard = FENUtils.generateBoardFromPGN(savedPGN);
        }
    }

    // If no board was imported, create default board
    if (!importedBoard) {
        // Create players
        const player1 = new Player('Player 1', true);
        const player2 = new Player('Player 2', false);
        // Create chessboard
        importedBoard = new Board(player1, player2);
    }

    // Set current chessboard
    setChessBoard(importedBoard);

    // Load assets
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
    // Add dialogs to DialogGraphics
    DialogGraphics.addDialog(GameOptionsDialog.dialog);
    DialogGraphics.addDialog(ExportGameDialog.dialog);
    DialogGraphics.addDialog(GameExportedDialog.dialog);
    DialogGraphics.addDialog(SettingsDialog.dialog);
    DialogGraphics.addDialog(GameEndDialog.dialog);
}

function initializeInfoPanelButtons() {
    // Set info panel button listeners
    InfoPanelGraphics.resignGameListener = () => chessBoard.resignGame();
    InfoPanelGraphics.showGameOptionsListener = () => GameOptionsDialog.dialog.show();
    InfoPanelGraphics.undoMoveListener = () => {
        // Undo last move
        chessBoard.undoLastMove();

        // Save game
        saveBoardToStorage();
    };
    InfoPanelGraphics.showSettingsListener = () => SettingsDialog.dialog.show();
}

// Canvas initialization function, called once at start
export function setup(p, loops = true) {
    // Create canvas element to draw on
    const canvas = p.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    // Check if board needs to be flipped
    const flipBoard = Settings.getSetting(Settings.Names.AutoFlipBoard) && !chessBoard.isWhiteTurn;

    // Draw border
    BoardGraphics.drawBorder(p, flipBoard);
    // Draw chess board
    BoardGraphics.drawBoard(p, flipBoard);
    // Highlight squares of last move
    BoardGraphics.highlightLastMoveSquares(p, chessBoard.pastMoves, flipBoard);

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
    // Check if board needs to be flipped
    const flipBoard = Settings.getSetting(Settings.Names.AutoFlipBoard) && !chessBoard.isWhiteTurn;

    // Clear canvas
    p.clear();

    // Set background for debug purposes
    p.background(p.color(COLORS.DEBUG));

    // Draw border
    BoardGraphics.drawBorder(p, flipBoard);

    // Draw chess board
    BoardGraphics.drawBoard(p);

    // Highlight squares of last move
    BoardGraphics.highlightLastMoveSquares(p, chessBoard.pastMoves, flipBoard);

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

    if (
        [
            GameConstants.States.CHECKMATE,
            GameConstants.States.DRAW_STALEMATE,
            GameConstants.States.DRAW_INSUFFICIENT_PIECES,
            GameConstants.States.RESIGNED,
        ].includes(chessBoard.gameState)
    ) {
        GameEndDialog.updateGameEndDialogText(chessBoard.gameState, chessBoard.isWhiteTurn);
        GameEndDialog.dialog.show();
    } else {
        GameEndDialog.dialog.hide();
    }

    DialogGraphics.drawDialogs(p);
}

/**
 * Functions that draw on canvas
 */

function drawInfoPanelContents(p) {
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
    const canResign = chessBoard.gameState === GameConstants.States.PLAYING;
    const canUndo = chessBoard.gameState === GameConstants.States.PLAYING && Settings.getSetting(Settings.Names.EnableMoveUndo);
    InfoPanelGraphics.drawActionButtons(p, canResign, canUndo);
}

/**
 * Event listeners
 */
// Mouse pressed listener
function mousePressed(p) {
    // Return if click is not on canvas position
    if (!CanvasUtils.isInCanvas(p.mouseX, p.mouseY)) return;

    if (DialogGraphics.isDrawingDialogs()) {
        // Check for dialog actions
        DialogGraphics.checkDialogActions(p);
    } else {
        // Check for info panel actions
        InfoPanelGraphics.checkInfoPanelActions(p);

        if (CanvasUtils.isInBoard(p.mouseX, p.mouseY) && chessBoard.gameState === GameConstants.States.PLAYING) {
            // Check if is pawn promotion
            if (chessBoard.pawnToPromote) {
                choosePromotionPiece(p);
            } else {
                setMovingPiece(p);
            }
        }
    }
}

export function setMovingPiece(p) {
    // Check if board is flipped
    const isFlipped = Settings.getSetting(Settings.Names.AutoFlipBoard) && !chessBoard.isWhiteTurn;
    // Convert mouse position to placement
    const placement = BoardUtils.positionToPlacement(p.mouseX, p.mouseY, isFlipped);
    // Check if placement has a piece
    const piece = chessBoard.getPieceByPlacement(placement.file, placement.rank);
    if (piece && piece.isWhite === chessBoard.isWhiteTurn) {
        chessBoard.setMovingPiece(piece);
    }
}

export function choosePromotionPiece(p) {
    // Check if board is flipped
    const isFlipped = Settings.getSetting(Settings.Names.AutoFlipBoard) && !chessBoard.isWhiteTurn;

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

        // Save game
        saveBoardToStorage();
    }
}

// Mouse released listener
function mouseReleased(p) {
    // Reset moving piece if is released outside board position
    if (!CanvasUtils.isInBoard(p.mouseX, p.mouseY)) {
        chessBoard.clearMovingPiece();
    }

    // Return if is not moving piece or is promoting pawn
    if (!chessBoard.movingPiece || chessBoard.pawnToPromote) return;

    // Check if board is flipped
    const isFlipped = Settings.getSetting(Settings.Names.AutoFlipBoard) && !chessBoard.isWhiteTurn;
    // Get placement on board
    const newPlacement = BoardUtils.positionToPlacement(p.mouseX, p.mouseY, isFlipped);
    // Set piece to new placement
    chessBoard.movePiece(newPlacement);

    // Save game
    saveBoardToStorage();
}

export function setChessBoard(board) {
    chessBoard = board;
    if (EnvironmentUtils.isBrowserEnvironment()) {
        window.chessBoard = chessBoard;
    }
}

export function setAutoFlipBoard(flipBoard) {
    Settings.setSetting(Settings.Names.AutoFlipBoard, flipBoard);
}

export function movePieceByFEN(fenMove) {
    const { from, to } = fenMove;
    const FENMoveRegex = RegexConstants.FEN_MOVE;
    if (FENMoveRegex.test(from) && FENMoveRegex.test(to)) {
        // Convert fen to placements
        const fromPlacement = new Placement(BoardUtils.fileCharToNumber(from[0]), +from[1]);
        const toPlacement = new Placement(BoardUtils.fileCharToNumber(to[0]), +to[1]);

        // Get move linked to from and to placements
        const move = MovesUtils.getMoveByPlacements(chessBoard.currentPlayerMoves, fromPlacement, toPlacement);
        if (move && move.movingPiece.isWhite === chessBoard.isWhiteTurn) {
            const piece = chessBoard.getPieceByPlacement(fromPlacement.file, fromPlacement.rank);
            chessBoard.setMovingPiece(piece);
            chessBoard.movePiece(toPlacement);

            // Save game
            saveBoardToStorage();

            return true;
        }
    }
    return false;
}

export function saveBoardToStorage() {
    if (EnvironmentUtils.isBrowserEnvironment()) {
        const pgnString = chessBoard.getPGN();
        localStorage.setItem(WebStorageConstants.SAVED_GAME_PGN, pgnString);
    }
}

export function evaluateBestMove(depth = 1) {
    const label = 'Minimax benchmark';
    let bestHeuristic = Number.MIN_SAFE_INTEGER;
    let bestMoves = [];
    EvaluationFunctions.node_count = 0;

    if (depth <= 0) depth = 1;

    console.time(label);
    for (const move of chessBoard.currentPlayerMoves) {
        // Set moving piece
        const pieceToMove = chessBoard.getPieceByPlacement(move.movingPiece.file, move.movingPiece.rank);
        chessBoard.setMovingPiece(pieceToMove);
        // Execute move
        chessBoard.movePiece(new Placement(move.file, move.rank));
        // Evaluate current move
        const heuristic = alphabeta(
            chessBoard,
            depth - 1,
            (chessBoard, isMaximizingPlayer) => EvaluationFunctions.evaluateBoardByPieces(chessBoard, isMaximizingPlayer, false),
            Number.MIN_SAFE_INTEGER,
            Number.MAX_SAFE_INTEGER,
            false,
        );
        // If move is better than last made move, save it
        if (heuristic > bestHeuristic) {
            bestHeuristic = heuristic;
            bestMoves = [move];
        } else if (heuristic === bestHeuristic) {
            bestMoves.push(move);
        }
        // Undo move
        chessBoard.undoLastMove();
    }
    console.timeEnd(label);
    console.log('Heuristic:', bestHeuristic);
    console.log('Best moves:', bestMoves);
    console.log('Nodes evaluated:', EvaluationFunctions.node_count);
}

// Set global functions and export chessBoard
if (EnvironmentUtils.isBrowserEnvironment()) {
    window.p5instance = new p5((p) => {
        p.preload = () => preload(p);
        p.setup = () => setup(p);
        p.draw = () => draw(p);
        p.mousePressed = () => mousePressed(p);
        p.mouseReleased = () => mouseReleased(p);
    });
    window.movePieceByFEN = movePieceByFEN;
}

/**
 * TODO:
 *  * Add close button to the game options dialog
 *  * Pick starting color
 *  * Add threefold move repetition check
 */
