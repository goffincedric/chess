const BOARD_SIZE = 800;
const RANKS = 8;
const FILES = 8;
const FILE_SIZE = BOARD_SIZE / FILES;
const RANK_SIZE = BOARD_SIZE / RANKS;
const COLORS = {
    LIGHT: '#D9D9D9',
    DARK: '#343441',
    MOVES: {
        CURRENT: '#F9F277B8',
        EMPTY: '#6D7ED0B8',
        TAKE_PIECE: '#5A9367B8',
        ENEMY: 'rgba(203,43,43,0.72)',
    },
};

export { BOARD_SIZE, RANKS, FILES, RANK_SIZE, FILE_SIZE, COLORS };
