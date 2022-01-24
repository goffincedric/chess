import { Piece } from './piece.js';
import { MovesUtils } from '../../utils/movesUtils.js';

export class Queen extends Piece {
    constructor(file, rank, isWhite, isFirstMove = true) {
        super(file, rank, isWhite, 'q', true, isFirstMove);
    }

    getMoves() {
        // Generate moves
        let horizontalMoves = MovesUtils.generateHorizontalMoves(this.file, this.rank);
        let verticalMoves = MovesUtils.generateVerticalMoves(this.file, this.rank);
        let diagonalMoves = MovesUtils.generateDiagonalMoves(this.file, this.rank);

        return {
            horizontal: horizontalMoves,
            vertical: verticalMoves,
            diagonal: diagonalMoves,
            nonSlidingMoves: null,
        };
    }
}
