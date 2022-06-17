import { FENConstants } from './fenConstants.js';

const getMoveTextForSide = (side) =>
    `((?<${side.toLowerCase()}Piece>[RNBQK])?(?<${side.toLowerCase()}From>[a-h]?[1-8]?)?x?(?<${side.toLowerCase()}To>[a-h][1-8])(?:=(?<${side.toLowerCase()}Promotion>[RBNQ]))?(?<${side.toLowerCase()}Modifier>[+#])?)|(?<${side.toLowerCase()}QueenCastle>${
        FENConstants.QUEEN_SIDE_CASTLE_NOTATION
    })|(?<${side.toLowerCase()}KingCastle>${FENConstants.KING_SIDE_CASTLE_NOTATION})`;
export const RegexConstants = {
    FEN_MOVE: /^[A-H][1-8]$/i,
    FEN_STRING:
        /^(?<piecePlacement>([pnbrqkPNBRQK1-8]{1,8}\/?){8})\s+(?<sideToMove>[bw])\s?(?<castling>-|K?Q?k?q?)\s+(?<enPassant>-|[a-h][3-6])\s+(?<halfMoveCount>\d+)\s+(?<fullMoveCount>\d+)\s*$/,
    PGN_MOVETEXT_MOVE: (side) => new RegExp(getMoveTextForSide(side)),
    PGN_MOVETEXT: new RegExp(
        '(?<moveCount>[\\d]+)\\.(?<whiteMove>\\s+(' +
            getMoveTextForSide('white') +
            ')?\\s*)?(?<blackMove>(\\.{2}\\s+)?' +
            getMoveTextForSide('black') +
            ')?\\s*(?<gameResult>0-1|1-0|\\*|1\\/2-1\\/2)?',
        'g',
    ),
    PGN_TAG: /^\["?(?<name>[^\s]+)"?\s"?(?<value>[^\]"]+)"?]+$/i,
};
