function getPiecesFromTeam(pieces, pieceType, isWhite) {
    return pieces.filter((piece) => piece.TYPE === pieceType && piece.isWhite === isWhite);
}

function getPieceByPlacement(pieces, file, rank) {
    return pieces.find((piece) => piece.file === file && piece.rank === rank);
}

export const PieceUtils = {
    getPiecesFromTeam,
    getPieceByPlacement,
};
