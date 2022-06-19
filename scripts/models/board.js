import { MovesUtils } from '../utils/movesUtils.js';
import { BoardUtils } from '../utils/boardUtils.js';
import { PieceUtils } from '../utils/pieceUtils.js';
import { PlacementUtils } from '../utils/placementUtils.js';
import { PieceTypes } from '../constants/pieceConstants.js';
import { Placement } from './placement.js';
import { Move } from './move.js';
import { FENUtils } from '../utils/fenUtils.js';
import { FENConstants } from '../constants/fenConstants.js';
import { GameConstants } from '../constants/gameConstants.js';
import { Pawn } from './pieces/index.js';

export class Board {
    /**
     * @type {[Player, Player]}
     */
    players;
    /**
     * @type {string}
     */
    initialFENString;

    /**
     * @type {number}
     */
    _pastPiecesCount;
    /**
     * @type {(Pawn | Rook | Knight | Bishop | Queen | King | Piece)[]}
     */
    pieces;

    /**
     * @type {Piece}
     */
    movingPiece;
    /**
     * @type {Move[]}
     */
    movingPieceMoves;

    /**
     * @type {boolean}
     */
    isWhiteTurn;
    /**
     * @type {Piece}
     */
    pawnToPromote;

    /**
     * @type {Move[]}
     */
    pastMoves;

    /**
     * @type {Move[]}
     */
    enemyAttacks = [];
    /**
     * @type {Move[]}
     */
    currentPlayerMoves = [];

    /**
     * @type {string}
     */
    gameState;

    /**
     * Variable that holds the amount of half moves made since last capture, for 50-move rule
     * (1 full move === each player made a move, so 10 full moves = 50/51 half moves)
     * @type {number}
     */
    halfMovesCount = 0;

    constructor(player1, player2, initialFENString) {
        this.players = [player1, player2];
        this.resetGame(initialFENString);
    }

    resetGame(initialFENString) {
        // Set up initial board
        this.players.forEach((player) => player.clearCapturedPieces());
        this.initializePieces(initialFENString);
        this._pastPiecesCount = this.pieces.length;
        this.currentPlayerMoves = this.getCurrentPlayerAttacks();
        this.enemyAttacks = this.getEnemyAttacks();

        // Set game state to playing
        this.gameState = GameConstants.States.PLAYING;
    }

    initializePieces(initialFENString) {
        // Set FEN string to standard if not defined
        this.initialFENString = initialFENString ?? FENConstants.DEFAULT_FEN_LAYOUT;

        // Set standard board
        this.movingPiece = null;
        this.movingPieceMoves = null;
        this.pawnToPromote = null;
        this.enemyAttacks = [];
        this.currentPlayerMoves = [];

        // Initialize with FEN notation
        const boardData = FENUtils.generateBoardFromFEN(this.initialFENString);
        this.pieces = boardData.pieces;
        this.isWhiteTurn = boardData.isWhiteTurn;
        this.halfMovesCount = boardData.halfMoveCount;
        this.pastMoves = Array((boardData.fullMoveCount - 1) * 2).fill(null);
        if (!this.isWhiteTurn) this.pastMoves.push(null);
        if (boardData.pastMove) {
            this.pastMoves[this.pastMoves.length - 1] = boardData.pastMove;
        }
    }

    getPieceByPosition(x, y, isFlipped) {
        const placement = BoardUtils.positionToPlacement(x, y, isFlipped);
        return this.getPieceByPlacement(placement.file, placement.rank);
    }

    getPieceByPlacement(file, rank) {
        return PieceUtils.getPieceByPlacement(this.pieces, file, rank);
    }

    getPieceIndexByPlacement(file, rank) {
        return PieceUtils.getPieceIndexByPlacement(this.pieces, file, rank);
    }

    /**
     * @param {Piece} piece
     */
    setMovingPiece(piece) {
        if (piece) {
            this.movingPiece = piece;
            this.movingPieceMoves = this.currentPlayerMoves.filter(
                (move) => move.movingPiece.file === piece.file && move.movingPiece.rank === piece.rank,
            );
        }
    }

    clearMovingPiece() {
        this.movingPiece = null;
        this.movingPieceMoves = null;
    }

    resignGame() {
        this.gameState = GameConstants.States.RESIGNED;
    }

    undoLastMove() {
        if (this.pastMoves.length > 0) {
            // Remove last move made
            const undoneMove = this.pastMoves.pop();
            // Get piece that moved
            const movedPieceIndex = this.getPieceIndexByPlacement(undoneMove.file, undoneMove.rank);
            const movedPiece = this.pieces[movedPieceIndex];
            // Move piece back
            movedPiece.setPlacement(undoneMove.movingPiece.file, undoneMove.movingPiece.rank, undoneMove.movingPiece.isFirstMove);

            // Replace piece by pawn if was pawn promotion
            if (undoneMove.isPawnPromotion) {
                this.pieces[movedPieceIndex] = new Pawn(movedPiece.file, movedPiece.rank, movedPiece.isWhite, false);
            } else if (undoneMove.castlingMove) {
                // Move castling rook back
                const movedRook = this.getPieceByPlacement(undoneMove.castlingMove.file, undoneMove.castlingMove.rank);
                movedRook.setPlacement(
                    undoneMove.castlingMove.movingPiece.file,
                    undoneMove.castlingMove.movingPiece.rank,
                    undoneMove.castlingMove.movingPiece.isFirstMove,
                );
            }

            // Place captured piece back
            if (undoneMove.attackedPiece) {
                // Get player that captured the piece
                const player = this.players.find((player) => player.isWhite === undoneMove.movingPiece.isWhite);
                const reverseCapturedPieces = player.getCapturedPiecesList().reverse();
                // Get piece that was captured
                const capturedPiece = reverseCapturedPieces.find(
                    (piece) =>
                        piece.TYPE === undoneMove.attackedPiece.TYPE &&
                        piece.isWhite === undoneMove.attackedPiece.isWhite &&
                        piece.file === undoneMove.attackedPiece.file &&
                        piece.rank === undoneMove.attackedPiece.rank,
                );
                // Put piece back on board
                player.removeCapturedPiece(capturedPiece);
                this.pieces.push(capturedPiece);
            }

            // Set gameState to playing
            this.gameState = GameConstants.States.PLAYING;

            // Toggle turn
            this.toggleTurn(true);
        }
    }

    /**
     *
     * @param {Placement} newPlacement
     */
    movePiece(newPlacement) {
        // Check if is new placement
        if (this.movingPiece.file !== newPlacement.file || this.movingPiece.rank !== newPlacement.rank) {
            // Get move of movingPiece to file and rank
            const move = this.movingPieceMoves.find((move) => move.file === newPlacement.file && move.rank === newPlacement.rank);
            // Check if move was found
            if (move) {
                // Check for attacked pieces
                if (move.attackedPiece) {
                    // Get index of piece from list of pieces
                    const attackedPieceIndex = this.getPieceIndexByPlacement(move.attackedPiece.file, move.attackedPiece.rank);
                    if (attackedPieceIndex >= 0) {
                        const capturedPiece = this.pieces.splice(attackedPieceIndex, 1).shift();
                        // Add captured piece to player's pieces
                        const currentPlayer = this.players.find((player) => player.isWhite === this.isWhiteTurn);
                        currentPlayer.addCapturedPiece(capturedPiece);
                    }
                }

                // Set piece placement
                this.movingPiece.setPlacement(move.file, move.rank);

                /**
                 * Check for multi-piece moves
                 */
                // Check if move is castling move
                if (move.castlingMove) {
                    // Find rook to castle and move it too
                    const rook = this.getPieceByPlacement(move.castlingMove.movingPiece.file, move.castlingMove.movingPiece.rank);
                    rook.setPlacement(move.castlingMove.file, move.castlingMove.rank);
                }

                // Add move to moves
                this.pastMoves.push(move);

                // Check if is pawn promotion
                if (move.isPawnPromotion) {
                    this.pawnToPromote = this.movingPiece;
                } else {
                    // Set next turn
                    this.toggleTurn();
                }
            }
        }

        // Reset moving piece
        this.clearMovingPiece();
    }

    promotePawn(PieceClassConstructor) {
        // Check if last move was pawn promotion move
        const lastMove = this.pastMoves[this.pastMoves.length - 1];
        if (lastMove.isPawnPromotion) {
            // Get pawn to promote
            const pawnToPromote = this.pieces.find(
                (piece) => piece.isWhite === this.isWhiteTurn && piece.TYPE === PieceTypes.PAWN && piece.rank === piece.promotionRank,
            );
            if (pawnToPromote) {
                // Create new instance of chosen piece class
                const promotedPiece = new PieceClassConstructor(pawnToPromote.file, pawnToPromote.rank, pawnToPromote.isWhite, false);

                // Remove pawn from game
                const indexToRemove = this.pieces.indexOf(pawnToPromote);
                this.pieces.splice(indexToRemove, 1);

                // Add promotedToPiece to move
                lastMove.setPawnPromotionPiece(promotedPiece);

                // Add promotedToPiece to pieces
                this.pieces.push(promotedPiece);

                // Clear piece to promote
                this.pawnToPromote = null;

                // Toggle turn
                this.toggleTurn();
            }
        }
    }

    toggleTurn(isUndo = false) {
        this.isWhiteTurn = !this.isWhiteTurn;
        if (isUndo) {
            // Set halfMoveCount to amount of moves no pawns were moved and no pieces were captured
            const reversedMoves = [...this.pastMoves].reverse();
            this.halfMovesCount = Math.max(
                reversedMoves.findIndex((move) => move.movingPiece.TYPE === PieceTypes.PAWN || move.attackedPiece),
                0,
            );

            // Set pastPieceCount
            this._pastPiecesCount = this.pieces.length;
        } else {
            if (
                this._pastPiecesCount !== this.pieces.length ||
                this.pastMoves[this.pastMoves.length - 1].movingPiece.TYPE === PieceTypes.PAWN
            ) {
                this._pastPiecesCount = this.pieces.length;
                this.halfMovesCount = 0;
            } else {
                this.halfMovesCount++;
            }
        }

        // Get all moves enemy player can play
        this.enemyAttacks = this.getEnemyAttacks();

        // Get all moves current player can play
        this.currentPlayerMoves = this.getCurrentPlayerAttacks();

        // Look for draw
        if (this.isDrawInsufficientPieces()) {
            this.gameState = GameConstants.States.DRAW_INSUFFICIENT_PIECES;
        } else if (this.isThreeFoldRepetition()) {
            // TODO: Fix threefold repetition. First, implement resignations
            console.log(`Stalemate, the same move was played three times.`);
        } else if (this.isCheckMate()) {
            // Look for checkmate (no moves to play)
            const lastMove = this.pastMoves[this.pastMoves.length - 1];
            lastMove.isChecking = false;
            lastMove.isCheckMating = true;
            this.gameState = GameConstants.States.CHECKMATE;
        } else if (this.isStaleMate()) {
            // Look for stalemate
            this.gameState = GameConstants.States.DRAW_STALEMATE;
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
        // Is draw if:
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

    isCheckedBy() {
        if (this.pastMoves.length) {
            const lastMove = this.pastMoves[this.pastMoves.length - 1];
            if (lastMove.isChecking) {
                return lastMove.movingPiece;
            }
        }
        return null;
    }

    /**
     *
     * @param {Piece} movingPiece
     * @param {boolean} isEnemyMoves
     * @returns {Move[]}
     */
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
                // Check if king can attack attacking piece
                const attackLine = PlacementUtils.generatePlacementsBetweenPlacements(
                    movingPiece.file,
                    movingPiece.rank,
                    move.movingPiece.file,
                    move.movingPiece.rank,
                    false,
                    true,
                );
                // Don't remove entire line if enemy is 1 square away from king
                if (attackLine.length > 1) {
                    // Get move line (horizontal/vertical/diagonal) through king and enemy that is attacking king
                    const lineOfEnemyAttack = PlacementUtils.generatePlacementsLineThroughPlacements(
                        move.movingPiece.file,
                        move.movingPiece.rank,
                        movingPiece.file,
                        movingPiece.rank,
                    );
                    // Remove moves on entire line where enemy can attack, not only moves up until the king itself
                    PlacementUtils.filterPlacementsInCommon(joinedMoves, lineOfEnemyAttack, false);
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
                // TODO: Set isChecking on move generation
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
                                // Keep only moves targeting enemy piece and in between defending piece and attacking piece
                                const placementsBetween = PlacementUtils.generatePlacementsBetweenPlacements(
                                    movingPiece.file,
                                    movingPiece.rank,
                                    slidingEnemyPiece.file,
                                    slidingEnemyPiece.rank,
                                    false,
                                    true,
                                );
                                PlacementUtils.filterPlacementsInCommon(joinedMoves, placementsBetween, true);
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
                // Get attacking space placement where the file is the same as the attacked piece's file
                const attackingPlacement = movingPiece
                    .getAttackingSpaces()
                    .find((attackingSpace) => attackingSpace.file === foundPiece.file);
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
                // Check if rook is on same rank as king
                if (rook.rank !== movingPiece.rank) {
                    return false;
                }

                // Calculate minimum and maximum rank of king and rook
                const minFile = Math.min(rook.file, movingPiece.file);
                const maxFile = Math.max(rook.file, movingPiece.file);

                // Keep rooks that have no other pieces between it and king
                const hasPiecesBetween = this.pieces.some(
                    (piece) => piece.rank === rook.rank && piece.file > minFile && piece.file < maxFile,
                );
                if (hasPiecesBetween) {
                    return false;
                }

                // Keep rooks that aren't under attack and have no attacked spaces between rook and king
                // Generate spaces between rook and king, including rook and king placements
                const horizontalSpaces = PlacementUtils.generateHorizontalPlacementsBetween(
                    rook.rank,
                    rook.file,
                    movingPiece.file,
                    true,
                    true,
                );
                // Check if any spaces are under attack
                PlacementUtils.filterPlacementsInCommon(horizontalSpaces, this.enemyAttacks, true);
                return horizontalSpaces.length === 0;
            });

            // Generate castling moves for remaining rooks
            let castleMoves = rooks.map((rook) => {
                let offset = rook.file < movingPiece.file ? -1 : 1;
                const castleMove = new Move(movingPiece.file + 2 * offset, movingPiece.rank, movingPiece);
                castleMove.setCastlingMove(rook, new Placement(movingPiece.file + 1 * offset, rook.rank));
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

    getGameName() {
        const whitePlayer = this.players.find((player) => player.isWhite);
        const blackPlayer = this.players.find((player) => !player.isWhite);
        return `${whitePlayer.name} VS ${blackPlayer.name}`;
    }

    getFEN() {
        return FENUtils.generateFENFromBoard(this.pieces, this.isWhiteTurn, this.halfMovesCount, this.currentPlayerMoves, this.pastMoves);
    }

    getPGN(siteName = null) {
        return FENUtils.generatePGNFromBoard(
            this.getGameName(),
            siteName,
            this.initialFENString,
            this.players,
            this.pastMoves,
            this.gameState,
        );
    }
}
