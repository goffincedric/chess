import { Rook } from './pieces/rook.js';
import { Knight } from './pieces/knight.js';
import { Bishop } from './pieces/bishop.js';
import { King } from './pieces/king.js';
import { Queen } from './pieces/queen.js';
import { Pawn } from './pieces/pawn.js';

export class Board {
    pieces;
    movingPiece;
    possibleMoves;

    constructor() {
        this.pieces = [];
        this.initializePieces();
    }

    initializePieces() {
        // TODO: Initialize with FEN notation

        // Generate pieces
        const pieces = [];
        // Add dark pieces
        pieces.push(
            new Rook(1, 1, false),
            new Knight(1, 2, false),
            new Bishop(1, 3, false),
            new Queen(1, 4, false),
            new King(1, 5, false),
            new Bishop(1, 6, false),
            new Knight(1, 7, false),
            new Rook(1, 8, false),
        );
        // Generate pawns
        function addPawns(file, isLight) {
            for (let rank = 1; rank <= 8; rank++) {
                pieces.push(new Pawn(file, rank, isLight));
            }
        }
        addPawns(2, false); // Dark pawns
        addPawns(7, true); // Light pawns
        // Add light pieces
        pieces.push(
            new Rook(8, 1, true),
            new Knight(8, 2, true),
            new Bishop(8, 3, true),
            new Queen(8, 4, true),
            new King(8, 5, true),
            new Bishop(8, 6, true),
            new Knight(8, 7, true),
            new Rook(8, 8, true),
        );

        // Set pieces
        this.pieces = pieces;
    }

    getPieceByPosition(x, y) {
        return this.pieces.find((piece) => {
            const bounds = piece.getBounds();
            return x >= bounds.x && x <= bounds.dx && y >= bounds.y && y <= bounds.dy;
        });
    }

    getPieceByPlacement(file, rank) {
        return this.pieces.find((piece) => piece.file === file && piece.rank === rank);
    }

    setMovingPiece(piece) {
        this.movingPiece = piece;
        this.possibleMoves = this.getMoves(piece);
    }

    getMoves(piece) {
        // Get possible moves
        let moves = piece.getMoves();

        // Add moves to categories
        let horizontalMoves = [...(moves.horizontal ?? [])];
        let verticalMoves = [...(moves.vertical ?? [])];
        let diagonalMoves = [...(moves.diagonal ?? [])];
        // TODO: Distinguish special moves for filtering
        let specialMoves = [...(moves.special ?? [])]; // (Knight + en passant + castling)

        // TODO: Filter out illegal moves

        return [...horizontalMoves.flat(), ...verticalMoves.flat(), ...diagonalMoves.flat(), ...specialMoves];
    }
}
