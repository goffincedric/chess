import { Piece } from './piece.js';
import { Placement } from '../placement.js';
import { Move } from '../move.js';
import { PieceTypes } from '../../constants/pieceConstants.js';

export class Pawn extends Piece {
    promotionFile;

    TYPE = PieceTypes.PAWN;

    constructor(file, rank, isWhite, isFirstMove = true) {
        super(file, rank, isWhite, 'p', true, isFirstMove);
        this.promotionFile = this.isWhite ? 8 : 1;
    }

    getMoves() {
        // Check directionality & limit
        const offset = this.isWhite ? 1 : -1;

        // Generate vertical placements
        const verticalPlacements = [new Placement(this.file + 1 * offset, this.rank)];
        if (this.isFirstMove) {
            verticalPlacements.push(new Placement(this.file + 2 * offset, this.rank));
        }
        // Convert placements to moves
        const verticalMoves = verticalPlacements.map((placement) => new Move(placement.file, placement.rank, this, false));

        // Pawn capture moves
        const diagonalMoves = this.getAttackingSpaces().map((placement) => [new Move(placement.file, placement.rank, this)]);

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
        return [new Placement(this.file + 1 * offset, this.rank + 1), new Placement(this.file + 1 * offset, this.rank - 1)];
    }

    getEnPassantSpaces() {
        // Get spaces to check for en passant pieces and return
        return [new Placement(this.file, this.rank + 1), new Placement(this.file, this.rank - 1)];
    }
}
