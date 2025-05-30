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
     * submissionsFilteredByTitle a list of submission infos filtered by title.
     * @type {SubmissionInfo[]}
     * @public
     */
    this.submissionsFilteredByTitle = [];

    /**
     * submissionsFilteredByUser a list of submission infos filtered by user.
     * @type {SubmissionInfo[]}
     * @public
     */
    this.submissionsFilteredByUser = [];
  }

  /**
   * A function for getting the total number of submissions filtered out.
   * @returns {number} The total number of submissions filtered by all categories.
   */
  getTotalSubmissionsFilteredOut() {
    return (
      this.submissionsFilteredBySource.length +
      this.submissionsFilteredByTitle.length +
      this.submissionsFilteredByUser.length
    );
  }
}

export default FilterResults;
