import { BoardUtils } from '../utils/boardUtils.js';
import { COLORS, FILES, SQUARE_SIZE } from '../constants/boardConstants.js';
import { AssetUtils } from '../utils/assetUtils.js';
import { Bishop, Knight, Queen, Rook } from '../models/pieces/index.js';

// Initialize pawn promotion object
let pawnPromotion = {
    hasSetPiecePositions: false,
    white: {
        rook: new Rook(1, 1, true, false),
        knight: new Knight(1, 1, true, false),
        bishop: new Bishop(1, 1, true, false),
        queen: new Queen(1, 1, true, false),
    },
    dark: {
        rook: new Rook(1, 1, false, false),
        knight: new Knight(1, 1, false, false),
        bishop: new Bishop(1, 1, false, false),
        queen: new Queen(1, 1, false, false),
    },
};

// Draw pieces on board
function drawPieces(p, pieces, movingPiece) {
    pieces.forEach((piece) => {
        if (piece !== movingPiece) {
            let position = piece.getPosition();
            const asset = AssetUtils.getAsset(piece.getAssetUrl());
            p.image(asset, position.x, position.y, SQUARE_SIZE, SQUARE_SIZE);
        }
    });
    if (movingPiece) {
        const asset = AssetUtils.getAsset(movingPiece.getAssetUrl());
        p.image(asset, mouseX - SQUARE_SIZE / 2, mouseY - SQUARE_SIZE / 2, SQUARE_SIZE, SQUARE_SIZE);
    }
}

// Draw pawn promotion container
function drawPawnPromotion(p, pawnToPromote, isWhiteTurn) {
    // Get pieces to promote to
    let promotionPieces = Object.values(isWhiteTurn ? pawnPromotion.white : pawnPromotion.dark);
    // Calculate file for box and pieces
    let file = isWhiteTurn ? pawnToPromote.file : promotionPieces.length;

    // Draw box
    const boxPosition = BoardUtils.placementToPosition(file, pawnToPromote.rank);
    const strokeWidth = 1;
    p.stroke(p.color(COLORS.DARKER));
    p.strokeWeight(strokeWidth);
    p.fill(COLORS.LIGHT);
    p.rect(boxPosition.x, boxPosition.y + strokeWidth / 2, SQUARE_SIZE, SQUARE_SIZE * 4 - strokeWidth);

    // Set piece positions if not done yet
    if (!pawnPromotion.hasSetPiecePositions) {
        // Set piece positions
        promotionPieces.forEach((piece, index) => piece.setPlacement(Math.min(file, FILES) - index, pawnToPromote.rank));
        pawnPromotion.hasSetPiecePositions = true;
    }

    // Get position from pieces and set image position
    let position;
    promotionPieces.forEach((piece) => {
        position = BoardUtils.placementToPosition(piece.file, piece.rank);
        // Draw promotion pieces
        const asset = AssetUtils.getAsset(piece.getAssetUrl());
        p.image(asset, position.x, position.y, SQUARE_SIZE, SQUARE_SIZE);
        p.line(position.x, position.y, position.x + SQUARE_SIZE, position.y);
    });
}

export const PieceGraphics = {
    drawPieces,
    drawPawnPromotion,
    pawnPromotion,
};
