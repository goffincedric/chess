import { Rook } from './pieces/rook.js';
import { King } from './pieces/king.js';
import { Pawn } from './pieces/pawn.js';
import { MovesUtils } from '../utils/movesUtils.js';
import { BoardUtils } from '../utils/boardUtils.js';
import { Knight } from './pieces/knight.js';
import { Bishop } from './pieces/bishop.js';
import { GAMESTATES } from '../constants/boardConstants.js';
import { PieceUtils } from '../utils/pieceUtils.js';

export class Board {
    _pastPiecesCount;
    pieces;

    movingPiece;
    movingPieceMoves;

    isWhiteTurn;
    pawnToPromote;

    pastMoves;

    enemyAttacks = [];
    currentPlayerMoves = [];

    gameState;

    // Variable that holds the amount of half moves made since last capture, for 50-move rule
    // (1 full move === each player made a move, so 10 full moves = 50/51 half moves)
    halfMovesCount = 0;

    constructor(initialFENString) {
        this.resetGame(initialFENString);
    }

    resetGame(initialFENString = null) {
        this.initializePieces(initialFENString);
        this._pastPiecesCount = this.pieces.length;
        this.currentPlayerMoves = this.getCurrentPlayerAttacks();
        this.enemyAttacks = this.getEnemyAttacks();

        // Set game state to playing
        this.gameState = GAMESTATES.PLAYING;
    }

    initializePieces(initialFENString) {
        // Set standard board
        this.movingPiece = null;
        this.movingPieceMoves = null;
        this.pawnToPromote = null;
        this.enemyAttacks = [];
        this.currentPlayerMoves = [];

        if (initialFENString) {
            // Initialize with FEN notation
            const boardData = FENUtils.generateBoardFromFen(initialFENString);
            this.pieces = boardData.pieces;
            this.isWhiteTurn = boardData.isWhiteTurn;
            this.halfMovesCount = boardData.halfMoveCount;
            this.pastMoves = Array(boardData.fullMoveCount * 2).fill(null);
            if (boardData.pastMove) {
                this.pastMoves[this.pastMoves - 1] = boardData.pastMove;
            }
        } else {
            // Initialize standard board
            this.pieces = [];
            this.isWhiteTurn = true;
            this.pastMoves = [];
            this.pieces = PieceUtils.getStandardBoardSetup();
        }
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
            this.movingPieceMoves = this.getMoves(piece);
        }
    }

    clearMovingPiece() {
        this.movingPiece = null;
        this.movingPieceMoves = null;
    }

    resetMovingPiece() {
        this.movingPiece = null;
        this.movingPieceMoves = null;
    }

    movePiece(piece, file, rank) {
        // Get possible move
        const move = this.movingPieceMoves.find((move) => move.file === file && move.rank === rank);
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
                    this.pastMoves.push(move);

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
        if (this._pastPiecesCount !== this.pieces.length || this.pastMoves[this.pastMoves.length - 1].piece instanceof Pawn) {
            this._pastPiecesCount = this.pieces.length;
            this.halfMovesCount = 0;
        } else {
            this.halfMovesCount++;
        }

        // Get all moves enemy player can play
        this.enemyAttacks = this.getEnemyAttacks();

        // Get all moves current player can play
        this.currentPlayerMoves = this.getCurrentPlayerAttacks();

        // Look for draw
        if (this.isDrawInsufficientPieces()) {
            this.gameState = GAMESTATES.DRAW_INSUFFICIENT_PIECES;
        } else if (this.isThreeFoldRepetition()) {
            // TODO?
            console.log(`Stalemate, the same move was played three times.`);
        } else if (this.isCheckMate()) {
            // Look for checkmate (no moves to play)
            this.gameState = GAMESTATES.CHECKMATE;
        } else if (this.isStaleMate()) {
            // Look for stalemate
            this.gameState = GAMESTATES.DRAW_STALEMATE;
        }
    }

    getCurrentPlayerAttacks() {
        // Get current turn's pieces
        const currentTurnPieces = this.getPiecesOfTeam(false);

        // Calculate moves for each piece and return
        return currentTurnPieces.map((piece) => this.getMoves(piece)).flat();
    }

    getEnemyAttacks() {
        // Get enemy pieces
        const enemyPieces = this.getPiecesOfTeam(true);

        // Calculate moves for each piece and return
        return enemyPieces.map((piece) => this.getMoves(piece, true)).flat();
    }

    isDrawInsufficientPieces() {
        //Is draw if:
        // * King vs. king
        // * King and bishop vs. king
        // * King and knight vs. king
        // * King and bishop vs. king and bishop of the same color as the opponent's bishop
        const onlyKings = this.pieces.length <= 2 && this.pieces.every((piece) => piece instanceof King);
        const onlyBishopOrKnightKings =
            this.pieces.length === 3 &&
            this.pieces.filter((piece) => piece instanceof King).length === 2 &&
            this.pieces.some((piece) => piece instanceof Knight || piece instanceof Bishop);
        const onlyBishopsSameSquareColorKings =
            this.pieces.length === 4 &&
            this.pieces.filter((piece) => piece instanceof King).length === 2 &&
            this.pieces
                .filter((piece) => piece instanceof Bishop)
                .reduce((prevPiece, currentPiece) => {
                    if (prevPiece) {
                        return (
                            BoardUtils.isLightSquare(prevPiece.file, prevPiece.rank) ===
                            BoardUtils.isLightSquare(currentPiece.file, currentPiece.rank)
                        );
                    } else {
                        return currentPiece;
                    }
                });

        return onlyKings || onlyBishopOrKnightKings || onlyBishopsSameSquareColorKings;
    }

    isThreeFoldRepetition() {
        return false;
    }

    isStaleMate() {
        return this.currentPlayerMoves.length === 0;
    }

    isCheckMate() {
        // Check if no moves can be made
        if (!this.isStaleMate()) return false;

        // Get current player king
        const king = this.pieces.find((piece) => piece.isWhite === this.isWhiteTurn && piece instanceof King);

        // Check if king is targeted and return
        return this.pieceIsTargetedByMoves(king).length > 0;
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

        // Filter out moves not on board
        MovesUtils.filterMovesNotOnBoard(joinedMoves);

        // Check if is king
        if (movingPiece instanceof King) {
            // Remove moves on where enemy can attack
            MovesUtils.filterMovesInCommon(joinedMoves, this.enemyAttacks, false);

            // Filter out moves of enemy king
            const enemyKing = this.getPiecesOfTeam(!isEnemyMoves).find((piece) => piece instanceof King);
            const enemyKingMoves = MovesUtils.flattenPieceMoves(enemyKing.getMoves());
            MovesUtils.filterMovesInCommon(joinedMoves, enemyKingMoves, false);

            // Find move that attacks king
            const move = this.enemyAttacks.find((move) => move.file === movingPiece.file && move.rank === movingPiece.rank);
            if (move?.piece) {
                // Get move line (horizontal/vertical/diagonal) through king and enemy that is attacking king
                const lineOfAttack = MovesUtils.generateMovesLineThroughPlacements(
                    move.piece.file,
                    move.piece.rank,
                    movingPiece.file,
                    movingPiece.rank,
                );
                // Remove moves on entire line where enemy can attack, not only moves up until the king itself
                MovesUtils.filterMovesInCommon(joinedMoves, lineOfAttack, false);
            }
        } else if (!isEnemyMoves) {
            // For all other pieces, if it is not an enemy move check
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
        joinedMoves.map((move) => (move.piece = movingPiece));

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
            if (attacksPerEnemy.has(move.piece)) {
                attacksPerEnemy.get(move.piece).push(move);
            } else {
                enemies.push(move.piece);
                // Add move + enemyPiece placement itself to map
                attacksPerEnemy.set(move.piece, [move, { file: move.piece.file, rank: move.piece.rank, piece: move.piece }]);
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
                            this.pastMoves.length > 0 &&
                            // Check if last move was the first move made by the piece
                            this.pastMoves[this.pastMoves.length - 1]?.isFirstMove &&
                            // Check if the last move was made by the piece current piece in loop
                            this.pastMoves[this.pastMoves.length - 1]?.piece === piece &&
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
