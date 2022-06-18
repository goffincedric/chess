import { BoardUtils } from '../utils/boardUtils.js';

export class Placement {
    file;
    rank;

    constructor(file, rank) {
        this.file = file;
        this.rank = rank;
    }

    toFEN() {
        return BoardUtils.fileNumberToChar(this.rank) + this.file;
    }
}
