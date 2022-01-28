import { Pawn } from '../models/pieces/pawn.js';
import { Rook } from '../models/pieces/rook.js';
import { Knight } from '../models/pieces/knight.js';
import { Bishop } from '../models/pieces/bishop.js';
import { Queen } from '../models/pieces/queen.js';
import { King } from '../models/pieces/king.js';

function getPiecesFromTeam(pieces, PieceClass, isWhite) {
    return pieces.filter((piece) => piece instanceof PieceClass && piece.isWhite === isWhite);
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
    getStandardBoardSetup
};
