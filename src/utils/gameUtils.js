import { GameConstants } from '../constants/gameConstants.js';

/**
 * @param {typeof GameConstants.States} gameState
 */
function isConclusiveGameState(gameState) {
    return [
        GameConstants.States.DRAW_INSUFFICIENT_PIECES,
        GameConstants.States.DRAW_STALEMATE,
        GameConstants.States.CHECKMATE,
        GameConstants.States.RESIGNED,
    ].includes(gameState);
}

export const GameUtils = {
    isConclusiveGameState,
};
