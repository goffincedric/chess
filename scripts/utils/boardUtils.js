import { FILE_SIZE, FILES, RANK_SIZE, RANKS } from '../constants/boardConstants.js';

function positionToPlacement(x, y) {
    const rank = Math.floor(x / RANK_SIZE) + 1;
    const file = FILES - Math.floor(Math.abs(y + 1) / FILE_SIZE);
    return {
        rank,
        file,
    };
}
function placementToPosition(file, rank) {
    const x = (rank - 1) * RANK_SIZE;
    const y = (FILES - file) * FILE_SIZE;
    return {
        x,
        y,
    };
}

function isOnBoard(file, rank) {
    return file >= 1 && file <= FILES && rank >= 1 && rank <= RANKS;
}

export const BoardUtils = {
    positionToPlacement,
    placementToPosition,
    isOnBoard,
};
