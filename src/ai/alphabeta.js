import { Placement } from '../models/placement.js';

/**
 * @callback evaluateFunction
 * @param {Board} chessBoard
 * @param {boolean} isMaximizingPlayer
 */

/**
 * Initial call: alphabeta(chessBoard, depth, evaluateFunction);
 * https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning#Pseudocode
 *
 * @param {Board} chessBoard
 * @param {number} depthToExplore
 * @param {number} alpha
 * @param {number} beta
 * @param {evaluateFunction} evaluateFunction
 * @param {boolean} isMaximizingPlayer
 * @return {number}
 */
export function alphabeta(
    chessBoard,
    depthToExplore,
    evaluateFunction,
    alpha = Number.MIN_SAFE_INTEGER,
    beta = Number.MAX_SAFE_INTEGER,
    isMaximizingPlayer = true,
) {
    // Check if we need to explore further
    if (depthToExplore === 0 || chessBoard.currentPlayerMoves.length === 0) {
        // Evaluate board and return the heuristic value
        return evaluateFunction(chessBoard, isMaximizingPlayer);
    }

    // Check if we need to minimize or maximize
    let heuristic, comparisonAction;
    if (isMaximizingPlayer) {
        heuristic = Number.MIN_SAFE_INTEGER;
        comparisonAction = Math.max;
    } else {
        heuristic = Number.MAX_SAFE_INTEGER;
        comparisonAction = Math.min;
    }

    // Explore possible moves
    for (let moveToExplore of chessBoard.currentPlayerMoves) {
        // Set moving piece
        const pieceToMove = chessBoard.getPieceByPlacement(moveToExplore.movingPiece.file, moveToExplore.movingPiece.rank);
        chessBoard.setMovingPiece(pieceToMove);
        // Execute move
        chessBoard.movePiece(new Placement(moveToExplore.file, moveToExplore.rank));
        // Recurse current state and take maximum of current best heuristic and new heuristic
        heuristic = comparisonAction(
            heuristic,
            alphabeta(chessBoard, depthToExplore - 1, evaluateFunction, alpha, beta, !isMaximizingPlayer),
        );
        // Undo move
        chessBoard.undoLastMove();

        // Alpha-beta pruning
        if ((isMaximizingPlayer && heuristic >= beta) || (!isMaximizingPlayer && heuristic <= alpha)) break;

        // Set new alpha
        if (isMaximizingPlayer) {
            alpha = comparisonAction(alpha, heuristic);
        } else {
            beta = comparisonAction(beta, heuristic);
        }
    }

    // Return best possible heuristic
    return heuristic;
}
