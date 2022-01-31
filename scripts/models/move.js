import { Placement } from './placement.js';
import { PieceTypes } from '../constants/pieceConstants.js';

export class Move extends Placement {
    isEnPassant = false;
    isPawnPromotion = false;

    _movingPiece;
    _attackedPiece;
    _promotedToPiece;
    _castlingMove;

    get movingPiece() {
        return this._movingPiece;
    }

    set movingPiece(piece) {
        this._movingPiece = JSON.parse(JSON.stringify(piece));
    }

    get attackedPiece() {
        return this._attackedPiece;
    }

    set attackedPiece(piece) {
        this._attackedPiece = JSON.parse(JSON.stringify(piece));
    }

    get castlingMove() {
        return this._castlingMove;
    }

    get promotedToPiece() {
        return this._promotedToPiece;
    }

    set promotedToPiece(piece) {
        this._promotedToPiece = JSON.parse(JSON.stringify(piece));
    }

    constructor(file, rank, movingPiece) {
        super(file, rank);
        this.movingPiece = movingPiece;
        this.isPawnPromotion = movingPiece.TYPE === PieceTypes.PAWN && movingPiece.promotionFile === file;
    }

    setEnPassantPawn(attackedPawn) {
        if (!(this.movingPiece.TYPE === PieceTypes.PAWN)) {
            throw new Error(
                'Only pawns can make the "en passant" move. Piece making "en passant" move: ' + this.movingPiece.constructor.name,
            );
        }
        if (!(attackedPawn.TYPE === PieceTypes.PAWN)) {
            throw new Error(
                'Only pawns can be taken by "en passant" move. Piece being attacked by "en passant" move: ' + attackedPawn.constructor.name,
            );
        }
        this.attackedPiece = attackedPawn;
        this.isEnPassant = true;
    }

    setCastlingMove(castlingRook, newRookPlacement) {
        if (!(this.movingPiece.TYPE === PieceTypes.KING)) {
            throw new Error('Only Kings can castle. Piece making move cannot castle: ' + this.movingPiece.constructor.name);
        }
        if (!(castlingRook.TYPE === PieceTypes.ROOK)) {
            throw new Error('Kings can castle only with rooks. Piece cannot castle: ' + castlingRook.constructor.name);
        }
        if (!this.movingPiece.isFirstMove || !castlingRook.isFirstMove) {
            throw new Error('Pieces cannot castle after first move');
        }
        this._castlingMove = new Move(newRookPlacement.file, newRookPlacement.rank, castlingRook);
    }

    setPawnPromotionPiece(promotedToPiece) {
        if (!(this.movingPiece.TYPE === PieceTypes.PAWN)) {
            throw new Error('Only Pawns can promote. Piece making move cannot promote: ' + this.movingPiece.constructor.name);
        }
        this.isPawnPromotion = true;
        this.promotedToPiece = promotedToPiece;
    }
}
