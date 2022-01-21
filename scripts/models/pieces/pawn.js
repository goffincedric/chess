import { Piece } from './piece.js';

export class Pawn extends Piece {
    constructor(file, rank, isLight) {
        super(file, rank, isLight, 'p', true);
    }

    getMoves() {
        // TODO: En passant

        // TODO: Check directionality

        return {
            horizontal: null,
            vertical: null,
            diagonal: null,
            special: null,
        };
    }
}
