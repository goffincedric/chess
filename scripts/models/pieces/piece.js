import { FILE_SIZE, RANK_SIZE } from '../../constants/boardConstants.js';
import { BoardUtils } from '../../utils/boardUtils.js';

export class Piece {
    file;
    rank;
    isWhite;
    fenName;
    isSlidingPiece;

    asset;

    isMoving;
    isFirstMove;

    constructor(file, rank, isWhite, fenName, isSlidingPiece) {
        this.file = file;
        this.rank = rank;
        this.isWhite = isWhite;
        this.fenName = fenName;
        this.isSlidingPiece = isSlidingPiece;

        this.isMoving = false;
        this.isFirstMove = true;
    }

    getMoves() {
        throw new ReferenceError('function "getMoves" is not implemented yet');
    }

    getAssetUrl() {
        return 'assets/' + this.fenName + '_' + (this.isWhite ? 'l' : 'd') + '.svg';
    }

    loadAsset() {
        this.asset = loadImage(this.getAssetUrl());
    }

    setPlacement(file, rank) {
        this.file = file;
        this.rank = rank;
        const position = BoardUtils.placementToPosition(file, rank);
        this.asset.set(position.x, position.y);
    }

    getPosition() {
        return BoardUtils.placementToPosition(this.file, this.rank);
    }

    getBounds() {
        const position = this.getPosition();
        return {
            x: position.x,
            y: position.y,
            dx: position.x + RANK_SIZE - 1,
            dy: position.y + FILE_SIZE - 1,
        };
    }
}
