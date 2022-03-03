import { FILES, RANKS } from '../constants/boardConstants.js';
import { PieceUtils } from './pieceUtils.js';
import { Bishop, King, Knight, Pawn, Queen, Rook } from '../models/pieces/index.js';
import { BoardUtils } from './boardUtils.js';
import { Move } from '../models/move.js';
import { PieceTypes } from '../constants/pieceConstants.js';
import { RegexConstants } from '../constants/regexConstants.js';
import { FENConstants } from '../constants/fenConstants.js';
import { Player } from '../models/player.js';
import { Board } from '../models/board.js';
import { Placement } from '../models/placement.js';
import { GameConstants } from '../constants/gameConstants.js';

function generatePGNForMoves(moves) {
    // Convert moves to FEN notation
    const FENMoves = generateFENForMoves(moves);

    // Group moves in turns
    let FENTurns = FENMoves.reduce((turns, move) => {
        if (turns.length > 0 && turns[turns.length - 1].length === 1) {
            turns[turns.length - 1].push(move);
        } else {
            turns.push([move]);
        }
        return turns;
    }, []);

    // Set starting move count and filter out empty turns
    let moveCount = 1;
    FENTurns = FENTurns.filter((turn) => {
        if (turn[1] === null) {
            moveCount += 1;
            return false;
        } else if (turn[0] === null) {
            turn.shift();
        }
        return true;
    });

    // Check if black started first move
    let initialMoveText;
    let firstMove = moves.find((move) => !!move);
    if (firstMove?.movingPiece.isWhite === false) {
        const firstFENTurn = FENTurns.shift()[0];
        initialMoveText = `${moveCount++}... ${firstFENTurn} ${FENTurns.length > 0 ? `${moveCount++}. ` : ''}`;
    } else {
        initialMoveText = `${moveCount++}. `;
    }

    // Convert turns to move text and return
    return FENTurns.reduce(
        (movesText, turn, index) =>
            `${movesText}${turn.join(' ')} ${
                (turn.length === 2 && FENTurns.length - 1 !== index) || FENTurns.length - 1 !== index ? moveCount++ + '. ' : ''
            }`,
        initialMoveText,
    );
}

function generatePGNFromBoard(gameName, site, initialFENString, players, moves, gameState) {
    const whitePlayer = players.find((player) => player.isWhite);
    const blackPlayer = players.find((player) => !player.isWhite);
    const date = new Date();
    let result;
    switch (gameState) {
        case GameConstants.States.DRAW_CALLED:
        case GameConstants.States.DRAW_INSUFFICIENT_PIECES:
        case GameConstants.States.DRAW_STALEMATE:
            result = '1/2-1/2';
            break;
        case GameConstants.States.OBSERVING:
        case GameConstants.States.CHECKMATE:
        case GameConstants.States.RESIGNED:
            const whiteWon = moves.length % 2 === 1;
            result = whiteWon ? '1-0' : '0-1';
            break;
        case GameConstants.States.PLAYING:
        default:
            result = '*';
            break;
    }
    // Add tags
    const tags = [
        `[Event "${gameName}"]`,
        `[Site "${site ?? 'chess.goffincedric.be'}"]`,
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

function generateBoardFromPGN(pgnString) {
    // Set up regexes
    const commentRegex = /{[^}]+}/g;
    // Split text in lines
    const lines = pgnString
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');
    // Get lines containing tags
    const tagLines = lines.filter((line) => isValidPGNTag(line));
    // Get lines containing move text and remove comments
    const startMoveTextIndex = lines.indexOf(tagLines[tagLines.length - 1]) + 1;
    let moveText = lines.slice(startMoveTextIndex).join(' ');
    moveText = moveText.replaceAll(commentRegex, '');

    // Get info from tags
    let fen = FENConstants.DEFAULT_FEN_LAYOUT;
    let whiteName = 'Player 1';
    let blackName = 'Player 2';
    tagLines.forEach((line) => {
        const regexMatch = line.match(RegexConstants.PGN_TAG);
        switch (regexMatch.groups.name.toLowerCase()) {
            case 'fen':
                if (isValidFEN(regexMatch.groups.value)) {
                    fen = regexMatch.groups.value;
                }
                break;
            case 'white':
                whiteName = regexMatch.groups.value;
                break;
            case 'black':
                blackName = regexMatch.groups.value;
                break;
        }
    });

    // Generate board from FEN layout
    const whitePlayer = new Player(whiteName, true);
    const blackPlayer = new Player(blackName, false);
    const board = new Board(whitePlayer, blackPlayer, fen);

    function getMoveDataFromPGNRegexData(from, to, kingCastle, queenCastle, fenName) {
        // Get piece to move
        let placementToMoveTo;
        let pieceToMove;
        let foundMove;
        if (to) {
            let placementToMoveFrom;
            // Convert fen to placements
            placementToMoveTo = new Placement(+to[1], BoardUtils.rankCharToNumber(to[0]));
            if (from?.length > 0) {
                let file, rank;
                // Check if first character is a number
                if (!isNaN(+from[0])) {
                    // Set file to number
                    file = +from[0];
                } else {
                    // Set rank to character
                    rank = from[0];
                    // Check if second character is a number
                    if (!isNaN(+from[1])) {
                        // Set file to second character
                        file = +from[1];
                    }
                }
                placementToMoveFrom = new Placement(file, BoardUtils.rankCharToNumber(rank));
            }

            // Find move to get piece of
            foundMove = board.currentPlayerMoves.find(
                (move) =>
                    ((!fenName && move.movingPiece.TYPE === PieceTypes.PAWN) || // Filter for pawns if no fenName is supplied
                        (fenName && move.movingPiece.fenName.toUpperCase() === fenName.toUpperCase())) && // Filter for pieces with same fenName if present
                    move.file === placementToMoveTo.file && // Filter by file to move to
                    move.rank === placementToMoveTo.rank && // Filter by rank to move to
                    (!placementToMoveFrom || // Filter by placement to move from if present
                        move.movingPiece.file === placementToMoveFrom.file ||
                        move.movingPiece.rank === placementToMoveFrom.rank),
            );
        } else if (kingCastle) {
            // Find king side castling move
            foundMove = board.currentPlayerMoves.find(
                (move) => move.castlingMove && move.movingPiece.rank < move.castlingMove.movingPiece.rank,
            );
        } else if (queenCastle) {
            // Find queen side castling move
            foundMove = board.currentPlayerMoves.find(
                (move) => move.castlingMove && move.movingPiece.rank > move.castlingMove.movingPiece.rank,
            );
        }

        // Get piece to move from board
        placementToMoveTo = new Placement(foundMove.file, foundMove.rank);
        pieceToMove = board.getPieceByPlacement(foundMove.movingPiece.file, foundMove.movingPiece.rank);

        // Return piece to move and placement to move to
        return { piece: pieceToMove, placementToMoveTo };
    }

    // Generate turns from PGN move text
    const moveTextTurns = moveText.matchAll(RegexConstants.PGN_MOVETEXT);
    for (let result of moveTextTurns) {
        // Get each side's move from turn
        if (result?.groups && board.gameState === GameConstants.States.PLAYING) {
            // Execute white move
            if (result.groups.whiteMove) {
                const { piece: whitePiece, placementToMoveTo: placementToMoveWhiteTo } = getMoveDataFromPGNRegexData(
                    result.groups.whiteFrom,
                    result.groups.whiteTo,
                    result.groups.whiteKingCastle,
                    result.groups.whiteQueenCastle,
                    result.groups.whitePiece,
                );
                board.setMovingPiece(whitePiece);
                board.movePiece(placementToMoveWhiteTo);
            }

            // Execute black move
            if (result.groups.blackMove) {
                const { piece: blackPiece, placementToMoveTo: placementToMoveBlackTo } = getMoveDataFromPGNRegexData(
                    result.groups.blackFrom,
                    result.groups.blackTo,
                    result.groups.blackKingCastle,
                    result.groups.blackQueenCastle,
                    result.groups.blackPiece,
                );
                board.setMovingPiece(blackPiece);
                board.movePiece(placementToMoveBlackTo);
            }

            // Check for game state
            if (result.groups.gameResult === GameConstants.Results.DRAW) {
                board.gameState = GameConstants.States.DRAW_CALLED;
            }
        }
    }

    return board;
}

function isValidPGNTag(tag) {
    return RegexConstants.PGN_TAG.test(tag);
}

function generateFENForMove(move) {
    // Check if move is defined
    if (!move) return null;

    // Generate move notation
    let moveNotation;
    if (move.castlingMove) {
        if (move.castlingMove.movingPiece.rank < move.movingPiece.rank) {
            // Castling queen side
            moveNotation = FENConstants.QUEEN_SIDE_CASTLE_NOTATION;
        } else {
            // Castling queen side
            moveNotation = FENConstants.KING_SIDE_CASTLE_NOTATION;
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

    // Check if is checking or checkmating move
    if (move.isChecking) {
        moveNotation += '+';
    } else if (move.isCheckMating) {
        moveNotation += '#';
    }

    // Return move
    return moveNotation;
}

function generateFENForMoves(moves) {
    return moves.map((move) => generateFENForMove(move));
}

function generateFENFromBoard(pieces, isWhiteTurn, halfMoveCount, currentPlayerMoves, pastMoves) {
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

// Example: rnbqkbnr/pp2pppp/2p5/3pP3/8/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 5
function generateBoardFromFEN(fenString) {
    // Parse FEN string
    const regexMatch = RegexConstants.FEN_STRING.exec(fenString);
    if (!regexMatch?.groups) {
        throw Error('Invalid FEN string: ' + fenString);
    }
    const groups = regexMatch.groups;

    // Get current turn
    const isWhiteTurn = groups.sideToMove.toLowerCase() === 'w';
    // Get halfMoveCount
    const halfMoveCount = +groups?.halfMoveCount;
    // Get fullMoveCount
    const fullMoveCount = +groups?.fullMoveCount;

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

function isValidFEN(fenString) {
    return RegexConstants.FEN_STRING.test(fenString);
}

export const FENUtils = {
    generatePGNForMoves,
    generatePGNFromBoard,
    generateBoardFromPGN,
    generateFENForMove,
    generateFENForMoves,
    generateFENFromBoard,
    generateBoardFromFEN,
    isValidFEN,
};
