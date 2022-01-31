import { Piece } from './piece.js';
import { BoardUtils } from '../../utils/boardUtils.js';
import { Placement } from '../placement.js';
import { Move } from '../move.js';
import { PieceTypes } from '../../constants/pieceConstants.js';

export class Knight extends Piece {

    TYPE = PieceTypes.KNIGHT;

    constructor(file, rank, isWhite, isFirstMove = true) {
        super(file, rank, isWhite, 'n', false, isFirstMove);
    }

    getMoves() {
        // Generate knight placements
        let placements = [];
        let rank, fileOffset, rankOffset, placement;

        // Distinguish placements that move the rook 1 file + 2 ranks or 2 files + 1 rank
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
                    placement = new Placement(this.file + file * fileOffset, this.rank + rank * rankOffset);
                    if (BoardUtils.isOnBoard(placement.file, placement.rank)) {
                        placements.push(placement);
                    }
                }
            }
        }

        // Convert placements to moves
        const moves = placements.map((placement) => new Move(placement.file, placement.rank, this));

        // Return per category
        return {
            horizontal: null,
            vertical: null,
            diagonal: null,
            nonSlidingMoves: moves,
        };
    }
}
