export class FenMove {
    /**
     * @type {string}
     */
    from;
    /**
     * @type {string}
     */
    to;

    /**
     * @param {string} from
     * @param {string} to
     */
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
}
