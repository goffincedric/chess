import { Piece } from './piece.js';
import { MovesUtils } from '../../utils/movesUtils.js';

export class Rook extends Piece {
    constructor(file, rank, isWhite, isFirstMove = true) {
        super(file, rank, isWhite, 'r', true, isFirstMove);
    }

    getMoves() {
        const horizontalMoves = MovesUtils.generateHorizontalMoves(this.file, this.rank);
        const verticalMoves = MovesUtils.generateVerticalMoves(this.file, this.rank);

        return {
            horizontal: horizontalMoves,
            vertical: verticalMoves,
            diagonal: null,
            nonSlidingMoves: null,
        };
    }
}
