import { Rook } from './pieces/rook.js';
import { Knight } from './pieces/knight.js';
import { Bishop } from './pieces/bishop.js';
import { King } from './pieces/king.js';
import { Queen } from './pieces/queen.js';
import { Pawn } from './pieces/pawn.js';
import { MovesUtils } from '../utils/movesUtils.js';

export class Board {
    pieces;
    movingPiece;
    possibleMoves;

    isWhiteTurn;

    constructor() {
        this.pieces = [];
        this.isWhiteTurn = true;
        this.initializePieces();
    }

    initializePieces() {
        // TODO: Initialize with FEN notation

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

    resetMovingPiece() {
        this.movingPiece = null;
        this.possibleMoves = null;
    }

    movePiece(piece, file, rank) {
        // Check if is allowed move
        if (this.possibleMoves.some((move) => move.file === file && move.rank === rank)) {
            // Check if is new placement
            if (piece.file !== file || piece.rank !== rank) {
                // Check if space is occupied
                const residentPiece = this.pieces.find((p) => p.file === file && p.rank === rank);
                if (residentPiece && residentPiece.isWhite !== piece.isWhite) {
                    const indexToRemove = this.pieces.indexOf(residentPiece);
                    this.pieces.splice(indexToRemove, 1);
                }

                // Set piece placement
                piece.file = file;
                piece.rank = rank;
                piece.isFirstMove = false;

                // TODO: Check if is pawn exchange for rook, knight, bishop or queen
                //  If yes, show pieces to choose from
                //  If piece is chosen, remove current piece from game, create new choses piece and set isFirstMove to false,
                //      otherwise and illegal castle move is possible

                // Set next turn
                this.toggleTurn();
            }
        }

        // Reset moving piece
        this.resetMovingPiece();
    }

    toggleTurn() {
        this.isWhiteTurn = !this.isWhiteTurn;
    }

    getMoves(piece) {
        // Get possible moves
        const moves = piece.getMoves();

        // Add moves to categories
        const horizontalMoves = [...(moves.horizontal ?? [])];
        const verticalMoves = [...(moves.vertical ?? [])];
        const diagonalMoves = [...(moves.diagonal ?? [])];
        const nonSlidingMoves = [...(moves.nonSlidingMoves ?? [])]; // Knight

        // Generate multi-piece moves
        // TODO: En passant
        if (piece instanceof Pawn) {
            // console.log('generate en passant');
        }

        // TODO: Castling
        if ((piece instanceof Rook || piece instanceof King) && piece.isFirstMove) {
            // console.log('generate castle move');
        }

        // Filter out illegal moves
        MovesUtils.truncateMoveDirections(horizontalMoves, this.pieces, piece);
        MovesUtils.truncateMoveDirections(verticalMoves, this.pieces, piece);
        MovesUtils.truncateMoveDirections(diagonalMoves, this.pieces, piece);
        MovesUtils.filterSamePieceMoves(nonSlidingMoves, this.pieces, piece);

        return [...horizontalMoves.flat(), ...verticalMoves.flat(), ...diagonalMoves.flat(), ...nonSlidingMoves];
    }
}
