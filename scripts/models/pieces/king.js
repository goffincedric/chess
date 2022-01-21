import { Piece } from './piece.js';
import { MovesUtils } from '../../utils/movesUtils.js';

export class King extends Piece {
    constructor(file, rank, isLight) {
        super(file, rank, isLight, 'k', true);
    }

    getMoves() {
        // Generate moves
        let horizontalMoves = MovesUtils.generateHorizontalMoves(this.file, this.rank, 1);
        let verticalMoves = MovesUtils.generateVerticalMoves(this.file, this.rank, 1);
        let diagonalMoves = MovesUtils.generateDiagonalMoves(this.file, this.rank, 1);

        return {
            horizontal: horizontalMoves,
            vertical: verticalMoves,
            diagonal: diagonalMoves,
            special: null,
        };
    }
}
