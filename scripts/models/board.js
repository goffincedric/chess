import { Rook } from './pieces/rook.js';
import { King } from './pieces/king.js';
import { Pawn } from './pieces/pawn.js';
import { MovesUtils } from '../utils/movesUtils.js';
import { BoardUtils } from '../utils/boardUtils.js';

export class Board {
    pieces;
    movingPiece;
    possibleMoves;

    isWhiteTurn;
    pawnToPromote;

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
        // // Add dark pieces
        // pieces.push(
        //     new Rook(8, 1, false),
        //     new Knight(8, 2, false),
        //     new Bishop(8, 3, false),
        //     new Queen(8, 4, false),
        //     new King(8, 5, false),
        //     new Bishop(8, 6, false),
        //     new Knight(8, 7, false),
        //     new Rook(8, 8, false),
        // );
        // addPawns(7, false); // Dark pawns
        // // Add light pieces
        // pieces.push(
        //     new Rook(1, 1, true),
        //     new Knight(1, 2, true),
        //     new Bishop(1, 3, true),
        //     new Queen(1, 4, true),
        //     new King(1, 5, true),
        //     new Bishop(1, 6, true),
        //     new Knight(1, 7, true),
        //     new Rook(1, 8, true),
        // );
        // addPawns(2, true); // Light pawns

        pieces.push(new King(3, 5, false, false), new Pawn(7, 4, true, false), new King(6, 5, true, false), new Pawn(2, 4, false, false));

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
        if (piece) {
            this.movingPiece = piece;
            this.possibleMoves = this.getMoves(piece);
        }
    }

    clearMovingPiece() {
        this.movingPiece = null;
        this.possibleMoves = null;
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

                // Check if is pawn promotion
                if (piece instanceof Pawn && piece.file === piece.promotionFile) {
                    this.pawnToPromote = piece;
                } else {
                    // Add move to moves
                    this.moves.push(move);

                    // Set next turn
                    this.toggleTurn();
                }
            }
        }

        // Reset moving piece
        this.resetMovingPiece();
    }

    promotePawn(promotedPiece) {
        // Get pawn to promote
        const pawnToPromote = this.pieces.find(
            (piece) => piece.isWhite === this.isWhiteTurn && piece instanceof Pawn && piece.file === piece.promotionFile,
        );
        if (pawnToPromote) {
            // Create promoted piece (has already moved, prevents illegal castling move
            // const promotedPiece = new ChosenPieceClass(pawnToPromote.file, pawnToPromote.rank, false);

            // Remove pawn from game
            const indexToRemove = this.pieces.indexOf(pawnToPromote);
            this.pieces.splice(indexToRemove, 1);

            // Add promotedPiece to pieces
            this.pieces.push(promotedPiece);

            // Clear piece to promote
            this.pawnToPromote = null;

            // Toggle turn
            this.toggleTurn();
        }
    }

    toggleTurn() {
        this.isWhiteTurn = !this.isWhiteTurn;

        this.enemyAttacks = this.getEnemyAttacks();

        // Look for checkmate (no moves to play)
        if (this.isCheckMate()) {
            // TODO: Show message and reset board?
            console.log(`Checkmate, ${this.isWhiteTurn ? 'white' : 'black'}wins`);
        }
    }

    getEnemyAttacks() {
        // Get enemy pieces
        const enemyPieces = this.getPiecesOfTeam(true);

        // Calculate moves for each piece and return
        return enemyPieces.map((piece) => this.getMoves(piece, true)).flat();
    }

    isCheckMate() {
        // Get all pieces for current turn
        const pieces = this.pieces.filter((piece) => piece.isWhite === this.isWhiteTurn);

        // Get all moves for all pieces
        const moves = pieces.map((piece) => this.getMoves(piece)).flat();

        // Check if no moves can be made and return
        return moves.length === 0;
    }

    getMoves(movingPiece, isEnemyMoves = false) {
        // Get possible moves
        const moves = movingPiece.getMoves();

        // Add moves to categories
        const horizontalMoves = [...(moves.horizontal ?? [])];
        const verticalMoves = [...(moves.vertical ?? [])];
        const diagonalMoves = [...(moves.diagonal ?? [])];
        const nonSlidingMoves = [...(moves.nonSlidingMoves ?? [])]; // Knight
        const multiPieceMoves = this.getMultiPieceMoves(movingPiece);

        // Filter out illegal moves
        MovesUtils.truncateMoveDirections(horizontalMoves, this.pieces, movingPiece, isEnemyMoves);
        MovesUtils.truncateMoveDirections(verticalMoves, this.pieces, movingPiece, isEnemyMoves);
        MovesUtils.truncateMoveDirections(diagonalMoves, this.pieces, movingPiece, isEnemyMoves);
        if (!isEnemyMoves) {
            MovesUtils.filterSamePieceMoves(nonSlidingMoves, this.pieces, movingPiece);
        }

        // Check if is pawn
        if (movingPiece instanceof Pawn) {
            // Prevent pawn from taking enemy piece straight ahead
            verticalMoves.forEach((moves) => MovesUtils.removeMovesWithEnemies(moves, this.pieces, movingPiece));

            // Check if is enemy moves generation
            if (!isEnemyMoves) {
                // Remove pawn capture moves that are not attacking enemies
                diagonalMoves.forEach((moves) => MovesUtils.filterEnemyPieceMoves(moves, this.pieces, movingPiece));
            }
        }

        // Join all moves and return
        const joinedMoves = [
            ...horizontalMoves.flat(),
            ...verticalMoves.flat(),
            ...diagonalMoves.flat(),
            ...nonSlidingMoves,
            ...multiPieceMoves,
        ];

        // Check if is king
        if (movingPiece instanceof King) {
            // Get moves from enemy
            const enemyMoves = this.enemyAttacks;
            // Remove moves on where enemy can attack
            MovesUtils.filterMovesInCommon(joinedMoves, this.enemyAttacks, false);

            // Find move that attacks king
            const move = this.enemyAttacks.find((move) => move.file === movingPiece.file && move.rank === movingPiece.rank);
            if (move?.enemyPiece) {
                // Get move line (horizontal/vertical/diagonal) through king and enemy that is attacking king
                const lineOfAttack = MovesUtils.generateMovesLineThroughPlacements(
                    move.enemyPiece.file,
                    move.enemyPiece.rank,
                    movingPiece.file,
                    movingPiece.rank,
                );
                // Remove moves on entire line where enemy can attack, not only moves up until the king itself
                MovesUtils.filterMovesInCommon(joinedMoves, lineOfAttack, false);
            }
        } else if (!isEnemyMoves) {
            /**
             * Block check
             */
            // Get king
            const king = this.pieces.find((piece) => piece.isWhite === movingPiece.isWhite && piece instanceof King);
            // Get moves of pieces targeting king
            const pieceMovesTargetingKing = this.pieceIsTargetedByMoves(king);
            // Check if any moves are present
            if (pieceMovesTargetingKing.length > 0) {
                MovesUtils.filterMovesInCommon(joinedMoves, pieceMovesTargetingKing, true);
            }

            /**
             * Don't break blocked check
             */
            if (joinedMoves.length > 0) {
                const slidingPieces = this.getPiecesOfTeam(true).filter(
                    (piece) => piece.isSlidingPiece && !(piece instanceof Pawn || piece instanceof King),
                );
                slidingPieces.forEach((slidingEnemyPiece) => {
                    // Get moves between piece and king
                    const movesBetween = MovesUtils.generateMovesBetweenPlacements(
                        king.file,
                        king.rank,
                        slidingEnemyPiece.file,
                        slidingEnemyPiece.rank,
                        false,
                        false,
                    );
                    if (movesBetween.length > 0) {
                        // Check if enemy can make moves towards king
                        const movesAvailable = this.getMoves(slidingEnemyPiece, true);
                        if (MovesUtils.hasMovesInCommon(movesBetween, movesAvailable)) {
                            // Get piece on each move placement and filter out empty placements
                            const piecesOnMoves = movesBetween
                                .map((move) => this.getPieceOnPlacement(move.file, move.rank))
                                .filter((piece) => !!piece);
                            // Check if movingPiece is the only piece between enemy
                            if (piecesOnMoves.length === 1 && piecesOnMoves.includes(movingPiece)) {
                                // Keep only moves targeting enemy piece
                                MovesUtils.filterMovesInCommon(joinedMoves, [slidingEnemyPiece], true);
                            }
                        }
                    }
                });
            }
        }

        // Add piece to moves is enemy moves & add piece placement
        if (isEnemyMoves) {
            joinedMoves.map((move) => (move.enemyPiece = movingPiece));
        }

        // Return moves
        return joinedMoves;
    }

    pieceIsTargetedByMoves(attackedPiece) {
        // Get all enemy moves
        let enemyAttacks = [...this.enemyAttacks];

        // Map each move to the corresponding enemy
        const attacksPerEnemy = new Map();
        const enemies = [];
        enemyAttacks.forEach((move) => {
            if (attacksPerEnemy.has(move.enemyPiece)) {
                attacksPerEnemy.get(move.enemyPiece).push(move);
            } else {
                enemies.push(move.enemyPiece);
                // Add move + enemyPiece placement itself to map
                attacksPerEnemy.set(move.enemyPiece, [
                    move,
                    { file: move.enemyPiece.file, rank: move.enemyPiece.rank, enemyPiece: move.enemyPiece },
                ]);
            }
        });

        // Remove enemies not attacking attackedPiece from map
        enemies.forEach((enemy) => {
            // Get moves of enemy
            const moves = attacksPerEnemy.get(enemy);
            // Check if enemy is not attacking piece
            if (!moves.some((move) => move.file === attackedPiece.file && move.rank === attackedPiece.rank)) {
                attacksPerEnemy.delete(enemy);
            } else {
                // Check if is sliding piece (anything but the knight)
                let movesToBlock;
                if (enemy.isSlidingPiece) {
                    // Generate moves between enemy and attackedPiece
                    movesToBlock = MovesUtils.generateMovesBetweenPlacements(
                        enemy.file,
                        enemy.rank,
                        attackedPiece.file,
                        attackedPiece.rank,
                        true,
                        false,
                    );
                } else {
                    // Add piece's current position to movesToBlock. Since the piece doesn't slide,
                    // you can only block by taking the enemy piece
                    movesToBlock = [{ file: enemy.file, rank: enemy.rank }];
                }
                // Remove moves that are not moves between enemy and attackedPiece or on attackedPie
                MovesUtils.filterMovesInCommon(moves, movesToBlock, true);
            }
        });

        // Join moves of all attacking pieces and remove duplicate placements
        enemyAttacks = Array.from(attacksPerEnemy.values()).flat();
        MovesUtils.removeDuplicateMoves(enemyAttacks);

        // Return attacking moves
        return enemyAttacks;
    }

    getMultiPieceMoves(movingPiece) {
        const multiPieceMoves = [];

        // Generate multi-piece pawn moves
        if (movingPiece instanceof Pawn) {
            // En passant
            const attackingSpaces = movingPiece.getAttackingSpaces();
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
                // Check if rook is on same file as king
                if (rook.file !== movingPiece.file) {
                    return false;
                }

                // Calculate minimum and maximum rank of king and rook
                const minRank = Math.min(rook.rank, movingPiece.rank);
                const maxRank = Math.max(rook.rank, movingPiece.rank);

                // Keep rooks that have no other pieces between it and king
                const hasPiecesBetween = this.pieces.some(
                    (piece) => piece.file === rook.file && piece.rank > minRank && piece.rank < maxRank,
                );
                if (hasPiecesBetween) {
                    return false;
                }

                // Keep rooks that have aren't under attack and have no attacked spaces between rook and king
                // Generate spaces between rook and king, including rook and king placements
                const horizontalSpaces = MovesUtils.generateHorizontalMovesBetween(rook.file, rook.rank, movingPiece.rank, true, true);
                // Check if any spaces are under attack
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

    getPieceOnPlacement(file, rank) {
        return this.pieces.find((piece) => piece.file === file && piece.rank === rank);
    }

    getPiecesOfTeam(enemy) {
        return this.pieces.filter(
            (piece) => (enemy && piece.isWhite !== this.isWhiteTurn) || (!enemy && piece.isWhite === this.isWhiteTurn),
        );
    }
}
