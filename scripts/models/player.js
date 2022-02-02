export class Player {
    name;
    isWhite;
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

    clearCapturedPieces() {
        this.capturedPieces.clear();
    }
}
