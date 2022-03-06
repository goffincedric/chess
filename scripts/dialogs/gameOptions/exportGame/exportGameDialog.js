import { DialogButton } from '../../../models/dialog/dialogButton.js';
import { Dialog } from '../../../models/dialog/dialog.js';
import { DialogConstants } from '../../../constants/dialogConstants.js';
import { FENUtils } from '../../../utils/fenUtils.js';
import { GameExportedDialog } from './gameExportedDialog.js';
import { DialogLabel } from '../../../models/dialog/dialogLabel.js';

// Create export to FEN button
const exportFENAction = async () => {
    const fenString = FENUtils.generateFENFromBoard(
        chessBoard.pieces,
        chessBoard.isWhiteTurn,
        chessBoard.halfMovesCount,
        chessBoard.currentPlayerMoves,
        chessBoard.pastMoves,
    );
    await navigator.clipboard.writeText(fenString);
    exportGameDialog.hide();
    GameExportedDialog.dialog.show();
};
const exportFENButton = new DialogButton('Export to FEN', DialogConstants.DEFAULT_DIALOG.BUTTONS_2.BUTTON_1.BOUNDING_BOX, DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE, exportFENAction);

// Create export to PGN button
const exportPGNAction = async () => {
    const pgnString = chessBoard.getPGN(null);
    await navigator.clipboard.writeText(pgnString);
    exportGameDialog.hide();
    GameExportedDialog.dialog.show();
};
const exportPGNButton = new DialogButton('Export to PGN', DialogConstants.DEFAULT_DIALOG.BUTTONS_2.BUTTON_2.BOUNDING_BOX, DialogConstants.DEFAULT_DIALOG.BUTTON_TEXT_SIZE, exportPGNAction);

// Create export game dialog
const exportGameDialog = new Dialog(
    new DialogLabel('Export game for analysis', 28),
    new DialogLabel(
        'This game can be exported to 2 formats: FEN and PGN. Exporting to FEN only exports the current board layout. ' +
            'Exporting to PGN will export the board layout, along with the played moves. The latter is recommended for thorough analysis.',
        17,
    ),
    DialogConstants.DEFAULT_DIALOG.BOUNDING_BOX,
    [exportFENButton, exportPGNButton],
);

// Export buttons and dialog
export const ExportGameDialog = {
    buttons: {
        exportFENButton,
        exportPGNButton,
    },
    dialog: exportGameDialog,
};
