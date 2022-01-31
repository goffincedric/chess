import { BoardUtils } from './boardUtils.js';

// Can only add defendedPieces if keepSamePieceMoves is set to true
function truncateMoveDirections(moveDirections, pieces, keepSamePieceMoves = false, addAttackedPiece = true, addDefendedPiece = true) {
    // Check if is 2D array
    if (!Array.isArray(moveDirections) || !(Array.isArray(moveDirections[0]) && moveDirections[0].length > 0)) return;

    // Get moving piece
    const movingPiece = moveDirections[0][0]?.movingPiece;
    if (!movingPiece) return;

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

            // Check if attacked piece should be added
            if (moves.length > 0 && addAttackedPiece && foundPiece.isWhite !== movingPiece.isWhite) {
                moves[moves.length - 1].attackedPiece = foundPiece;
            }
            // Check if defended piece should be added
            if (keepSamePieceMoves && moves.length > 0 && addDefendedPiece && foundPiece.isWhite === movingPiece.isWhite) {
                moves[moves.length - 1].defendedPiece = foundPiece;
            }
        }
    });
}

// Remove moves that directly attack enemies
function removeMovesWithEnemies(moves, pieces, movingPiece) {
    const moveIndicesWithEnemies = [];
    // Look for moves where a piece of a different color is present
    moves.forEach((move, index) => {
        const piece = pieces.find((piece) => piece.isWhite !== movingPiece.isWhite && move.file === piece.file && move.rank === piece.rank);
        if (piece) {
            moveIndicesWithEnemies.push(index);
        }
    });

    // Remove moves from back to front
    moveIndicesWithEnemies.reverse();
    moveIndicesWithEnemies.forEach((index) => moves.splice(index, 1));
}

// Remove moves that are not on the chessboard
function removeMovesNotOnBoard(moves) {
    const moveIndicesToRemove = [];
    // Look for moves to that are not on board
    moves.forEach((move, index) => {
        if (!BoardUtils.isOnBoard(move.file, move.rank)) {
            moveIndicesToRemove.push(index);
        }
    });

    // Remove moves from back to front
    moveIndicesToRemove.reverse();
    moveIndicesToRemove.forEach((index) => moves.splice(index, 1));
}

// Keep moves that attack pieces of the same color
function filterSamePieceMoves(moves, pieces, movingPiece) {
    const moveIndicesToRemove = [];
    // Look for moves to remove where a piece of the same color is present
    moves.forEach((move, index) => {
        const piece = pieces.find((piece) => piece.isWhite === movingPiece.isWhite && move.file === piece.file && move.rank === piece.rank);
        if (piece) {
            moveIndicesToRemove.push(index);
        }
    });

    // Remove moves from back to front
    moveIndicesToRemove.reverse();
    moveIndicesToRemove.forEach((index) => moves.splice(index, 1));
}

// Keep moves that attack pieces of a different color
function filterEnemyPieceMoves(moves, pieces, movingPiece) {
    const moveIndicesToRemove = [];
    // Look for moves to remove where a piece of a different color is present
    moves.forEach((move, index) => {
        const piece = pieces.find((piece) => piece.isWhite !== movingPiece.isWhite && move.file === piece.file && move.rank === piece.rank);
        if (!piece) {
            moveIndicesToRemove.push(index);
        }
    });

    // Remove moves from back to front
    moveIndicesToRemove.reverse();
    moveIndicesToRemove.forEach((index) => moves.splice(index, 1));
}

// Flatten a 2D array
function flattenPieceMoves(moves) {
    return Object.values(moves)
        .flat(2)
        .filter((move) => move);
}

// Add attackedPiece and defendedPiece properties to moves
function addAttackedDefendedPiecesToMoves(moves, pieces) {
    moves.forEach((move) => {
        const foundPiece = pieces.find((piece) => piece.file === move.file && piece.rank === move.rank);
        if (foundPiece && foundPiece.isWhite !== move.movingPiece.isWhite) {
            move.attackedPiece = foundPiece;
        }
    });
}

export const MovesUtils = {
    truncateMoveDirections,
    removeMovesWithEnemies,
    removeMovesNotOnBoard,
    filterSamePieceMoves,
    filterEnemyPieceMoves,
    flattenPieceMoves,
    addAttackedDefendedPiecesToMoves,
};
