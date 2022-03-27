import { PieceUtils } from '../utils/pieceUtils.js';

export class Player {
    /**
     * @type {string}
     */
    name;
    /**
     * @type {boolean}
     */
    isWhite;
    /**
     * @type {Map<PieceTypes, Piece[]>}
     */
    capturedPieces;

    constructor(name, isWhite) {
        this.name = name;
        this.isWhite = isWhite;
        this.capturedPieces = new Map();
    }

    addCapturedPiece(piece) {
        if (this.capturedPieces.has(piece.TYPE)) {
            this.capturedPieces.get(piece.TYPE).push(piece);
        } else {
            this.capturedPieces.set(piece.TYPE, [piece]);
        }
    }

    removeCapturedPiece(piece) {
        const pieces = this.capturedPieces.get(piece.TYPE);
        const index = pieces.indexOf(piece);
        return pieces.splice(index, 1);
    }

    /**
     * @returns {Piece[]}
     */
    getCapturedPiecesList() {
        return Array.from(this.capturedPieces.values()).flat();
    }

    clearCapturedPieces() {
        this.capturedPieces.clear();
    }
}
