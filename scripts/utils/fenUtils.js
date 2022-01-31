import { FILES, RANKS } from '../constants/boardConstants.js';
import { PieceUtils } from './pieceUtils.js';
import { Rook } from '../models/pieces/rook.js';
import { King } from '../models/pieces/king.js';
import { BoardUtils } from './boardUtils.js';
import { Pawn } from '../models/pieces/pawn.js';
import { Knight } from '../models/pieces/knight.js';
import { Bishop } from '../models/pieces/bishop.js';
import { Queen } from '../models/pieces/queen.js';
import { Move } from '../models/move.js';
import { PieceTypes } from '../constants/pieceConstants.js';

const FENStringRegex =
    /^(?<piecePlacement>([pnbrqkPNBRQK1-8]{1,8}\/?){8})\s+(?<sideToMove>[bw])\s+(?<castling>-|K?Q?k?q)\s+(?<enPassant>-|[a-h][3-6])\s+(?<halfMoveCount>\d+)\s+(?<fullMoveCount>\d+)\s*$/;

// TODO
function generateFenForMove(move) {
    throw new Error('Not implemented yet');
}

function generateFenForMoves(moves) {
    // Filter out null moves (when board was initialized with FEN string and multiple moves were set to null)
    const filteredMoves = moves.filter(move => move);
    return filteredMoves.map(move => generateFenForMove(move));
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
    function addCastlingPossibility(rook, king) {
        if (rook?.isWhite === king?.isWhite && rook?.isFirstMove && king?.isFirstMove && rook?.file === king?.file) {
            let castlingSide = rook.rank < king.rank ? 'q' : 'k';
            fenString += king.isWhite ? castlingSide.toUpperCase() : castlingSide.toLowerCase();
        } else {
            fenString += '-';
        }
    }
    fenString += ' ';
    const whiteRooks = PieceUtils.getPiecesFromTeam(pieces, PieceTypes.ROOK, true).sort((a, b) => b.rank - a.rank);
    const whiteKing = PieceUtils.getPiecesFromTeam(pieces, PieceTypes.KING, true).shift();
    whiteRooks.forEach((rook) => addCastlingPossibility(rook, whiteKing));
    const darkRooks = PieceUtils.getPiecesFromTeam(pieces, PieceTypes.ROOK, false).sort((a, b) => b.rank - a.rank);
    const darkKing = PieceUtils.getPiecesFromTeam(pieces, PieceTypes.KING, false).shift();
    darkRooks.forEach((rook) => addCastlingPossibility(rook, darkKing));

    // Add en passant availability
    const enPassantMove = currentPlayerMoves.find((move) => move.enPassant);
    fenString += ` ${enPassantMove ? BoardUtils.rankNumberToChar(enPassantMove.rank).toLowerCase() + enPassantMove.file : '-'}`;

    // Add half move count
    fenString += ` ${halfMoveCount}`;

    // Add full move count
    fenString += ` ${pastMoves.length + 1}`;

    // Return fully appended FEN string
    return fenString;
}

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
                    let firstMoveFile = (piece.isWhite) ? 2 : 7;
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
                        piece.isFirstMove = (piece.isWhite) ? canWhiteCastleQueenSide : canDarkCastleQueenSide;
                    } else {
                        piece.isFirstMove = (piece.isWhite) ? canWhiteCastleKingSide : canDarkCastleKingSide;
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
};
