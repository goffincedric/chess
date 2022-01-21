import { Piece } from './piece.js';
import { MovesUtils } from '../../utils/movesUtils.js';

export class Rook extends Piece {
    constructor(file, rank, isLight) {
        super(file, rank, isLight, 'r', true);
    }

    getMoves() {
        const horizontalMoves = MovesUtils.generateHorizontalMoves(this.file, this.rank);
        const verticalMoves = MovesUtils.generateVerticalMoves(this.file, this.rank);

        return {
            horizontal: horizontalMoves,
            vertical: verticalMoves,
            diagonal: null,
            special: null,
        };
    }
}
