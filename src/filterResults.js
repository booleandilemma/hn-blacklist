/**
 * A high-level summary of the results of what was done.
 */
class FilterResults {
  constructor() {
    /**
     * submissionsFilteredBySource indicates the number of submissions filtered by source.
     * @type {number}
     * @public
     */
    this.submissionsFilteredBySource = 0;

    /**
     * submissionsFilteredByTitle indicates the number of submissions filtered by title.
     * @type {number}
     * @public
     */
    this.submissionsFilteredByTitle = 0;

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
      this.submissionsFilteredBySource +
      this.submissionsFilteredByTitle +
      this.submissionsFilteredByUser
    );
  }
}

export default FilterResults;
