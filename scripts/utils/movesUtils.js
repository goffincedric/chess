import { BoardUtils } from './boardUtils.js';

function generateHorizontalMoves(currentFile, currentRank, limit) {
    let horizontals = [];
    let count, rankOffset, rank, moves;
    for (let i = 0; i < 2; i++) {
        // Reset rank and moves
        rank = null;
        moves = [];

        // Calculate rank offset
        rankOffset = i % 2 ? -1 : 1;

        // Generate moves until not on board anymore
        count = 0;
        do {
            // Add previous placement to moves
            if (rank) {
                moves.push({ file: currentFile, rank });
            }

            // Calculate new placement
            count++;
            rank = currentRank + count * rankOffset;
        } while (BoardUtils.isOnBoard(currentFile, rank) && (!limit || count <= limit));
        horizontals.push(moves);
    }

    return horizontals;
}

function generateVerticalMoves(currentFile, currentRank, limit) {
    let verticals = [];
    let count, fileOffset, file, moves;
    for (let i = 0; i < 2; i++) {
        // Reset file and moves
        file = null;
        moves = [];

        // Calculate file offset
        fileOffset = i % 2 ? -1 : 1;

        // Generate moves until not on board anymore
        count = 0;
        do {
            // Add previous placement to moves
            if (file) {
                moves.push({ file, rank: currentRank });
            }

            // Calculate new placement
            count++;
            file = currentFile + count * fileOffset;
        } while (BoardUtils.isOnBoard(file, currentRank) && (!limit || count <= limit));
        verticals.push(moves);
    }

    return verticals;
}

function generateDiagonalMoves(currentFile, currentRank, limit) {
    let diagonals = [];
    let count, fileOffset, rankOffset, file, rank, moves;
    for (let i = 0; i < 4; i++) {
        // Reset file, rank and moves
        file = null;
        rank = null;
        moves = [];

        // Calculate offsets
        fileOffset = i % 2 ? -1 : 1;
        rankOffset = i >= 2 ? -1 : 1;

        // Generate moves until not on board anymore
        count = 0;
        do {
            // Add previous placement to moves
            if (file && rank) {
                moves.push({ file, rank });
            }

            // Calculate new placement
            count++;
            file = currentFile + count * fileOffset;
            rank = currentRank + count * rankOffset;
        } while (BoardUtils.isOnBoard(file, rank) && (!limit || count <= limit));
        diagonals.push(moves);
    }

    return diagonals;
}

export const MovesUtils = {
    generateHorizontalMoves,
    generateVerticalMoves,
    generateDiagonalMoves,
};
