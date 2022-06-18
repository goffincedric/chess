import { GraphicsUtils } from '../utils/graphicsUtils.js';
import { COLORS } from '../constants/boardConstants.js';
import { PieceUtils } from '../utils/pieceUtils.js';

function drawEnemyMoves(p, enemyAttacks, isFlipped) {
    p.noStroke();
    if (enemyAttacks?.length) {
        // Color possible moves
        enemyAttacks.reduce((drawnMoves, move) => {
            // Check if move has not been drawn on board yet
            if (!drawnMoves.some((drawnMove) => drawnMove.file === move.file && drawnMove.rank === move.rank)) {
                // Draw square for move
                GraphicsUtils.drawSquare(p, move.file, move.rank, COLORS.MOVES.ENEMY, isFlipped);
                // Add move to drawn moves
                drawnMoves.push(move);
            }
            return drawnMoves;
        }, []);
    }
}

// Draw potential moves on board for moving piece
function drawMoves(p, pieces, movingPiece, movingPieceMoves, isFlipped) {
    p.noStroke();
    if (movingPiece) {
        try {
            // Color possible moves
            movingPieceMoves.forEach((move) => {
                // Get piece if present
                let piece = PieceUtils.getPieceByPlacement(pieces, move.file, move.rank);
                let rectColor;
                // Set color depending on if there is no piece or if it is an enemy piece
                if (!piece) {
                    rectColor = p.color(COLORS.MOVES.EMPTY);
                } else if (piece.isWhite !== movingPiece.isWhite) {
                    rectColor = p.color(COLORS.MOVES.TAKE_PIECE);
                }

                // If color was set, set square to that color
                if (rectColor) {
                    GraphicsUtils.drawSquare(p, move.file, move.rank, rectColor, isFlipped);
                }
            });

            // Color current square
            GraphicsUtils.drawSquare(p, movingPiece.file, movingPiece.rank, COLORS.MOVES.CURRENT, isFlipped);
        } catch (e) {
            console.warn(`Couldn't generate possible moves for piece ${movingPiece.constructor.name}`, e);
        }
    }
}

export const MoveGraphics = {
    drawEnemyMoves,
    drawMoves,
};
