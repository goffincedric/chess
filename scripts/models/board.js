import { Rook } from './pieces/rook.js';
import { Knight } from './pieces/knight.js';
import { Bishop } from './pieces/bishop.js';
import { King } from './pieces/king.js';
import { Queen } from './pieces/queen.js';
import { Pawn } from './pieces/pawn.js';
import { MovesUtils } from '../utils/movesUtils.js';
import { BoardUtils } from '../utils/boardUtils.js';

export class Board {
    pieces;
    movingPiece;
    possibleMoves;

    isWhiteTurn;

    moves;

    enemyAttacks = [];

    constructor() {
        this.pieces = [];
        this.isWhiteTurn = true;
        this.moves = [];
        this.initializePieces();
        this.enemyAttacks = this.getEnemyAttacks();
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
            // new Knight(1, 2, true),
            // new Bishop(1, 3, true),
            // new Queen(1, 4, true),
            new King(1, 5, true),
            // new Bishop(1, 6, true),
            // new Knight(1, 7, true),
            new Rook(1, 8, true),
        );
        addPawns(2, true); // Light pawns

        // Set pieces
        this.pieces = pieces;
    }

    getPieceByPosition(x, y) {
        const position = BoardUtils.positionToPlacement(x, y);
        return this.getPieceByPlacement(position.file, position.rank);
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
        // Get possible move
        const move = this.possibleMoves.find((move) => move.file === file && move.rank === rank);
        // Check if move was found
        if (move) {
            // Check if is new placement
            if (piece.file !== move.file || piece.rank !== move.rank) {
                // Add piece to move and set if is pieces first move
                move.piece = piece;
                move.isFirstMove = piece.isFirstMove;

                // Check if space is occupied
                const residentPiece = this.pieces.find((p) => p.file === move.file && p.rank === move.rank);
                if (residentPiece && residentPiece.isWhite !== piece.isWhite) {
                    const indexToRemove = this.pieces.indexOf(residentPiece);
                    this.pieces.splice(indexToRemove, 1);
                }

                // Set piece placement
                piece.setPlacement(move.file, move.rank);

                /**
                 * Check for multi-piece moves
                 */
                // Check if move had enPassant piece to capture
                if (move.enPassant) {
                    const indexToRemove = this.pieces.indexOf(move.enPassant);
                    this.pieces.splice(indexToRemove, 1);
                }
                // Check if move is castling move
                if (move.castling) {
                    move.castling.piece.setPlacement(move.castling.file, move.castling.rank);
                }

                // TODO: Check if is pawn exchange for rook, knight, bishop or queen
                //  If yes, show pieces to choose from
                //  If piece is chosen, remove pawn from game, create new chosen piece and set isFirstMove to false,
                //      otherwise and illegal castle move is possible

                // Add move to moves
                this.moves.push(move);

                // Set next turn
                this.toggleTurn();
            }
        }

        // Reset moving piece
        this.resetMovingPiece();
    }

    toggleTurn() {
        this.isWhiteTurn = !this.isWhiteTurn;

        this.enemyAttacks = this.getEnemyAttacks();
    }

    getEnemyAttacks() {
        // Get enemy pieces
        const enemyPieces = this.pieces.filter((piece) => piece.isWhite !== this.isWhiteTurn);

        // Calculate moves for each piece and return
        const enemyMoves = enemyPieces.map((piece) => this.getMoves(piece)).flat();

        // Remove duplicate moves
        MovesUtils.removeDuplicateMoves(enemyMoves);

        // Return moves
        return enemyMoves;
    }

    getMoves(movingPiece) {
        if (!(movingPiece instanceof King)) {
            // Check if king is targeted
            const king = this.pieces.find((piece) => piece.isWhite === movingPiece.isWhite && piece instanceof King);
            if (this.pieceIsTargeted(king)) {
                // TODO: Return any moves that block the king from being targeted
                return [];
            }
        }

        // Get possible moves
        const moves = movingPiece.getMoves();

        // Add moves to categories
        const horizontalMoves = [...(moves.horizontal ?? [])];
        const verticalMoves = [...(moves.vertical ?? [])];
        const diagonalMoves = [...(moves.diagonal ?? [])];
        const nonSlidingMoves = [...(moves.nonSlidingMoves ?? [])]; // Knight
        const multiPieceMoves = this.getMultiPieceMoves(movingPiece);

        // Filter out illegal moves
        MovesUtils.truncateMoveDirections(horizontalMoves, this.pieces, movingPiece);
        MovesUtils.truncateMoveDirections(verticalMoves, this.pieces, movingPiece);
        MovesUtils.truncateMoveDirections(diagonalMoves, this.pieces, movingPiece);
        MovesUtils.filterSamePieceMoves(nonSlidingMoves, this.pieces, movingPiece);

        // Prevent pawn from taking enemy piece straight ahead
        if (movingPiece instanceof Pawn) {
            verticalMoves.forEach((moves) => MovesUtils.removeMovesWithEnemies(moves, this.pieces, movingPiece));
        }

        // Join all moves and return
        const joinedMoves = [
            ...horizontalMoves.flat(),
            ...verticalMoves.flat(),
            ...diagonalMoves.flat(),
            ...nonSlidingMoves,
            ...multiPieceMoves,
        ];

        // Remove duplicates
        MovesUtils.removeDuplicateMoves(joinedMoves);

        // Check if is king
        if (movingPiece instanceof King) {
            // Remove moves where enemy can attack
            MovesUtils.filterMovesInCommon(joinedMoves, this.enemyAttacks, false);
        }

        // Return moves
        return joinedMoves;
    }

    pieceIsTargeted(piece) {
        const piecePlacements = [piece];
        MovesUtils.filterMovesInCommon(piecePlacements, this.enemyAttacks, true);
        return piecePlacements.length > 0;
    }

    getMultiPieceMoves(movingPiece) {
        const multiPieceMoves = [];

        // Generate multi-piece pawn moves
        if (movingPiece instanceof Pawn) {
            // Pawn capture
            let attackingSpaces = movingPiece.getAttackingSpaces();
            MovesUtils.filterEnemyPieceMoves(attackingSpaces, this.pieces, movingPiece);
            multiPieceMoves.push(...attackingSpaces);

            // En passant
            attackingSpaces = movingPiece.getAttackingSpaces();
            const enPassantSpaces = movingPiece
                .getEnPassantSpaces()
                .map((move) =>
                    this.pieces.find(
                        (piece) =>
                            piece.isWhite !== movingPiece.isWhite &&
                            piece instanceof Pawn &&
                            this.moves.length > 1 &&
                            // Check if last move was the first move made by the piece
                            this.moves[this.moves.length - 1].isFirstMove &&
                            // Check if the last move was made by the piece current piece in loop
                            this.moves[this.moves.length - 1].piece === piece &&
                            piece.file === move.file &&
                            piece.rank === move.rank,
                    ),
                )
                .filter((piece) => !!piece)
                .map((piece) => {
                    const attackingMove = attackingSpaces.find((attackingSpace) => attackingSpace.rank === piece.rank);
                    attackingMove.enPassant = piece;
                    return attackingMove;
                });
            multiPieceMoves.push(...enPassantSpaces);
        }

        // Generate castling moves
        if (movingPiece instanceof King && movingPiece.isFirstMove) {
            // Get rooks that haven't moved yet
            let rooks = this.pieces.filter((piece) => piece.isFirstMove && piece.isWhite === movingPiece.isWhite && piece instanceof Rook);

            rooks = rooks.filter((rook) => {
                // Calculate mininum and maximum rank of king and rook
                const minRank = rook.rank > movingPiece.rank ? movingPiece.rank : rook.rank;
                const maxRank = rook.rank < movingPiece.rank ? movingPiece.rank : rook.rank;

                // Keep rooks that have no other pieces between it and king
                const hasPiecesBetween = this.pieces.some(
                    (piece) => piece.file === rook.file && piece.rank > minRank && piece.rank < maxRank,
                );
                if (hasPiecesBetween) {
                    return false;
                }

                // Keep rooks that have aren't under attack and have no attacked spaces between rook and king
                const limit = maxRank - minRank;
                const horizontalDirections = MovesUtils.generateHorizontalMoves(rook.file, rook.rank, limit, true);
                const horizontalSpaces = horizontalDirections.find((directionSpaces) =>
                    // Find direction that points to king
                    directionSpaces.some((space) => space.file === movingPiece.file && space.rank === movingPiece.rank),
                );
                horizontalSpaces.pop(); // Remove king placement
                MovesUtils.filterMovesInCommon(horizontalSpaces, this.enemyAttacks, true);
                return horizontalSpaces.length === 0;
            });

            // Generate castling moves for remaining rooks
            let castleMoves = rooks.map((rook) => {
                let offset = rook.rank < movingPiece.rank ? -1 : 1;
                return {
                    file: movingPiece.file,
                    rank: movingPiece.rank + 2 * offset,
                    castling: { file: rook.file, rank: movingPiece.rank + 1 * offset, piece: rook },
                };
            });

            multiPieceMoves.push(...castleMoves);
        }

        // Return multi-piece moves
        return multiPieceMoves;
    }
}
