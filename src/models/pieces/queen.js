import { Piece } from './piece.js';
import { PlacementUtils } from '../../utils/placementUtils.js';
import { Move } from '../move.js';
import { PieceTypes } from '../../constants/pieceConstants.js';

export class Queen extends Piece {

    constructor(file, rank, isWhite, isFirstMove = true) {
        super(file, rank, isWhite, 'q', PieceTypes.QUEEN,true, isFirstMove);
    }

    getMoves() {
        // Generate moves
        let horizontalPlacements = PlacementUtils.generateHorizontalPlacements(this.file, this.rank);
        let verticalPlacements = PlacementUtils.generateVerticalPlacements(this.file, this.rank);
        let diagonalPlacements = PlacementUtils.generateDiagonalPlacements(this.file, this.rank);

        // Convert to moves
        const horizontalMoves = horizontalPlacements.map(direction => direction.map(placement => new Move(placement.file, placement.rank, this)));
        const verticalMoves = verticalPlacements.map(direction => direction.map(placement => new Move(placement.file, placement.rank, this)));
        const diagonalMoves = diagonalPlacements.map(direction => direction.map(placement => new Move(placement.file, placement.rank, this)));

        // Return categorised moves
        return {
            horizontal: horizontalMoves,
            vertical: verticalMoves,
            diagonal: diagonalMoves,
            nonSlidingMoves: null,
        };
    }
}
