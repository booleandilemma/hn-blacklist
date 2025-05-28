import SubmissionInfo from "./submissionInfo";

/**
 * A high-level summary of the results of what was done.
 */
class FilterResults {
  constructor() {
    /**
     * submissionsFilteredBySource a list of submission infos filtered by source.
     * @type {SubmissionInfo[]}
     * @public
     */
    this.submissionsFilteredBySource = [];

    /**
     * submissionsFilteredByTitle indicates the number of submissions filtered by title.
     * @type {SubmissionInfo[]}
     * @public
     */
    this.submissionsFilteredByTitle = [];

    /**
     * submissionsFilteredByUser indicates the number of submissions filtered by user.
     * @type {number}
     * @public
     */
    this.submissionsFilteredByUser = 0;
  }

  /**
   * A function for getting the total number of submissions filtered out.
   * @returns {number} The total number of submissions filtered by all categories.
   */
  getTotalSubmissionsFilteredOut() {
    return (
      this.submissionsFilteredBySource.length +
      this.submissionsFilteredByTitle.length +
      this.submissionsFilteredByUser
    );
  }
}

export default FilterResults;
