import { BoardUtils } from '../utils/boardUtils.js';
import { COLORS, FILES, SQUARE_SIZE } from '../constants/boardConstants.js';
import { AssetUtils } from '../utils/assetUtils.js';
import { Bishop, Knight, Queen, Rook } from '../models/pieces/index.js';
import { Position } from '../models/position.js';

// Initialize pawn promotion object
let pawnPromotion = {
    hasSetPiecePositions: false,
    whitePieces: {
        queen: new Queen(1, 1, true, false),
        bishop: new Bishop(1, 1, true, false),
        knight: new Knight(1, 1, true, false),
        rook: new Rook(1, 1, true, false),
    },
    blackPieces: {
        queen: new Queen(1, 1, false, false),
        bishop: new Bishop(1, 1, false, false),
        knight: new Knight(1, 1, false, false),
        rook: new Rook(1, 1, false, false),
    },
};

// Draw pieces on board
function drawPieces(p, pieces, movingPiece, isFlipped) {
    pieces.forEach((piece) => {
        if (piece !== movingPiece) {
            const placement = piece.getPlacement();
            const position = BoardUtils.placementToPosition(placement.file, placement.rank, isFlipped);
            drawPiece(p, piece, position);
        }
    });
    if (movingPiece) {
        const mousePosition = new Position(p.mouseX - SQUARE_SIZE / 2, p.mouseY - SQUARE_SIZE / 2);
        drawPiece(p, movingPiece, mousePosition);
    }
}

// Draw pawn promotion container
function drawPawnPromotion(p, pawnToPromote, isWhiteTurn, isFlipped) {
    // Get pieces to promote to
    let promotionPieces = Object.values(isWhiteTurn ? pawnPromotion.whitePieces : pawnPromotion.blackPieces);

    // Draw box
    const boxPosition = BoardUtils.placementToPosition(pawnToPromote.file, pawnToPromote.rank, isFlipped);
    const strokeWidth = 1;
    p.stroke(p.color(COLORS.DARKER));
    p.strokeWeight(strokeWidth);
    p.fill(COLORS.LIGHT);
    p.rect(boxPosition.x, boxPosition.y + strokeWidth / 2, SQUARE_SIZE, SQUARE_SIZE * 4 - strokeWidth);

    // Set piece positions if not done yet
    if (!pawnPromotion.hasSetPiecePositions) {
        // Set piece positions
        promotionPieces.forEach((piece, index) => {
            const file = pawnToPromote.file + (isFlipped ? index : -index);
            piece.setPlacement(file, pawnToPromote.rank);
        });
        pawnPromotion.hasSetPiecePositions = true;
    }

    // Get position from pieces and set image position
    let position;
    promotionPieces.forEach((piece) => {
        // Draw promotion pieces
        position = BoardUtils.placementToPosition(piece.file, piece.rank, isFlipped);
        drawPiece(p, piece, position);
        // Draw line below piece
        p.line(position.x, position.y, position.x + SQUARE_SIZE, position.y);
    });
}

function drawPiece(p, piece, position) {
    const asset = AssetUtils.getAsset(piece.getAssetUrl());
    p.image(asset, position.x, position.y, SQUARE_SIZE, SQUARE_SIZE);
}

export const PieceGraphics = {
    drawPieces,
    drawPawnPromotion,
    pawnPromotion,
};
