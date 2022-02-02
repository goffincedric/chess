const PieceTypes = {
    PAWN: 'PAWN',
    ROOK: 'ROOK',
    KNIGHT: 'KNIGHT',
    BISHOP: 'BISHOP',
    QUEEN: 'QUEEN',
    KING: 'KING',
};

const MAX_PIECE_COUNT = 32;
const DEFAULT_PIECES_LAYOUT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export { PieceTypes, MAX_PIECE_COUNT, DEFAULT_PIECES_LAYOUT_FEN };
