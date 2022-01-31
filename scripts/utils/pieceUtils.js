import { Bishop, King, Knight, Pawn, Queen, Rook } from '../models/pieces';

function getPiecesFromTeam(pieces, pieceType, isWhite) {
    return pieces.filter((piece) => piece.TYPE === pieceType && piece.isWhite === isWhite);
}

function getPieceByPlacement(pieces, file, rank) {
    return pieces.find((piece) => piece.file === file && piece.rank === rank);
}

function getStandardBoardSetup() {
    // Generate pawns
    function addPawns(file, isWhite) {
        for (let rank = 1; rank <= 8; rank++) {
            pieces.push(new Pawn(file, rank, isWhite));
        }
    }

    // Generate pieces
    const pieces = [];
    // Add dark pieces
    pieces.push(
        new Rook(8, 1, false),
        new Knight(8, 2, false),
        new Bishop(8, 3, false),
        new Queen(8, 4, false),
        new King(8, 5, false),
        new Bishop(8, 6, false),
        new Knight(8, 7, false),
        new Rook(8, 8, false),
    );
    addPawns(7, false); // Dark pawns
    // Add light pieces
    pieces.push(
        new Rook(1, 1, true),
        new Knight(1, 2, true),
        new Bishop(1, 3, true),
        new Queen(1, 4, true),
        new King(1, 5, true),
        new Bishop(1, 6, true),
        new Knight(1, 7, true),
        new Rook(1, 8, true),
    );
    addPawns(2, true); // Light pawns

    return pieces;
}

export const PieceUtils = {
    getPiecesFromTeam,
    getPieceByPlacement,
    getStandardBoardSetup,
};
