import { FILES, GAME_STATES, RANKS } from '../constants/boardConstants.js';
import { PieceUtils } from './pieceUtils.js';
import { Bishop, King, Knight, Pawn, Queen, Rook } from '../models/pieces/index.js';
import { BoardUtils } from './boardUtils.js';
import { Move } from '../models/move.js';
import { PieceTypes } from '../constants/pieceConstants.js';

function generateFenForMove(move) {
    // Generate move notation
    let moveNotation = '';
    if (move.castlingMove) {
        if (move.castlingMove.movingPiece.rank < move.movingPiece.rank) {
            // Castling kingside
            moveNotation = 'O-O-O';
        } else {
            // Castling queenside
            moveNotation = 'O-O';
        }
    } else {
        const pieceNotation = move.movingPiece.TYPE !== PieceTypes.PAWN ? move.movingPiece.fenName.toUpperCase() : '';
        const captureNotation = move.attackedPiece ? 'x' : '';
        const rankFromNotation = BoardUtils.rankNumberToChar(move.movingPiece.rank).toLowerCase();
        const fileFromNotation = `${move.movingPiece.file}`;
        const rankToNotation = BoardUtils.rankNumberToChar(move.rank).toLowerCase();
        const fileToNotation = `${move.file}`;
        moveNotation = `${pieceNotation}${rankFromNotation}${fileFromNotation}${captureNotation}${rankToNotation}${fileToNotation}`;
    }

    // Check if is pawn promotion
    if (move.isPawnPromotion && move.promotedToPiece) {
        moveNotation += `=${move.promotedToPiece.fenName}`;
    }

    // Check if is checking or checmmating move
    if (move.isChecking) {
        moveNotation += '+';
    } else if (move.isCheckMating) {
        moveNotation += '#';
    }

    // Return move
    return moveNotation;
}

function generateFenForMoves(moves) {
    // Filter out null moves (when board was initialized with FEN string and multiple moves were set to null)
    const filteredMoves = moves.filter((move) => move);
    return filteredMoves.map((move) => generateFenForMove(move));
}

function generatePGNForMoves(moves) {
    // Filter out null moves
    const filteredMoves = moves.filter((move) => !!move);
    // Convert moves to FEN notation
    const FENMoves = generateFenForMoves(filteredMoves);

    // Check if black started first move
    let initialMoveText = '';
    let moveCount = 1;
    if (filteredMoves[0]?.movingPiece.isWhite === false) {
        initialMoveText = `${moveCount}... ${FENMoves.shift()} `;
        moveCount++;
    }

    // Add group moves in turns
    const FENTurns = FENMoves.reduce((turns, move) => {
        if (turns.length > 0 && turns[turns.length - 1].length === 1) {
            turns[turns.length - 1].push(move);
        } else {
            turns.push([move]);
        }
        return turns;
    }, []);

    // Convert turns to move text and return
    return FENTurns.reduce(
        (movesText, turn) => movesText + `${moveCount}. ${turn.join(' ')}${FENTurns.length === moveCount ? '' : ' '}`,
        initialMoveText,
    );
}

function generatePGNFromBoard(players, moves, gameState, initialFENString, site) {
    const whitePlayer = players.find((player) => player.isWhite);
    const blackPlayer = players.find((player) => !player.isWhite);
    const date = new Date();
    let result;
    switch (gameState) {
        case GAME_STATES.DRAW_INSUFFICIENT_PIECES:
        case GAME_STATES.DRAW_STALEMATE:
            result = '1/2-1/2';
            break;
        case GAME_STATES.OBSERVING:
        case GAME_STATES.CHECKMATE:
        case GAME_STATES.RESIGNED:
            const whiteWon = moves.length % 2 === 1;
            result = whiteWon ? '1-0' : '0-1';
            break;
        case GAME_STATES.PLAYING:
        default:
            result = '*';
            break;
    }
    // Add tags
    const tags = [
        `[Event "${whitePlayer.name} VS ${blackPlayer.name}"]`,
        `[Site "${site ?? "Cédric's chess game"}"]`,
        `[Date "${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}"]`,
        `[FEN "${initialFENString}"]`,
        `[White "${whitePlayer.name}"]`,
        `[Black "${blackPlayer.name}"]`,
        `[Result "${result}"]`,
    ];
    let moveText = generatePGNForMoves(moves);
    moveText += ` ${result}`;

    // Generate PGN text and return
    return tags.join('\n') + '\n\n' + moveText;
}

function generateFenFromBoard(pieces, isWhiteTurn, halfMoveCount, currentPlayerMoves, pastMoves) {
    // FEN string variable
    let fenString = '';
    let foundPiece,
        skipCount = 0;

    // Add function that adds skip count to string if skips have happened
    function addPossibleSkipCount() {
        if (skipCount > 0) {
            fenString += skipCount;
            skipCount = 0;
        }
    }

    // Loop over pieces
    for (let file = FILES; file > 0; file--) {
        if (file !== FILES) {
            addPossibleSkipCount();
            fenString += '/';
        }
        for (let rank = 1; rank <= RANKS; rank++) {
            foundPiece = pieces.find((piece) => piece.file === file && piece.rank === rank);
            if (foundPiece) {
                addPossibleSkipCount();
                fenString += foundPiece.fenName;
            } else {
                skipCount++;
            }
        }
    }

    // Add active color
    fenString += ` ${isWhiteTurn ? 'w' : 'b'}`;

    // Add castling availability
    function addCastlingPossibility(pieces, isWhiteCheck) {
        const rooks = PieceUtils.getPiecesFromTeam(pieces, PieceTypes.ROOK, isWhiteCheck).sort((a, b) => b.rank - a.rank);
        const king = PieceUtils.getPiecesFromTeam(pieces, PieceTypes.KING, isWhiteCheck).shift();
        return rooks.reduce((castlingString, rook) => {
            if (rook?.isWhite === king?.isWhite && rook?.isFirstMove && king?.isFirstMove && rook?.file === king?.file) {
                let castlingSide = rook.rank < king.rank ? 'q' : 'k';
                castlingString += king.isWhite ? castlingSide.toUpperCase() : castlingSide.toLowerCase();
            }
            return castlingString;
        }, '');
    }
    let castlingString = addCastlingPossibility(pieces, true);
    castlingString += addCastlingPossibility(pieces, false);
    fenString += ` ${castlingString === '' ? '-' : castlingString}`;

    // Add en passant availability
    const enPassantMove = currentPlayerMoves.find((move) => move.isEnPassant);
    fenString += ` ${enPassantMove ? BoardUtils.rankNumberToChar(enPassantMove.rank).toLowerCase() + enPassantMove.file : '-'}`;

    // Add half move count
    fenString += ` ${halfMoveCount}`;

    // Add full move count
    fenString += ` ${pastMoves.length + 1}`;

    // Return fully appended FEN string
    return fenString;
}

const FENStringRegex =
    /^(?<piecePlacement>([pnbrqkPNBRQK1-8]{1,8}\/?){8})\s+(?<sideToMove>[bw])\s?(?<castling>-|K?Q?k?q?)\s+(?<enPassant>-|[a-h][3-6])\s+(?<halfMoveCount>\d+)\s+(?<fullMoveCount>\d+)\s*$/;
// Example: rnbqkbnr/pp2pppp/2p5/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 5
function generateBoardFromFen(fenString) {
    // Parse FEN string
    const result = FENStringRegex.exec(fenString);
    if (!result?.groups) {
        throw Error('Invalid FEN string: ' + fenString);
    }
    const { groups } = result;

    // Get current turn
    const isWhiteTurn = groups.sideToMove.toLowerCase() === 'w';
    // Get halfMoveCount
    const { halfMoveCount } = groups;
    // Get fullMoveCount
    const { fullMoveCount } = groups;

    // Get castling possibilities
    const canWhiteCastleQueenSide = groups.castling.includes('Q');
    const canWhiteCastleKingSide = groups.castling.includes('K');
    const canDarkCastleQueenSide = groups.castling.includes('q');
    const canDarkCastleKingSide = groups.castling.includes('k');
    // Get en passant move
    const { enPassant } = groups;
    let enPassantFile, enPassantRank;
    if (enPassant) {
        enPassantRank = BoardUtils.rankCharToNumber(enPassant.charAt(0));
        enPassantFile = +enPassant.charAt(1);
    }

    // Create pieces and create en passant move if needed
    const pieces = [];
    let enPassantMove;
    let currentFile = FILES;
    let currentRank = 1;
    // Loop over each file
    groups.piecePlacement.split('/').forEach((filePlacement) => {
        // Loop over ranks
        filePlacement.split('').forEach((rankMark) => {
            // Check if is rank skip or piece marking
            if (!isNaN(+rankMark)) {
                // Add rank skip to current rank
                currentRank += +rankMark;
            } else {
                // Get piece color
                let isWhite = rankMark.toUpperCase() === rankMark;

                // Get piece type
                let PieceClass;
                if (['p', 'P'].includes(rankMark)) {
                    PieceClass = Pawn;
                } else if (['r', 'R'].includes(rankMark)) {
                    PieceClass = Rook;
                } else if (['n', 'N'].includes(rankMark)) {
                    PieceClass = Knight;
                } else if (['b', 'B'].includes(rankMark)) {
                    PieceClass = Bishop;
                } else if (['q', 'Q'].includes(rankMark)) {
                    PieceClass = Queen;
                } else if (['k', 'K'].includes(rankMark)) {
                    PieceClass = King;
                }
                // Create piece
                let piece = new PieceClass(currentFile, currentRank, isWhite, true);
                // Check current placement has a pawn and an en passant move needs to be generated
                if (piece.TYPE === PieceTypes.PAWN) {
                    // Check if is pawn first move
                    let firstMoveFile = piece.isWhite ? 2 : 7;
                    piece.isFirstMove = piece.file === firstMoveFile;
                    if (!enPassantMove && enPassantRank === currentRank && currentFile) {
                        let fileToCheck = currentFile + (isWhite ? -1 : 1);
                        if (fileToCheck === enPassantFile) {
                            enPassantMove = new Move(enPassantFile, enPassantRank, piece);
                            piece.isFirstMove = false;
                        }
                    }
                } else if (piece.TYPE === PieceTypes.ROOK) {
                    // Check if is queen side rook
                    if (piece.rank === 1) {
                        piece.isFirstMove = piece.isWhite ? canWhiteCastleQueenSide : canDarkCastleQueenSide;
                    } else {
                        piece.isFirstMove = piece.isWhite ? canWhiteCastleKingSide : canDarkCastleKingSide;
                    }
                }

                // Add piece to pieces
                pieces.push(piece);

                // Update current rank
                currentRank++;
            }
        });

        // Set new file and reset rank
        currentFile--;
        currentRank = 1;
    });

    // Return data to board
    return {
        pieces,
        isWhiteTurn,
        halfMoveCount,
        fullMoveCount,
        pastMove: enPassantMove,
    };
}

export const FENUtils = {
    generateFenFromBoard,
    generateBoardFromFen,
    generateFenForMove,
    generateFenForMoves,
    generatePGNForMoves,
    generatePGNFromBoard,
};
