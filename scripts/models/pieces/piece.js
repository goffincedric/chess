import { SQUARE_SIZE } from '../../constants/boardConstants.js';
import { BoardUtils } from '../../utils/boardUtils.js';

export class Piece {
    file;
    rank;
    isWhite;
    fenName;
    isSlidingPiece;

    isMoving;
    isFirstMove;

    constructor(file, rank, isWhite, fenName, isSlidingPiece, isFirstMove = true) {
        this.file = file;
        this.rank = rank;
        this.isWhite = isWhite;
        this.fenName = isWhite ? fenName.toUpperCase() : fenName.toLowerCase();
        this.isSlidingPiece = isSlidingPiece;

        this.isFirstMove = isFirstMove;
        this.isMoving = false;
    }

    getMoves() {
        throw new ReferenceError('function "getMoves" is not implemented yet');
    }

    getAssetUrl() {
        return 'assets/' + this.fenName + '_' + (this.isWhite ? 'l' : 'd') + '.svg';
    }

    setPlacement(file, rank) {
        this.file = file;
        this.rank = rank;
        this.isFirstMove = false;
    }

    getPosition() {
        return BoardUtils.placementToPosition(this.file, this.rank);
    }

    getBounds() {
        const position = this.getPosition();
        return {
            x: position.x,
            y: position.y,
            dx: position.x + SQUARE_SIZE - 1,
            dy: position.y + SQUARE_SIZE - 1,
        };
    }
}
