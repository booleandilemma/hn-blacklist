/**
 * An entry for filtering submissions.
 */
class SubmissionInfo {
    // TODO: update all these docus

    /**
     * Creates a submissionInfo.
     */
    constructor() {
        /**
         * prefix indicates the type of thing to filter by. It can be "source:", "title:", or "user:".
         * @type {string}
         * @public
         */
        this.title = null;

        /**
         * prefix indicates the type of thing to filter by. It can be "source:", "title:", or "user:".
         * @type {string}
         * @public
         */
        this.source = null;

        /**
         * prefix indicates the type of thing to filter by. It can be "source:", "title:", or "user:".
         * @type {string}
         * @public
         */
        this.submitter = null;

        /**
         * prefix indicates the type of thing to filter by. It can be "source:", "title:", or "user:".
         * @type {number}
         * @public
         */
        this.rank = null;

        /**
         * prefix indicates the type of thing to filter by. It can be "source:", "title:", or "user:".
         * @type {number}
         * @public
         */
        this.rowIndex = null;

    }
}

export default SubmissionInfo;
