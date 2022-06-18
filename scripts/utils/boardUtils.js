import { SQUARE_SIZE, FILES, RANKS, BOARD_OFFSET, BOARD_SIZE } from '../constants/boardConstants.js';
import { Placement } from '../models/placement.js';
import { Position } from '../models/position.js';

function positionToPlacement(x, y, isFlipped) {
    let normalizedX = x;
    let normalizedY = y;
    if (isFlipped) {
        normalizedX = BOARD_OFFSET * 2 + BOARD_SIZE - x;
        normalizedY = BOARD_OFFSET * 2 + BOARD_SIZE - y;
    }
    const file = Math.floor((normalizedX - BOARD_OFFSET) / SQUARE_SIZE) + 1;
    const rank = RANKS - Math.floor(Math.abs(normalizedY - BOARD_OFFSET + 1) / SQUARE_SIZE);
    return new Placement(file, rank);
}

function placementToPosition(file, rank, isFlipped) {
    let normalizedRank = rank;
    let normalizedFile = file;
    if (isFlipped) {
        normalizedRank = RANKS - rank + 1;
        normalizedFile = FILES - file + 1;
    }
    const x = (normalizedFile - 1) * SQUARE_SIZE + BOARD_OFFSET;
    const y = (RANKS - normalizedRank) * SQUARE_SIZE + BOARD_OFFSET;
    return new Position(x, y);
}

function fileCharToNumber(fileChar) {
    if (fileChar) {
        const upperCaseFile = fileChar.toUpperCase();
        return upperCaseFile.charCodeAt(0) - 64;
    }
    return null;
}

function fileNumberToChar(fileNumber) {
    return String.fromCharCode(64 + fileNumber);
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
    fileCharToNumber,
    fileNumberToChar,
    isOnBoard,
    isLightSquare,
};
