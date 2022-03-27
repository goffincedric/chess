import { Piece } from './piece.js';
import { PlacementUtils } from '../../utils/placementUtils.js';
import { Move } from '../move.js';
import { PieceTypes } from '../../constants/pieceConstants.js';

export class Bishop extends Piece {

    constructor(file, rank, isWhite, isFirstMove = true) {
        super(file, rank, isWhite, 'b',PieceTypes.BISHOP, true, isFirstMove);
    }

    getMoves() {
        // Generate placements
        const diagonalDirections = PlacementUtils.generateDiagonalPlacements(this.file, this.rank);

        // Convert to moves
        const diagonalMoves = diagonalDirections.map(diagonalDirection => diagonalDirection.map(placement => new Move(placement.file, placement.rank, this)));

        return {
            horizontal: null,
            vertical: null,
            diagonal: diagonalMoves,
            nonSlidingMoves: null,
        };
    }
}
