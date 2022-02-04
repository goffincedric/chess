import { MovesUtils } from '../utils/movesUtils.js';
import { BoardUtils } from '../utils/boardUtils.js';
import { GAME_STATES } from '../constants/boardConstants.js';
import { PieceUtils } from '../utils/pieceUtils.js';
import { PlacementUtils } from '../utils/placementUtils.js';
import { DEFAULT_PIECES_LAYOUT_FEN, PieceTypes } from '../constants/pieceConstants.js';
import { Placement } from './placement.js';
import { Move } from './move.js';
import { FENUtils } from '../utils/fenUtils.js';

export class Board {
    players;
    initialFENString;

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

    constructor(player1, player2, initialFENString) {
        this.players = [player1, player2];
        this.resetGame(initialFENString);
    }

    // TODO: Check string 'rnb1kbnr/pppp3p/6p1/1N3pq1/6P1/5p1B/PPPPP2P/RNBQKR b -Qkq - 1 16'
    resetGame(initialFENString) {
        this.players.forEach((player) => player.clearCapturedPieces());
        this.initializePieces(initialFENString);
        this._pastPiecesCount = this.pieces.length;
        this.currentPlayerMoves = this.getCurrentPlayerAttacks();
        this.enemyAttacks = this.getEnemyAttacks();

        // Set game state to playing
        this.gameState = GAME_STATES.PLAYING;
    }

    initializePieces(initialFENString) {
        // Set FEN string to standard if not defined
        this.initialFENString = initialFENString ?? DEFAULT_PIECES_LAYOUT_FEN;

        // Set standard board
        this.movingPiece = null;
        this.movingPieceMoves = null;
        this.pawnToPromote = null;
        this.enemyAttacks = [];
        this.currentPlayerMoves = [];

        // Initialize with FEN notation
        const boardData = FENUtils.generateBoardFromFen(this.initialFENString);
        this.pieces = boardData.pieces;
        this.isWhiteTurn = boardData.isWhiteTurn;
        this.halfMovesCount = boardData.halfMoveCount;
        this.pastMoves = Array((boardData.fullMoveCount - 1) * 2).fill(null);
        if (boardData.pastMove) {
            this.pastMoves[this.pastMoves - 1] = boardData.pastMove;
        }
    }

    getPieceByPosition(x, y) {
        const position = BoardUtils.positionToPlacement(x, y);
        return PieceUtils.getPieceByPlacement(this.pieces, position.file, position.rank);
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

    resignGame() {
        chessBoard.gameState = GAME_STATES.RESIGNED;
    }

    movePiece(movingPiece, newPlacement) {
        // Check if is new placement
        if (movingPiece.file !== newPlacement.file || movingPiece.rank !== newPlacement.rank) {
            // Get move of movingPiece to file and rank
            const move = this.movingPieceMoves.find((move) => move.file === newPlacement.file && move.rank === newPlacement.rank);
            // Check if move was found
            if (move) {
                // Check for attacked pieces
                if (move.attackedPiece) {
                    // Get index of piece from list of pieces
                    const attackedPieceIndex = this.pieces.findIndex(
                        (piece) => piece.file === move.attackedPiece.file && piece.rank === move.attackedPiece.rank,
                    );
                    if (attackedPieceIndex >= 0) {
                        const capturedPiece = this.pieces.splice(attackedPieceIndex, 1).shift();
                        // Add captured piece to player's pieces
                        const currentPlayer = this.players.find((player) => player.isWhite === this.isWhiteTurn);
                        currentPlayer.addCapturedPiece(capturedPiece);
                    }
                }

                // Set piece placement
                movingPiece.setPlacement(move.file, move.rank);

                /**
                 * Check for multi-piece moves
                 */
                // Check if move is castling move
                if (move.castlingMove) {
                    // Find rook to castle and move it too
                    const rook = this.pieces.find(
                        (piece) => piece.file === move.castlingMove.movingPiece.file && piece.rank === move.castlingMove.movingPiece.rank,
                    );
                    rook.setPlacement(move.castlingMove.file, move.castlingMove.rank);
                }

                // Add move to moves
                this.pastMoves.push(move);

                // Check if is pawn promotion
                if (move.isPawnPromotion) {
                    this.pawnToPromote = movingPiece;
                } else {
                    // Set next turn
                    this.toggleTurn();
                }
            }
        }

        // Reset moving piece
        this.resetMovingPiece();
    }

    promotePawn(promotedToPiece) {
        // Check if last move was pawn promotion move
        const lastMove = this.pastMoves[this.pastMoves.length - 1];
        if (lastMove.isPawnPromotion) {
            // Get pawn to promote
            const pawnToPromote = this.pieces.find(
                (piece) => piece.isWhite === this.isWhiteTurn && piece.TYPE === PieceTypes.PAWN && piece.file === piece.promotionFile,
            );
            if (pawnToPromote) {
                // Remove pawn from game
                const indexToRemove = this.pieces.indexOf(pawnToPromote);
                this.pieces.splice(indexToRemove, 1);

                // Add promotedToPiece to move
                lastMove.setPawnPromotionPiece(promotedToPiece);

                // Add promotedToPiece to pieces
                this.pieces.push(promotedToPiece);

                // Clear piece to promote
                this.pawnToPromote = null;

                // Toggle turn
                this.toggleTurn();
            }
        }
    }

    toggleTurn() {
        this.isWhiteTurn = !this.isWhiteTurn;
        if (
            this._pastPiecesCount !== this.pieces.length ||
            this.pastMoves[this.pastMoves.length - 1].movingPiece.TYPE === PieceTypes.PAWN
        ) {
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
            this.gameState = GAME_STATES.DRAW_INSUFFICIENT_PIECES;
        } else if (this.isThreeFoldRepetition()) {
            // TODO: Fix threefold repetition. First, implement resignations
            console.log(`Stalemate, the same move was played three times.`);
        } else if (this.isCheckMate()) {
            // Look for checkmate (no moves to play)
            const lastMove = this.pastMoves[this.pastMoves.length - 1];
            lastMove.isChecking = false;
            lastMove.isCheckMating = true;
            this.gameState = GAME_STATES.CHECKMATE;
        } else if (this.isStaleMate()) {
            // Look for stalemate
            this.gameState = GAME_STATES.DRAW_STALEMATE;
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
        const onlyKings = this.pieces.length <= 2 && this.pieces.every((piece) => piece.TYPE === PieceTypes.KING);
        const onlyBishopOrKnightKings =
            this.pieces.length === 3 &&
            this.pieces.filter((piece) => piece.TYPE === PieceTypes.KING).length === 2 &&
            this.pieces.some((piece) => piece.TYPE === PieceTypes.KNIGHT || piece.TYPE === PieceTypes.BISHOP);
        const onlyBishopsSameSquareColorKings =
            this.pieces.length === 4 &&
            this.pieces.filter((piece) => piece.TYPE === PieceTypes.KING).length === 2 &&
            this.pieces
                .filter((piece) => piece.TYPE === PieceTypes.BISHOP)
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
        // TODO
        return false;
    }

    isStaleMate() {
        return this.currentPlayerMoves.length === 0;
    }

    isCheckMate() {
        // Check if no moves can be made
        if (!this.isStaleMate()) return false;

        // Get current player king
        const king = this.pieces.find((piece) => piece.isWhite === this.isWhiteTurn && piece.TYPE === PieceTypes.KING);

        // Check if king is targeted and return
        return this.getPlacementsBetweenAttackersAndPiece(king).length > 0;
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

        // Add attacking and defending pieces to moves
        MovesUtils.addAttackedDefendedPiecesToMoves(nonSlidingMoves, this.pieces);
        // Filter out illegal moves
        MovesUtils.truncateMoveDirections(horizontalMoves, this.pieces, isEnemyMoves);
        MovesUtils.truncateMoveDirections(verticalMoves, this.pieces, isEnemyMoves);
        MovesUtils.truncateMoveDirections(diagonalMoves, this.pieces, isEnemyMoves);
        if (!isEnemyMoves) {
            MovesUtils.filterSamePieceMoves(nonSlidingMoves, this.pieces, movingPiece);
        }

        // Check if is pawn
        if (movingPiece.TYPE === PieceTypes.PAWN) {
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

        // Filter out non-attacking moves if is enemy check
        if (isEnemyMoves) {
            MovesUtils.filterNonAttackingMoves(joinedMoves);
        }

        // Filter out moves not on board
        MovesUtils.removeMovesNotOnBoard(joinedMoves);

        // Check if is king
        if (movingPiece.TYPE === PieceTypes.KING) {
            if (!isEnemyMoves) {
                // Remove moves on where enemy can attack
                PlacementUtils.filterPlacementsInCommon(joinedMoves, this.enemyAttacks, false);
            }

            // Filter out moves of enemy king
            const enemyKing = this.getPiecesOfTeam(!isEnemyMoves).find((piece) => piece.TYPE === PieceTypes.KING);
            const enemyKingMoves = MovesUtils.flattenPieceMoves(enemyKing.getMoves());
            PlacementUtils.filterPlacementsInCommon(joinedMoves, enemyKingMoves, false);

            // Find pieces that attack king
            const move = this.enemyAttacks.find((move) => move.file === movingPiece.file && move.rank === movingPiece.rank);
            if (move?.movingPiece) {
                // Get move line (horizontal/vertical/diagonal) through king and enemy that is attacking king
                const lineOfAttack = PlacementUtils.generatePlacementsLineThroughPlacements(
                    move.movingPiece.file,
                    move.movingPiece.rank,
                    movingPiece.file,
                    movingPiece.rank,
                );
                if (lineOfAttack.length > 1) {
                    // Remove moves on entire line where enemy can attack, not only moves up until the king itself
                    PlacementUtils.filterPlacementsInCommon(joinedMoves, lineOfAttack, false);
                }
            }
        } else if (!isEnemyMoves) {
            // For all other pieces, only if is not an enemy move check
            /**
             * Block check
             */
            // Get king
            const king = this.pieces.find((piece) => piece.isWhite === movingPiece.isWhite && piece.TYPE === PieceTypes.KING);
            // Get moves of pieces targeting king
            const placementsTargetingKing = this.getPlacementsBetweenAttackersAndPiece(king);
            // Check if king is under attack
            if (placementsTargetingKing.length > 0) {
                // Set past move as checking
                if (this.pastMoves.length > 0) {
                    this.pastMoves[this.pastMoves.length - 1].isChecking = true;
                }
                PlacementUtils.filterPlacementsInCommon(joinedMoves, placementsTargetingKing, true);
            }

            /**
             * Don't break blocked check
             */
            if (joinedMoves.length > 0) {
                const slidingPieces = this.getPiecesOfTeam(true).filter(
                    (piece) => piece.isSlidingPiece && !(piece.TYPE === PieceTypes.PAWN || piece.TYPE === PieceTypes.KING),
                );
                slidingPieces.forEach((slidingEnemyPiece) => {
                    // Get moves between piece and king
                    const movesBetween = PlacementUtils.generatePlacementsBetweenPlacements(
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
                        if (PlacementUtils.hasPlacementsInCommon(movesBetween, movesAvailable)) {
                            // Get piece on each move placement and filter out empty placements
                            const piecesOnMoves = movesBetween
                                .map((move) => PieceUtils.getPieceByPlacement(this.pieces, move.file, move.rank))
                                .filter((piece) => !!piece);
                            // Check if movingPiece is the only piece between enemy
                            if (piecesOnMoves.length === 1 && piecesOnMoves.includes(movingPiece)) {
                                // Keep only moves targeting enemy piece
                                PlacementUtils.filterPlacementsInCommon(joinedMoves, [slidingEnemyPiece], true);
                            }
                        }
                    }
                });
            }
        }

        // Return moves
        return joinedMoves;
    }

    getPlacementsBetweenAttackersAndPiece(attackedPiece) {
        // Filters out moves that are attacking the attackedPiece's placement
        const movesAttackingPiece = this.enemyAttacks.filter(
            (move) => move.attackedPiece?.file === attackedPiece.file && move.attackedPiece?.rank === attackedPiece.rank,
        );

        // Generate placements between attacking pieces and attackedPiece
        return movesAttackingPiece.flatMap((move) => {
            // Check if movingPiece is sliding piece (anything but a knight)
            if (!move.movingPiece.isSlidingPiece) {
                // Return only enemy's placement
                return [new Placement(move.movingPiece.file, move.movingPiece.rank)];
            } else {
                // Generate and return placements line between attackedPiece and attacking piece (including attacking piece's current placement)
                return PlacementUtils.generatePlacementsBetweenPlacements(
                    attackedPiece.file,
                    attackedPiece.rank,
                    move.movingPiece.file,
                    move.movingPiece.rank,
                    false,
                    true,
                );
            }
        });
    }

    getMultiPieceMoves(movingPiece) {
        // Generate multi-piece pawn moves
        const multiPieceMoves = [];

        // En passant
        if (movingPiece.TYPE === PieceTypes.PAWN) {
            // Find a piece that can be attacked by en passant
            const foundPiece = movingPiece
                .getEnPassantSpaces()
                .map((placement) =>
                    // Get piece for each placement
                    this.pieces.find(
                        (piece) =>
                            piece.isWhite !== movingPiece.isWhite &&
                            piece.TYPE === PieceTypes.PAWN &&
                            // Check if piece is in en passant space
                            piece.file === placement.file &&
                            piece.rank === placement.rank &&
                            // Check if any past moves were made
                            this.pastMoves.length > 0 &&
                            // Check if last move was the first move made by the piece
                            this.pastMoves[this.pastMoves.length - 1]?.movingPiece.isFirstMove &&
                            // Check if the last move was made by the piece current piece in loop
                            this.pastMoves[this.pastMoves.length - 1].file === piece.file &&
                            this.pastMoves[this.pastMoves.length - 1].rank === piece.rank,
                    ),
                )
                .find((piece) => !!piece);
            if (foundPiece) {
                // Get attacking space placement where the rank is the same as the attack piece's rank
                const attackingPlacement = movingPiece
                    .getAttackingSpaces()
                    .find((attackingSpace) => attackingSpace.rank === foundPiece.rank);
                // Create en passant move and add to multiPieceMoves
                const enPassantMove = new Move(attackingPlacement.file, attackingPlacement.rank, movingPiece);
                enPassantMove.setEnPassantPawn(foundPiece);
                multiPieceMoves.push(enPassantMove);
            }
        }

        // Generate castling moves
        if (movingPiece.TYPE === PieceTypes.KING && movingPiece.isFirstMove) {
            // Get rooks that haven't moved yet
            let rooks = this.pieces.filter(
                (piece) => piece.isFirstMove && piece.isWhite === movingPiece.isWhite && piece.TYPE === PieceTypes.ROOK,
            );

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
                const horizontalSpaces = PlacementUtils.generateHorizontalPlacementsBetween(
                    rook.file,
                    rook.rank,
                    movingPiece.rank,
                    true,
                    true,
                );
                // Check if any spaces are under attack
                PlacementUtils.filterPlacementsInCommon(horizontalSpaces, this.enemyAttacks, true);
                return horizontalSpaces.length === 0;
            });

            // Generate castling moves for remaining rooks
            let castleMoves = rooks.map((rook) => {
                let offset = rook.rank < movingPiece.rank ? -1 : 1;
                const castleMove = new Move(movingPiece.file, movingPiece.rank + 2 * offset, movingPiece);
                castleMove.setCastlingMove(rook, new Placement(rook.file, movingPiece.rank + 1 * offset));
                return castleMove;
            });

            multiPieceMoves.push(...castleMoves);
        }

        // Return multi-piece moves
        return multiPieceMoves;
    }

    getPiecesOfTeam(enemy) {
        return this.pieces.filter(
            (piece) => (enemy && piece.isWhite !== this.isWhiteTurn) || (!enemy && piece.isWhite === this.isWhiteTurn),
        );
    }
}
