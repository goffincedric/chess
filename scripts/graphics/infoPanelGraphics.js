import {
    BOARD_BORDER_HEIGHT,
    BOARD_BORDER_STROKE_WIDTH,
    BOARD_OFFSET,
    COLORS,
    SQUARE_SIZE,
    TOTAL_BOARD_SIZE,
} from '../constants/boardConstants.js';
import {
    INFO_PANEL_DIVIDER_LEFT_WIDTH,
    INFO_PANEL_DIVIDER_WIDTH,
    INFO_PANEL_WIDTH,
} from '../constants/infoPanelConstants.js';
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
function drawPanel(p) {
    // Draw background
    p.noStroke();
    p.fill(p.color(COLORS.INFO_PANEL.BACKGROUND));
    p.rect(TOTAL_BOARD_SIZE, 0, INFO_PANEL_WIDTH, TOTAL_BOARD_SIZE);

    // Draw separating line
    p.stroke(p.color(COLORS.DARKER));
    p.strokeWeight(INFO_PANEL_DIVIDER_LEFT_WIDTH);
    p.line(TOTAL_BOARD_SIZE, 0, TOTAL_BOARD_SIZE, TOTAL_BOARD_SIZE);
}

// Draw timestamp on panel
const timeStampYOffset = BOARD_BORDER_HEIGHT + BOARD_BORDER_STROKE_WIDTH;
function drawTimestamp(p) {
    // Draw timestamp text
    p.noStroke();
    p.textSize(timeStampYOffset / 2);
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(p.color(COLORS.LIGHTER));
    p.text(timestampText, textCenterX, timeStampYOffset / 2);

    // Draw line below timestamp
    p.stroke(p.color(COLORS.DARK));
    p.strokeWeight(INFO_PANEL_DIVIDER_WIDTH);
    p.line(TOTAL_BOARD_SIZE, timeStampYOffset, TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH, timeStampYOffset);
}

// Draw current turn on panel
const currentTurnYOffset = timeStampYOffset;
const currentTurnHeight = SQUARE_SIZE;
function drawCurrentTurn(p, isWhiteTurn) {
    // Draw current turn text
    p.noStroke();
    p.textSize(SQUARE_SIZE / 3);
    p.textAlign(p.CENTER, p.CENTER);
    p.fill(p.color(COLORS.LIGHTER));
    let turnText = `Current turn: ${isWhiteTurn ? 'White' : 'Black'}`;
    p.text(turnText, textCenterX, currentTurnYOffset + currentTurnHeight / 2);

    // Draw line below text
    p.stroke(p.color(COLORS.DARK));
    p.strokeWeight(INFO_PANEL_DIVIDER_WIDTH);
    p.line(
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
function drawPlayerStats(p, player1, player2) {
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
    drawPlayer(p, p.TOP, topPlayer);
    drawPlayer(p, p.BOTTOM, bottomPlayer);

    // Draw line between players
    const strokeMargin = 10;
    p.stroke(p.color(COLORS.DARK));
    p.strokeWeight(INFO_PANEL_DIVIDER_WIDTH - 1);
    p.line(
        TOTAL_BOARD_SIZE + strokeMargin,
        playersYOffset + playerStatsHeight,
        TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH - strokeMargin,
        playersYOffset + playerStatsHeight,
    );

    // Draw line below player stats
    p.stroke(p.color(COLORS.DARK));
    p.strokeWeight(INFO_PANEL_DIVIDER_WIDTH);
    p.line(TOTAL_BOARD_SIZE, playersYOffset + playersHeight, TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH, playersYOffset + playersHeight);
}

const playerNameHeight = (SQUARE_SIZE / 7) * 5.5;
const coloredStripeWidth = 5;
function drawPlayer(p, place, player) {
    p.noStroke();
    // Define starting y position
    let yOffset = playersYOffset + (place === p.BOTTOM ? playerStatsHeight : 0);

    // Draw player stripe color
    let stripeColor = player.isWhite ? COLORS.LIGHTER : COLORS.DARKER;
    p.fill(p.color(stripeColor));
    p.rect(TOTAL_BOARD_SIZE + marginWidth, yOffset + marginWidth, coloredStripeWidth, playerStatsHeight - marginWidth * 2);

    // Draw player name
    p.fill(p.color(COLORS.LIGHTER));
    p.textSize(playerNameHeight / 2);
    p.textAlign(p.LEFT, p.BASELINE);
    if (p.textWrap) {
        p.textWrap(p.CHAR);
    }
    p.text(
        player.name,
        TOTAL_BOARD_SIZE + marginWidth * 2 + coloredStripeWidth,
        yOffset + marginWidth,
        INFO_PANEL_WIDTH - coloredStripeWidth - marginWidth * 2,
        playerNameHeight,
    );

    // Draw captured pieces
    drawCapturedPieces(p, yOffset, player.capturedPieces);
}

const piecesOrder = [PieceTypes.PAWN, PieceTypes.ROOK, PieceTypes.KNIGHT, PieceTypes.BISHOP, PieceTypes.QUEEN];
function drawCapturedPieces(p, playerStatsYPos, capturedPiecesMap) {
    // Add captured pieces text
    const pieceHeight = playerNameHeight / 3;
    const bottomY = playerStatsYPos + playersHeight / 2 - marginWidth;
    const topY = bottomY - pieceHeight;
    p.noStroke();
    p.fill(p.color(COLORS.LIGHTER));
    p.textSize(playerNameHeight / 4);
    p.textAlign(p.LEFT, p.BOTTOM);
    const labelText = 'Captured pieces: ';
    p.text(labelText, TOTAL_BOARD_SIZE + marginWidth * 2 + coloredStripeWidth, bottomY);

    // Draw captured pieces
    const labelWidth = p.textWidth(labelText);
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
                p.image(asset, piecesXOffset + xPos, topY, pieceHeight, pieceHeight);
                pieceCount++;
            });
            marginCount++;
        }
    });
}

// Draw moves on panel
const pastMovesYOffset = playersYOffset + playersHeight;
const pastMovesHeight = SQUARE_SIZE * 4; // TODO: Potentially 4 high?
function drawPastMoves(p, moves) {
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
    p.noStroke();
    p.fill(p.color(COLORS.LIGHTER));
    if (p.textWrap) {
        p.textWrap(p.WORD);
    }
    p.textSize((SQUARE_SIZE / 7 - (marginWidth * 2) / 7) * 1.44);
    p.textAlign(p.LEFT, p.TOP);
    p.text(movesText, xPos, yPos, width, height);

    // Draw line below past moves
    p.stroke(p.color(COLORS.DARK));
    p.strokeWeight(INFO_PANEL_DIVIDER_WIDTH);
    p.line(TOTAL_BOARD_SIZE, pastMovesYOffset + pastMovesHeight, TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH, pastMovesYOffset + pastMovesHeight);
}

// Draw buttons on panel
const infoPanelButtonListeners = [];
const actionButtonsYOffset = pastMovesYOffset + pastMovesHeight;
const actionButtonsHeight = SQUARE_SIZE + BOARD_OFFSET;
let exportFENTimeoutId, exportPGNTimeoutId;
const copiedLabel = 'Copied to clipboard';
function drawActionButtons(p, canResign, canReset) {
    const buttonWidth = INFO_PANEL_WIDTH / 2 - marginWidth * 2;
    const buttonHeight = actionButtonsHeight / 2 - marginWidth * 2;
    if (canResign) {
        addButton(
            p,
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
            p,
            'Reset game',
            TOTAL_BOARD_SIZE + marginWidth,
            TOTAL_BOARD_SIZE - marginWidth - buttonHeight,
            buttonWidth,
            buttonHeight,
            InfoPanelGraphics.resetGameListener,
        );
    }
    addButton(
        p,
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
        p,
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

function addButton(p, buttonText, x, y, width, height, clickListener) {
    let x1 = x;
    let y1 = y;
    let x2 = x + width;
    let y2 = y + height;

    // Draw box
    p.strokeWeight(2);
    p.stroke(p.color(COLORS.DARK));
    if (CanvasUtils.isPositionBetweenCoordinates(p.mouseX, p.mouseY, x1, y1, x2, y2)) {
        p.fill(p.color(COLORS.BUTTON_HOVER));
    } else {
        p.fill(p.color(COLORS.LIGHT));
    }
    p.rect(x1, y1, width, height);

    // Draw text
    p.noStroke();
    p.fill(p.color(COLORS.DARK));
    p.textAlign(p.CENTER, p.CENTER);
    p.text(buttonText, x + width / 2, y + height / 2);

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

function checkInfoPanelActions(p) {
    // Look for dialog button click listeners
    infoPanelButtonListeners.forEach((listener) => {
        if (CanvasUtils.isPositionBetweenCoordinates(p.mouseX, p.mouseY, listener.x1, listener.y1, listener.x2, listener.y2)) {
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
