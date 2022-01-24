import { BoardUtils } from './boardUtils.js';

function generateHorizontalMoves(currentFile, currentRank, limit, includeCurrentPlacement = false) {
    let horizontals = [];
    let count, rankOffset, rank, moves;
    for (let i = 0; i < 2; i++) {
        // Reset rank and moves
        rank = null;
        moves = [];

        // Calculate rank offset
        rankOffset = i % 2 ? -1 : 1;

        // Generate moves until not on board anymore
        count = includeCurrentPlacement ? -1 : 0;
        do {
            // Add previous placement to moves
            if (rank) moves.push({ file: currentFile, rank });

            // Calculate new placement
            count++;
            rank = currentRank + count * rankOffset;
        } while (BoardUtils.isOnBoard(currentFile, rank) && (!limit || count <= limit));
        // Check for moves to add
        if (moves.length) horizontals.push(moves);
    }

    return horizontals;
}

function generateVerticalMoves(currentFile, currentRank, limit, includeCurrentPlacement = false) {
    let verticals = [];
    let count, fileOffset, file, moves;
    for (let i = 0; i < 2; i++) {
        // Reset file and moves
        file = null;
        moves = [];

        // Calculate file offset
        fileOffset = i % 2 ? -1 : 1;

        // Generate moves until not on board anymore
        count = includeCurrentPlacement ? -1 : 0;
        do {
            // Add previous placement to moves
            if (file) moves.push({ file, rank: currentRank });

            // Calculate new placement
            count++;
            file = currentFile + count * fileOffset;
        } while (BoardUtils.isOnBoard(file, currentRank) && (!limit || count <= limit));
        // Check for moves to add
        if (moves.length) verticals.push(moves);
    }

    return verticals;
}

function generateDiagonalMoves(currentFile, currentRank, limit, includeCurrentPlacement = false) {
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
        count = includeCurrentPlacement ? -1 : 0;
        do {
            // Add previous placement to moves
            if (file && rank) moves.push({ file, rank });

            // Calculate new placement
            count++;
            file = currentFile + count * fileOffset;
            rank = currentRank + count * rankOffset;
        } while (BoardUtils.isOnBoard(file, rank) && (!limit || count <= limit));
        // Check for moves to add
        if (moves.length) diagonals.push(moves);
    }

    return diagonals;
}

function generateHorizontalMovesBetween(currentFile, rank1, rank2, includePlacement1, includePlacement2) {
    // Calculate smallest rank, largest rank and limit
    const minRank = Math.min(rank1, rank2);
    const maxRank = Math.max(rank1, rank2);
    const limit = maxRank - minRank;

    // Check if placements are the same and at least 1 placement is included
    if (limit === 0 && (includePlacement1 || includePlacement2)) return [{ file: currentFile, rank: rank1 }];

    // Generate spaces for each horizontal direction, starting from rank1
    const horizontalDirections = generateHorizontalMoves(currentFile, rank1, limit, includePlacement1);

    // Get direction pointing to rank2
    const horizontalSpaces = horizontalDirections.find((directionSpaces) => directionSpaces.some((space) => space.rank === rank2));

    // Check if placement with rank2 needs to be included
    if (!includePlacement2) horizontalSpaces.pop();

    // Return generates spaces
    return horizontalSpaces ?? [];
}

function generateVerticalMovesBetween(currentRank, file1, file2, includePlacement1, includePlacement2) {
    // Calculate smallest file, largest file and limit
    const minFile = Math.min(file1, file2);
    const maxFile = Math.max(file1, file2);
    const limit = maxFile - minFile;

    // Check if placements are the same and at least 1 placement is included
    if (limit === 0 && (includePlacement1 || includePlacement2)) return [{ file: file1, rank: currentRank }];

    // Generate spaces for each vertical direction, starting from file1
    const verticalDirections = generateVerticalMoves(file1, currentRank, limit, includePlacement1);

    // Get direction pointing to file2
    const verticalSpaces = verticalDirections.find((directionSpaces) => directionSpaces.some((space) => space.file === file2));

    // Check if placement with file2 needs to be included
    if (!includePlacement2) verticalSpaces?.pop();

    // Return generates spaces
    return verticalSpaces ?? [];
}

function generateDiagonalMovesBetween(file1, rank1, file2, rank2, includePlacement1, includePlacement2) {
    // Calculate smallest file and rank, largest file and rank and difference between ranks and files
    const minFile = Math.min(file1, file2);
    const maxFile = Math.max(file1, file2);
    const minRank = Math.min(rank1, rank2);
    const maxRank = Math.max(rank1, rank2);
    const dFile = maxFile - minFile;
    const dRank = maxRank - minRank;

    // Check if difference between ranks and files is not the same (rectangle, therefore not a straight diagonal)
    if (dFile !== dRank) return [];

    // Check if placements are the same and at least 1 placement is included
    if (dFile === 0 && (includePlacement1 || includePlacement2)) return [{ file: file1, rank: rank1 }];

    // Generate spaces for each diagonal direction, starting from file1 and rank1
    const diagonalDirections = generateDiagonalMoves(file1, rank1, dFile, includePlacement1);

    // Get direction pointing to file2 and rank 2
    const diagonalSpaces = diagonalDirections.find((directionSpaces) =>
        directionSpaces.some((space) => space.file === file2 && space.rank === rank2),
    );

    // Check if placement with file2 and rank2 needs to be included
    if (!includePlacement2) diagonalSpaces?.pop();

    // Return generates spaces
    return diagonalSpaces ?? [];
}

function generateMovesBetweenPlacements(file1, rank1, file2, rank2, includePlacement1, includePlacement2) {
    // Calculate smallest file and rank, largest file and rank and difference between ranks and files
    const minFile = Math.min(file1, file2);
    const maxFile = Math.max(file1, file2);
    const minRank = Math.min(rank1, rank2);
    const maxRank = Math.max(rank1, rank2);
    const dFile = maxFile - minFile;
    const dRank = maxRank - minRank;

    // Check if is horizontal move
    if (dFile === 0 && dRank > 0) {
        return generateHorizontalMovesBetween(file1, rank1, rank2, includePlacement1, includePlacement2);
    } else if (dFile > 0 && dRank === 0) {
        // Check if is vertical move
        return generateVerticalMovesBetween(rank1, file1, file2, includePlacement1, includePlacement2);
    } else {
        return generateDiagonalMovesBetween(file1, rank1, file2, rank2, includePlacement1, includePlacement2);
    }
}

function truncateMoveDirections(moveDirections, pieces, movingPiece, keepSamePieceMoves = false) {
    // Loop over directions
    let foundPiece, count;
    moveDirections.forEach((moves) => {
        // Reset values
        foundPiece = null;
        count = 0;

        // Loop until piece is found or moves are exhausted
        do {
            // Check if move placement contains piece
            foundPiece = pieces.find((piece) => piece.file === moves[count].file && piece.rank === moves[count].rank);

            // Increment counter
            count++;
        } while (!foundPiece && count < moves.length);

        // Check if piece was found
        if (foundPiece) {
            if (!keepSamePieceMoves && foundPiece.isWhite === movingPiece.isWhite) {
                count--;
            }
            moves.splice(count);
        }
    });
}

function removeMovesWithEnemies(moves, pieces, movingPiece) {
    const moveIndicesWithEnemies = [];
    // Look for moves where a piece of a different color is present
    moves.forEach((move) => {
        const piece = pieces.find((piece) => piece.isWhite !== movingPiece.isWhite && move.file === piece.file && move.rank === piece.rank);
        if (piece) {
            moveIndicesWithEnemies.push(moves.indexOf(move));
        }
    });

    // Remove moves from back to front
    moveIndicesWithEnemies.reverse();
    moveIndicesWithEnemies.forEach((index) => moves.splice(index, 1));
}

function filterSamePieceMoves(moves, pieces, movingPiece) {
    const moveIndicesToRemove = [];
    // Look for moves to remove where a piece of the same color is present
    moves.forEach((move) => {
        const piece = pieces.find((piece) => piece.isWhite === movingPiece.isWhite && move.file === piece.file && move.rank === piece.rank);
        if (piece) {
            moveIndicesToRemove.push(moves.indexOf(move));
        }
    });

    // Remove moves from back to front
    moveIndicesToRemove.reverse();
    moveIndicesToRemove.forEach((index) => moves.splice(index, 1));
}

function filterEnemyPieceMoves(moves, pieces, movingPiece) {
    const moveIndicesToRemove = [];
    // Look for moves to remove where a piece of a different color is present
    moves.forEach((move) => {
        const piece = pieces.find((piece) => piece.isWhite !== movingPiece.isWhite && move.file === piece.file && move.rank === piece.rank);
        if (!piece) {
            moveIndicesToRemove.push(moves.indexOf(move));
        }
    });

    // Remove moves from back to front
    moveIndicesToRemove.reverse();
    moveIndicesToRemove.forEach((index) => moves.splice(index, 1));
}

// Remove moves that have duplicate placements
function removeDuplicateMoves(moves) {
    const moveIndicesToRemove = [];
    moves.reduce((visitedMoves, move, index) => {
        if (visitedMoves.some((visitedMove) => visitedMove.file === move.file && visitedMove.rank === move.rank)) {
            moveIndicesToRemove.push(index);
        } else {
            visitedMoves.push(move);
        }
        return visitedMoves;
    }, []);

    // Remove moves from back to front
    moveIndicesToRemove.reverse();
    moveIndicesToRemove.forEach((index) => moves.splice(index, 1));
}

// Filter moves that attack pieces of the same color
function filterMovesInCommon(moves, movesToCheck, keepMoves) {
    const moveIndicesToRemove = [];
    moves.forEach((move, index) => {
        const containsDuplicate = movesToCheck.some((moveToCheck) => moveToCheck.file === move.file && moveToCheck.rank === move.rank);
        // ^ is XOR, simplified: !keepMoves && containsDuplicate || keepMoves && !containsDuplicate
        if (keepMoves ^ containsDuplicate) {
            moveIndicesToRemove.push(index);
        }
    });

    // Remove moves from back to front
    moveIndicesToRemove.reverse();
    moveIndicesToRemove.forEach((index) => moves.splice(index, 1));
}

function hasMovesInCommon(moves, movesToCheck) {
    return moves.some(move => movesToCheck.some(moveToCheck => moveToCheck.file === move.file && moveToCheck.rank === move.rank));
}

export const MovesUtils = {
    generateHorizontalMoves,
    generateVerticalMoves,
    generateDiagonalMoves,
    generateHorizontalMovesBetween,
    generateVerticalMovesBetween,
    generateDiagonalMovesBetween,
    generateMovesBetweenPlacements,
    truncateMoveDirections,
    removeMovesWithEnemies,
    filterSamePieceMoves,
    filterEnemyPieceMoves,
    removeDuplicateMoves,
    filterMovesInCommon,
    hasMovesInCommon,
};
