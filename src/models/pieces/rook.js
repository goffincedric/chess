import { Piece } from './piece.js';
import { PlacementUtils } from '../../utils/placementUtils.js';
import { Move } from '../move.js';
import { PieceTypes } from '../../constants/pieceConstants.js';

export class Rook extends Piece {

    constructor(file, rank, isWhite, isFirstMove = true) {
        super(file, rank, isWhite, 'r', PieceTypes.ROOK,true, isFirstMove);
    }

    getMoves() {
        // Generate placements
        const horizontalPlacements = PlacementUtils.generateHorizontalPlacements(this.file, this.rank);
        const verticalPlacements = PlacementUtils.generateVerticalPlacements(this.file, this.rank);

        // Convert to moves
        const horizontalMoves = horizontalPlacements.map(direction => direction.map(placement => new Move(placement.file, placement.rank, this)));
        const verticalMoves = verticalPlacements.map(direction => direction.map(placement => new Move(placement.file, placement.rank, this)));

        return {
            horizontal: horizontalMoves,
            vertical: verticalMoves,
            diagonal: null,
            nonSlidingMoves: null,
        };
    }
}
