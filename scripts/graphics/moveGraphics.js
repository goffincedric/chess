import { GraphicsUtils } from '../utils/graphicsUtils.js';
import { COLORS } from '../constants/boardConstants.js';
import { PieceUtils } from '../utils/pieceUtils.js';

function drawEnemyMoves(enemyAttacks) {
    noStroke();
    if (enemyAttacks?.length) {
        // Color possible moves
        enemyAttacks.reduce((drawnMoves, move) => {
            // Check if move has not been drawn on board yet
            if (!drawnMoves.some((drawnMove) => drawnMove.file === move.file && drawnMove.rank === move.rank)) {
                // Draw square for move
                GraphicsUtils.drawSquare(move.file, move.rank, COLORS.MOVES.ENEMY);
                // Add move to drawn moves
                drawnMoves.push(move);
            }
            return drawnMoves;
        }, []);
    }
}

// Draw potential moves on board for moving piece
function drawMoves(pieces, movingPiece, movingPieceMoves) {
    noStroke();
    if (movingPiece) {
        try {
            // Color possible moves
            movingPieceMoves.forEach((move) => {
                // Get piece if present
                let piece = PieceUtils.getPieceByPlacement(pieces, move.file, move.rank);
                let rectColor;
                // Set color depending on if there is no piece or it is an enemy piece
                if (!piece) {
                    rectColor = color(COLORS.MOVES.EMPTY);
                } else if (piece.isWhite !== movingPiece.isWhite) {
                    rectColor = color(COLORS.MOVES.TAKE_PIECE);
                }

                // If color was set, set square to that color
                if (rectColor) {
                    GraphicsUtils.drawSquare(move.file, move.rank, rectColor);
                }
            });

            // Color current square
            GraphicsUtils.drawSquare(movingPiece.file, movingPiece.rank, COLORS.MOVES.CURRENT);
        } catch (e) {
            console.warn(`Couldn't generate possible moves for piece ${movingPiece.constructor.name}`, e);
        }
    }
}

export const MoveGraphics = {
    drawEnemyMoves,
    drawMoves,
};
