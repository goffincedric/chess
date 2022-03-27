import { Piece } from './piece.js';
import { PlacementUtils } from '../../utils/placementUtils.js';
import { Move } from '../move.js';
import { PieceTypes } from '../../constants/pieceConstants.js';

export class King extends Piece {

    constructor(file, rank, isWhite, isFirstMove = true) {
        super(file, rank, isWhite, 'k', PieceTypes.KING, true, isFirstMove);
    }

    getMoves() {
        // Generate placements
        let horizontalPlacements = PlacementUtils.generateHorizontalPlacements(this.file, this.rank, 1);
        let verticalPlacements = PlacementUtils.generateVerticalPlacements(this.file, this.rank, 1);
        let diagonalPlacements = PlacementUtils.generateDiagonalPlacements(this.file, this.rank, 1);

        // Convert to moves
        const horizontalMoves = horizontalPlacements.map(diagonalDirection => diagonalDirection.map(placement => new Move(placement.file, placement.rank, this)));
        const verticalMoves = verticalPlacements.map(diagonalDirection => diagonalDirection.map(placement => new Move(placement.file, placement.rank, this)));
        const diagonalMoves = diagonalPlacements.map(diagonalDirection => diagonalDirection.map(placement => new Move(placement.file, placement.rank, this)));

        // Return categorised moves
        return {
            horizontal: horizontalMoves,
            vertical: verticalMoves,
            diagonal: diagonalMoves,
            nonSlidingMoves: null,
        };
    }
}
