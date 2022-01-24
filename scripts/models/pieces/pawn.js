import { Piece } from './piece.js';

export class Pawn extends Piece {
    constructor(file, rank, isWhite, isFirstMove = true) {
        super(file, rank, isWhite, 'p', true, isFirstMove);
    }

    getMoves() {
        // Check directionality & limit
        const offset = this.isWhite ? 1 : -1;

        // Generate vertical moves
        const verticalMoves = [];
        verticalMoves.push({ file: this.file + 1 * offset, rank: this.rank });
        if (this.isFirstMove) {
            verticalMoves.push({ file: this.file + 2 * offset, rank: this.rank });
        }

        // Pawn capture
        const diagonalMoves = this.getAttackingSpaces().map((move) => [move]);

        // Return categorised moves
        return {
            horizontal: null,
            vertical: [verticalMoves],
            diagonal: diagonalMoves,
            nonSlidingMoves: null,
        };
    }

    getAttackingSpaces() {
        // Check directionality & limit
        const offset = this.isWhite ? 1 : -1;

        // Get attacking spaces and return
        return [
            { file: this.file + 1 * offset, rank: this.rank + 1 },
            { file: this.file + 1 * offset, rank: this.rank - 1 },
        ];
    }

    getEnPassantSpaces() {
        // Get attacking spaces and return
        return [
            { file: this.file, rank: this.rank + 1 },
            { file: this.file, rank: this.rank - 1 },
        ];
    }
}
