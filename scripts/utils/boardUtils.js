import { SQUARE_SIZE, FILES, RANKS, BOARD_OFFSET } from '../constants/boardConstants.js';
import { Placement } from '../models/placement.js';

function positionToPlacement(x, y) {
    const rank = Math.floor((x - BOARD_OFFSET) / SQUARE_SIZE) + 1;
    const file = FILES - Math.floor(Math.abs(y - BOARD_OFFSET + 1) / SQUARE_SIZE);
    return new Placement(file, rank);
}

function placementToPosition(file, rank) {
    const x = (rank - 1) * SQUARE_SIZE + BOARD_OFFSET;
    const y = (FILES - file) * SQUARE_SIZE + BOARD_OFFSET;
    return {
        x,
        y,
    };
}

function rankCharToNumber(rankChar) {
    const upperCaseRank = rankChar.toUpperCase();
    return upperCaseRank.charCodeAt(0) - 64;
}

function rankNumberToChar(rankNumber) {
    return String.fromCharCode(64 + rankNumber);
}

function isOnBoard(file, rank) {
    return file >= 1 && file <= FILES && rank >= 1 && rank <= RANKS;
}

function isLightSquare(file, rank) {
    return (file + rank) % 2 !== 0;
}

export const BoardUtils = {
    positionToPlacement,
    placementToPosition,
    rankCharToNumber,
    rankNumberToChar,
    isOnBoard,
    isLightSquare,
};
