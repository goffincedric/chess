import { Piece } from './piece.js';
import { MovesUtils } from '../../utils/movesUtils.js';

export class Bishop extends Piece {
    constructor(file, rank, isWhite) {
        super(file, rank, isWhite, 'b', true);
    }

    getMoves() {
        return {
            horizontal: null,
            vertical: null,
            diagonal: MovesUtils.generateDiagonalMoves(this.file, this.rank),
            nonSlidingMoves: null,
        };
    }
}
