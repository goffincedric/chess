import { Piece } from './piece.js';

export class Knight extends Piece {
    constructor(file, rank, isLight) {
        super(file, rank, isLight, 'n', false);
    }

    getMoves() {
        let moves = [
            { file: this.file - 2, rank: this.rank + 1 },
            { file: this.file - 1, rank: this.rank + 2 },
            { file: this.file + 1, rank: this.rank + 2 },
            { file: this.file + 2, rank: this.rank + 1 },
            { file: this.file + 2, rank: this.rank - 1 },
            { file: this.file + 1, rank: this.rank - 2 },
            { file: this.file - 1, rank: this.rank - 2 },
            { file: this.file - 2, rank: this.rank - 1 },
        ];

        // Filter out moves that are not on the board and return per category
        return {
            horizontal: null,
            vertical: null,
            diagonal: null,
            special: moves.filter((p) => p.file > 0 && p.rank > 0),
        };
    }
}
