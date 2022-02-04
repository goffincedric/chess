import {
    BOARD_BORDER_HEIGHT,
    BOARD_BORDER_STROKE_WIDTH,
    BOARD_OFFSET,
    COLORS,
    GAME_STATES,
    SQUARE_SIZE,
    TOTAL_BOARD_SIZE,
} from '../constants/boardConstants.js';
import { INFO_PANEL_DIVIDER_LEFT_WIDTH, INFO_PANEL_DIVIDER_WIDTH, INFO_PANEL_WIDTH } from '../constants/infoPanelConstants.js';
import { MAX_PIECE_COUNT, PieceTypes } from '../constants/pieceConstants.js';
import { AssetUtils } from '../utils/assetUtils.js';
import { CanvasUtils } from '../utils/canvasUtils.js';

// Set global positions and sizes
const textCenterX = TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH / 2;
const marginWidth = SQUARE_SIZE / 7;

// Set timestamp text + update interval
let timestampText;
function setTimestampText() {
    const timestamp = new Date();
    timestampText =
        timestamp.toLocaleString('nl-BE', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        }) +
        ' - ' +
        timestamp.toLocaleTimeString('nl-BE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
}
setTimestampText();
setInterval(() => setTimestampText(), 1000);

// Draw info panel background
function drawPanel() {
    // Draw background
    noStroke();
    fill(color(COLORS.INFO_PANEL.BACKGROUND));
    rect(TOTAL_BOARD_SIZE, 0, INFO_PANEL_WIDTH, TOTAL_BOARD_SIZE);

    // Draw separating line
    stroke(color(COLORS.DARKER));
    strokeWeight(INFO_PANEL_DIVIDER_LEFT_WIDTH);
    line(TOTAL_BOARD_SIZE, 0, TOTAL_BOARD_SIZE, TOTAL_BOARD_SIZE);
}

// Draw timestamp on panel
const timeStampYOffset = BOARD_BORDER_HEIGHT + BOARD_BORDER_STROKE_WIDTH;
function drawTimestamp() {
    // Draw timestamp text
    noStroke();
    textSize(timeStampYOffset / 2);
    textAlign(CENTER, CENTER);
    fill(color(COLORS.LIGHTER));
    text(timestampText, textCenterX, timeStampYOffset / 2);

    // Draw line below timestamp
    stroke(color(COLORS.DARK));
    strokeWeight(INFO_PANEL_DIVIDER_WIDTH);
    line(TOTAL_BOARD_SIZE, timeStampYOffset, TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH, timeStampYOffset);
}

// Draw current turn on panel
const currentTurnYOffset = timeStampYOffset;
const currentTurnHeight = SQUARE_SIZE;
function drawCurrentTurn(isWhiteTurn) {
    // Draw current turn text
    noStroke();
    textSize(SQUARE_SIZE / 3);
    textAlign(CENTER, CENTER);
    fill(color(COLORS.LIGHTER));
    let turnText = `Current turn: ${isWhiteTurn ? 'White' : 'Black'}`;
    text(turnText, textCenterX, currentTurnYOffset + currentTurnHeight / 2);

    // Draw line below text
    stroke(color(COLORS.DARK));
    strokeWeight(INFO_PANEL_DIVIDER_WIDTH);
    line(
        TOTAL_BOARD_SIZE,
        currentTurnYOffset + currentTurnHeight,
        TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH,
        currentTurnYOffset + currentTurnHeight,
    );
}

// Draw player stats on panel
const playersYOffset = currentTurnYOffset + currentTurnHeight;
const playersHeight = SQUARE_SIZE * 2;
const playerStatsHeight = playersHeight / 2;
function drawPlayerStats(player1, player2) {
    // Separate players by colors
    let topPlayer, bottomPlayer;
    if (player1.isWhite) {
        topPlayer = player1;
        bottomPlayer = player2;
    } else {
        topPlayer = player2;
        bottomPlayer = player1;
    }

    // Draw players
    drawPlayer(TOP, topPlayer);
    drawPlayer(BOTTOM, bottomPlayer);

    // Draw line between players
    const strokeMargin = 10;
    stroke(color(COLORS.DARK));
    strokeWeight(INFO_PANEL_DIVIDER_WIDTH - 1);
    line(
        TOTAL_BOARD_SIZE + strokeMargin,
        playersYOffset + playerStatsHeight,
        TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH - strokeMargin,
        playersYOffset + playerStatsHeight,
    );

    // Draw line below player stats
    stroke(color(COLORS.DARK));
    strokeWeight(INFO_PANEL_DIVIDER_WIDTH);
    line(TOTAL_BOARD_SIZE, playersYOffset + playersHeight, TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH, playersYOffset + playersHeight);
}

const playerNameHeight = (SQUARE_SIZE / 7) * 5.5;
const coloredStripeWidth = 5;
function drawPlayer(place, player) {
    noStroke();
    // Define starting y position
    let yOffset = playersYOffset + (place === BOTTOM ? playerStatsHeight : 0);

    // Draw player stripe color
    let stripeColor = player.isWhite ? COLORS.LIGHTER : COLORS.DARKER;
    fill(color(stripeColor));
    rect(TOTAL_BOARD_SIZE + marginWidth, yOffset + marginWidth, coloredStripeWidth, playerStatsHeight - marginWidth * 2);

    // Draw player name
    fill(color(COLORS.LIGHTER));
    textSize(playerNameHeight / 2);
    textAlign(LEFT, BASELINE);
    textWrap(CHAR);
    text(
        player.name,
        TOTAL_BOARD_SIZE + marginWidth * 2 + coloredStripeWidth,
        yOffset + marginWidth,
        INFO_PANEL_WIDTH - coloredStripeWidth - marginWidth * 2,
        playerNameHeight,
    );

    // Draw captured pieces
    drawCapturedPieces(yOffset, player.capturedPieces);
}

const piecesOrder = [PieceTypes.PAWN, PieceTypes.ROOK, PieceTypes.KNIGHT, PieceTypes.BISHOP, PieceTypes.QUEEN];
function drawCapturedPieces(playerStatsYPos, capturedPiecesMap) {
    // Add captured pieces text
    const pieceHeight = playerNameHeight / 3;
    const bottomY = playerStatsYPos + playersHeight / 2 - marginWidth;
    const topY = bottomY - pieceHeight;
    noStroke();
    fill(color(COLORS.LIGHTER));
    textSize(playerNameHeight / 4);
    textAlign(LEFT, BOTTOM);
    const labelText = 'Captured pieces: ';
    text(labelText, TOTAL_BOARD_SIZE + marginWidth * 2 + coloredStripeWidth, bottomY);

    // Draw captured pieces
    const labelWidth = textWidth(labelText);
    const totalPieceCount = MAX_PIECE_COUNT / 2; // ÷2 for piece count of each side
    const piecesWidth = INFO_PANEL_WIDTH - coloredStripeWidth - marginWidth * 3 - labelWidth;
    const pieceWidth = (piecesWidth - 4 * marginWidth) / totalPieceCount; // 4 stat margins between each piece type
    const piecesXOffset = TOTAL_BOARD_SIZE + coloredStripeWidth + marginWidth * 2 + labelWidth;
    let pieceCount = 0,
        marginCount = 0;
    piecesOrder.forEach((pieceType) => {
        const capturedPiecesOfType = capturedPiecesMap.get(pieceType);
        if (capturedPiecesOfType?.length > 0) {
            const asset = AssetUtils.getAsset(capturedPiecesOfType[0].getAssetUrl());
            capturedPiecesOfType.forEach(() => {
                const xPos = pieceCount * pieceWidth + marginWidth * marginCount;
                image(asset, piecesXOffset + xPos, topY, pieceHeight, pieceHeight);
                pieceCount++;
            });
            marginCount++;
        }
    });
}

// Draw moves on panel
const pastMovesYOffset = playersYOffset + playersHeight;
const pastMovesHeight = SQUARE_SIZE * 4; // TODO: Potentially 4 high?
function drawPastMoves(moves) {
    // Generate moves text
    let movesText;
    if (moves.length > 0) {
        movesText = FENUtils.generatePGNForMoves(moves);
    } else {
        movesText = '1.';
    }

    // Draw moves textually, wrapping with words
    const xPos = TOTAL_BOARD_SIZE + marginWidth;
    const yPos = pastMovesYOffset + marginWidth;
    const width = INFO_PANEL_WIDTH - marginWidth * 2;
    const height = pastMovesHeight - marginWidth * 2;
    noStroke();
    fill(color(COLORS.LIGHTER));
    textWrap(WORD);
    textSize((SQUARE_SIZE / 7 - (marginWidth * 2) / 7) * 1.44);
    textAlign(LEFT, TOP);
    text(movesText, xPos, yPos, width, height);

    // Draw line below past moves
    stroke(color(COLORS.DARK));
    strokeWeight(INFO_PANEL_DIVIDER_WIDTH);
    line(TOTAL_BOARD_SIZE, pastMovesYOffset + pastMovesHeight, TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH, pastMovesYOffset + pastMovesHeight);
}

// Draw buttons on panel
const infoPanelButtonListeners = [];
const actionButtonsYOffset = pastMovesYOffset + pastMovesHeight;
const actionButtonsHeight = SQUARE_SIZE + BOARD_OFFSET;
let exportFENTimeoutId, exportPGNTimeoutId;
const copiedLabel = 'Copied to clipboard';
function drawActionButtons(canResign, canReset) {
    const buttonWidth = INFO_PANEL_WIDTH / 2 - marginWidth * 2;
    const buttonHeight = actionButtonsHeight / 2 - marginWidth * 2;
    if (canResign) {
        addButton(
            'Resign',
            TOTAL_BOARD_SIZE + marginWidth,
            actionButtonsYOffset + marginWidth,
            buttonWidth,
            buttonHeight,
            InfoPanelGraphics.resignGameListener,
        );
    }
    if (canReset) {
        addButton(
            'Reset game',
            TOTAL_BOARD_SIZE + marginWidth,
            TOTAL_BOARD_SIZE - marginWidth - buttonHeight,
            buttonWidth,
            buttonHeight,
            InfoPanelGraphics.resetGameListener,
        );
    }
    addButton(
        exportFENTimeoutId ? copiedLabel : 'Export board FEN',
        TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH - marginWidth - buttonWidth,
        actionButtonsYOffset + marginWidth,
        buttonWidth,
        buttonHeight,
        () => {
            if (!exportFENTimeoutId) {
                clearTimeout(exportPGNTimeoutId);
                exportPGNTimeoutId = null;
                exportFENTimeoutId = setTimeout(() => (exportFENTimeoutId = null), 2000);
                InfoPanelGraphics.exportBoardLayoutListener();
            }
        },
    );
    addButton(
        exportPGNTimeoutId ? copiedLabel : 'Export game PGN',
        TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH - marginWidth - buttonWidth,
        TOTAL_BOARD_SIZE - marginWidth - buttonHeight,
        buttonWidth,
        buttonHeight,
        () => {
            if (!exportPGNTimeoutId) {
                clearTimeout(exportFENTimeoutId);
                exportFENTimeoutId = null;
                exportPGNTimeoutId = setTimeout(() => (exportPGNTimeoutId = null), 2000);
                InfoPanelGraphics.exportGameListener();
            }
        },
    );
}

function addButton(buttonText, x, y, width, height, clickListener) {
    let x1 = x;
    let y1 = y;
    let x2 = x + width;
    let y2 = y + height;

    // Draw box
    strokeWeight(2);
    stroke(color(COLORS.DARK));
    if (CanvasUtils.isPositionBetweenCoordinates(mouseX, mouseY, x1, y1, x2, y2)) {
        fill(color(COLORS.BUTTON_HOVER));
    } else {
        fill(color(COLORS.LIGHT));
    }
    rect(x1, y1, width, height);

    // Draw text
    noStroke();
    fill(color(COLORS.DARK));
    textAlign(CENTER, CENTER);
    text(buttonText, x + width / 2, y + height / 2);

    // Add button to dialogListener
    const foundListener = infoPanelButtonListeners.find((listener) => listener.id === buttonText);
    if (!foundListener) {
        infoPanelButtonListeners.push({
            id: buttonText,
            x1,
            y1,
            x2,
            y2,
            click: clickListener,
        });
    }
}

function checkInfoPanelActions() {
    // Look for dialog button click listeners
    infoPanelButtonListeners.forEach((listener) => {
        if (CanvasUtils.isPositionBetweenCoordinates(mouseX, mouseY, listener.x1, listener.y1, listener.x2, listener.y2)) {
            listener.click();
        }
    });
}

export const InfoPanelGraphics = {
    drawPanel,
    drawTimestamp,
    drawCurrentTurn,
    drawPlayerStats,
    drawPastMoves,
    drawActionButtons,

    checkInfoPanelActions,

    // Set default listeners
    resignGameListener: () => {
        throw new Error('No InfoPanelGraphics.resignGameListener listener was supplied');
    },
    resetGameListener: () => {
        throw new Error('No InfoPanelGraphics.resetGameListener listener was supplied');
    },
    exportGameListener: () => {
        throw new Error('No InfoPanelGraphics.exportGameListener listener was supplied');
    },
    exportBoardLayoutListener: () => {
        throw new Error('No InfoPanelGraphics.exportBoardListener listener was supplied');
    },
};
