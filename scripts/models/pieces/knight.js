import { Piece } from './piece.js';
import { BoardUtils } from '../../utils/boardUtils.js';

export class Knight extends Piece {
    constructor(file, rank, isWhite) {
        super(file, rank, isWhite, 'n', false);
    }

    getMoves() {
        // Generate bishop moves
        let newMoves = [];
        let rank, fileOffset, rankOffset, placement;

        // Distinguish moves that move the rook 1 file + 2 ranks or 2 files + 1 rank
        for (let file = 1; file <= 2; file++) {
            // Distinguish between upwards or downwards file directions
            for (let fileDirection = 0; fileDirection < 2; fileDirection++) {
                fileOffset = fileDirection % 2 === 0 ? 1 : -1;
                // Distinguish between left or right rank directions
                for (let rankDirection = 0; rankDirection < 2; rankDirection++) {
                    // Set rank move and direction
                    rank = file === 1 ? 2 : 1;
                    rankOffset = rankDirection % 2 === 0 ? 1 : -1;

                    // Create placement and add if is on board
                    placement = { file: this.file + file * fileOffset, rank: this.rank + rank * rankOffset };
                    if (BoardUtils.isOnBoard(placement.file, placement.rank)) {
                        newMoves.push(placement);
                    }
                }
            }
        }

        // Return per category
        return {
            horizontal: null,
            vertical: null,
            diagonal: null,
            nonSlidingMoves: newMoves,
        };
    }
}
