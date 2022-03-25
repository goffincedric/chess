import { PieceTypes } from '../constants/pieceConstants.js';
import { GameConstants } from '../constants/gameConstants.js';

// Weights
class PieceWeight {
    materialScore;
    mobilityScore;
    placementScore;

    constructor(materialScore, mobilityScore, placementScore) {
        this.materialScore = materialScore;
        this.mobilityScore = mobilityScore;
        this.placementScore = placementScore;
    }
}

const DefaultPieceWeights = {
    [PieceTypes.PAWN]: new PieceWeight(1, 3),
    [PieceTypes.ROOK]: new PieceWeight(10, 14),
    [PieceTypes.KNIGHT]: new PieceWeight(5, 8),
    [PieceTypes.BISHOP]: new PieceWeight(10, 14),
    [PieceTypes.QUEEN]: new PieceWeight(50, 28),
    [PieceTypes.KING]: new PieceWeight(100, 9),
};

function evaluateRandom() {
    // Generate number with range: [-50, 50]
    return Math.round(Math.random() * 100) - 50;
}
function evaluateStatic() {
    // Return static value
    return 1;
}

/**
 * Evaluate pieces based on material and mobility weights
 * @param {Board} chessBoard
 * @param {boolean} isMaximizingPlayer
 * @param {boolean} ownPiecesOnly
 * @return {number}
 */
function evaluateBoardByPieces(chessBoard, isMaximizingPlayer, ownPiecesOnly = false) {
    if (chessBoard.gameState === GameConstants.States.CHECKMATE) {
        if (isMaximizingPlayer) {
            return Number.MIN_SAFE_INTEGER;
        } else {
            return Number.MAX_SAFE_INTEGER;
        }
    }

    // Get pieces to evaluate
    let piecesToEvaluate = chessBoard.pieces;
    if (ownPiecesOnly) {
        piecesToEvaluate = piecesToEvaluate.filter((pieces) => pieces.isWhite === chessBoard.isWhiteTurn);
    }

    // Evaluate score based on pieces and return
    return piecesToEvaluate.reduce((score, currentPiece) => {
        const pieceWeight = DefaultPieceWeights[currentPiece.TYPE];
        const pieceScore = pieceWeight.materialScore + pieceWeight.mobilityScore;
        if (currentPiece.isWhite !== chessBoard.isWhiteTurn) {
            return score - pieceScore;
        } else {
            return score + pieceScore;
        }
    }, 0);
}

export const EvaluationFunctions = {
    node_count: 0,
    evaluateRandom,
    evaluateStatic,
    evaluateBoardByPieces,
};
