import { BOARD_BORDER_HEIGHT, BOARD_BORDER_STROKE_WIDTH, COLORS, SQUARE_SIZE, TOTAL_BOARD_SIZE } from '../constants/boardConstants.js';
import { INFO_PANEL_DIVIDER_LEFT_WIDTH, INFO_PANEL_DIVIDER_WIDTH, INFO_PANEL_WIDTH } from '../constants/infoPanelConstants.js';
import { MAX_PIECE_COUNT, PieceTypes } from '../constants/pieceConstants.js';
import { AssetUtils } from '../utils/assetUtils.js';

// Set global positions
const textCenterX = TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH / 2;

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

const statsMargin = SQUARE_SIZE / 7;
const playerNameHeight = (SQUARE_SIZE / 7) * 5.5;
const coloredStripeWidth = 5;
function drawPlayer(place, player) {
    noStroke();
    // Define starting y position
    let yOffset = playersYOffset + (place === BOTTOM ? playerStatsHeight : 0);

    // Draw player stripe color
    let stripeColor = player.isWhite ? COLORS.LIGHTER : COLORS.DARKER;
    fill(color(stripeColor));
    rect(TOTAL_BOARD_SIZE + statsMargin, yOffset + statsMargin, coloredStripeWidth, playerStatsHeight - statsMargin * 2);

    // Draw player name
    fill(color(COLORS.LIGHT));
    textSize(playerNameHeight / 2);
    textAlign(LEFT, BASELINE);
    textWrap(CHAR);
    text(
        player.name,
        TOTAL_BOARD_SIZE + statsMargin * 2 + coloredStripeWidth,
        yOffset + statsMargin,
        INFO_PANEL_WIDTH - coloredStripeWidth - statsMargin * 2,
        playerNameHeight,
    );

    // Draw captured pieces
    drawCapturedPieces(yOffset, player.capturedPieces);
}

const piecesOrder = [PieceTypes.PAWN, PieceTypes.ROOK, PieceTypes.KNIGHT, PieceTypes.BISHOP, PieceTypes.QUEEN];
function drawCapturedPieces(playerStatsYPos, capturedPiecesMap) {
    // Add captured pieces text
    const pieceHeight = playerNameHeight / 3;
    const bottomY = playerStatsYPos + playersHeight / 2 - statsMargin;
    const topY = bottomY - pieceHeight;
    noStroke();
    fill(color(COLORS.LIGHT));
    textSize(playerNameHeight / 4);
    textAlign(LEFT, BOTTOM);
    const labelText = 'Captured pieces: ';
    text(labelText, TOTAL_BOARD_SIZE + statsMargin * 2 + coloredStripeWidth, bottomY);

    // Draw captured pieces
    const labelWidth = textWidth(labelText);
    const totalPieceCount = MAX_PIECE_COUNT / 2; // ÷2 for piece count of each side
    const piecesWidth = INFO_PANEL_WIDTH - coloredStripeWidth - statsMargin * 3 - labelWidth;
    const pieceWidth = (piecesWidth - 4 * statsMargin) / totalPieceCount; // 4 stat margins between each piece type
    const piecesXOffset = TOTAL_BOARD_SIZE + coloredStripeWidth + statsMargin * 2 + labelWidth;
    let pieceCount = 0,
        marginCount = 0;
    piecesOrder.forEach((pieceType) => {
        const capturedPiecesOfType = capturedPiecesMap.get(pieceType);
        if (capturedPiecesOfType?.length > 0) {
            const asset = AssetUtils.getAsset(capturedPiecesOfType[0].getAssetUrl());
            capturedPiecesOfType.forEach(() => {
                const xPos = pieceCount * pieceWidth + statsMargin * marginCount;
                image(asset, piecesXOffset + xPos, topY, pieceHeight, pieceHeight);
                pieceCount++;
            });
            marginCount++;
        }
    });
}

// Draw moves on panel
const pastMovesYOffset = playersYOffset + playersHeight;
const pastMovesHeight = SQUARE_SIZE * 3; // TODO: Potentially 4 high?
function drawPastMoves() {
    // TODO: Draw moves textually, wrapping with words
    textWrap(WORD);

    // Draw line below past moves
    stroke(color(COLORS.DARK));
    strokeWeight(INFO_PANEL_DIVIDER_WIDTH);
    line(TOTAL_BOARD_SIZE, pastMovesYOffset + pastMovesHeight, TOTAL_BOARD_SIZE + INFO_PANEL_WIDTH, pastMovesYOffset + pastMovesHeight);
}

// Draw buttons on panel
function drawActionButtons() {
    // TODO:
    //  * GameState === PLAYING: Resign button
    //  * else: Reset game button
    // TODO: Export board button
}

export const InfoPanelGraphics = {
    drawPanel,
    drawTimestamp,
    drawCurrentTurn,
    drawPlayerStats,
    drawPastMoves,
    drawActionButtons,
};
