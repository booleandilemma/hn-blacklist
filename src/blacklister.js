/**
 * This defines an object for orchestrating the high-level filtering logic.
 * It also handles user input and displaying results.
 */
class Blacklister {
  /**
   * Builds a list of entries from user input.
   * @param {PageEngine} pageEngine -
   * The page engine is responsible for low-level interaction with HN.
   * @param {set} blacklistInput - A set containing the things to filter on.
   */
  constructor(pageEngine, blacklistInput, logger) {
    this.pageEngine = pageEngine;
    this.blacklistEntries = this.buildEntries(blacklistInput);
    this.logger = logger;
  }

  /**
   * Builds a list of entries from user input.
   * @param {set} blacklistInput - A set containing the things to filter on.
   * @returns {Entry[]} An array of entries.
   */
  buildEntries(blacklistInput) {
    const entries = [];

    blacklistInput.forEach((input) => {
      if (input != null) {
        entries.push(new Entry(input));
      }
    });

    return entries;
  }

  /**
   * Warns the user about invalid entries.
   * @param {Entry[]} blacklistEntries - A list of entries containing the submissions to filter out.
   */
  warnAboutInvalidBlacklistEntries() {
    this.blacklistEntries.forEach((entry) => {
      if (!entry.isValid) {
        this.logger.logError(
          `"${entry.text}" is an invalid entry and will be skipped. ` +
            `Entries must begin with "source:", "title:", or "user:".`,
        );
      }
    });
  }

  /**
   * Filters out (i.e. deletes) all submissions on the
   * current HN page matching one or more provided entries.
   * After filtering is performed, the page is reindexed.
   * See the reindexSubmissions function of PageEngine for details.
   * @returns {FilterResults} An object containing how many submissions were filtered out.
   */
  filterSubmissions() {
    const topRank = this.pageEngine.getTopRank();

    const validEntries = this.blacklistEntries.filter((e) => e.isValid);

    const submissionsFilteredBySource =
      this.pageEngine.filterSubmissionsBySource(validEntries);
    const submissionsFilteredByTitle =
      this.pageEngine.filterSubmissionsByTitle(validEntries);
    const submissionsFilteredByUser =
      this.pageEngine.filterSubmissionsByUser(validEntries);

    const filterResults = new FilterResults();
    filterResults.submissionsFilteredBySource = submissionsFilteredBySource;
    filterResults.submissionsFilteredByTitle = submissionsFilteredByTitle;
    filterResults.submissionsFilteredByUser = submissionsFilteredByUser;

    if (filterResults.getTotalSubmissionsFilteredOut() > 0) {
      this.logger.logInfo("Reindexing submissions");

      this.pageEngine.reindexSubmissions(topRank);
    } else {
      this.logger.logInfo("Nothing filtered");
    }

    return filterResults;
  }

  displayUI(testResults, filterText, filterEvenWithTestFailures) {
    const hnBlacklistTable = document.getElementById("hnBlacklist");

    if (hnBlacklistTable != null) {
      hnBlacklistTable.remove();
    }

    const statsRow = document.createElement("tr");

    let testResultsMessage = `Test Results: ${testResults.testCount - testResults.failCount}/${testResults.testCount} Passed in ${testResults.timeTaken} ms.`;

    if (testResults.failCount > 0) {
      testResultsMessage += " Check the log for details.";
    }

    const stats = `
      <td>
        <table id="hnBlacklist">
          <tbody>
            <tr>
              <td>
                <p style="text-decoration:underline;">
                  <a href="https://greasyfork.org/en/scripts/427213-hn-blacklist">${UserScriptName} ${UserScriptVersion}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td>
                <textarea id="filters" style="width:300px;height:150px">${filterText}</textarea>
              </td>
            </tr>
            <tr>
              <td>
                <input id="chkfilterEvenWithTestFailures" type="checkbox">Filter even with test failures</input>
              </td>
            </tr>
            <tr>
              <td>
                <button id="btnSaveFilters">Save</button>
              </td>
            </tr>
            <tr>
              <td>
                <p id="filteredResults"></p>
              </td>
            </tr>
            <tr>
              <td id="validityResults"></td>
            </tr>
            <tr>
              <td id="testResults">${testResultsMessage}</td>
            </tr>
            <tr>
              <td id="executionTimeResults"></td>
            </tr>
          </tbody>
          </table>
        </td>`;

    statsRow.innerHTML = stats;

    this.pageEngine.displayResults(statsRow);

    document.getElementById("chkfilterEvenWithTestFailures").checked =
      filterEvenWithTestFailures;
    document.getElementById("btnSaveFilters").onclick = saveInputsAsync;
  }

  /**
   * Displays results to the user.
   * @param {number} timeTaken - The time the script took to execute.
   * @param {FilterResults} filterResults - High-level results of what was done.
   * @param {TestResults} testResults - A summary of test results.
   */
  displayResults(timeTaken, filterResults, testResults) {
    let entryValidityMessage = "Entry Validity: ";

    if (this.blacklistEntries.length > 0) {
      const invalidEntriesExist = this.blacklistEntries.some((e) => !e.isValid);

      const errorMessage =
        "One or more of your entries is invalid. Check the log for details";
      entryValidityMessage += invalidEntriesExist
        ? errorMessage
        : "All entries valid";
    } else {
      entryValidityMessage += "No entries supplied";
    }

    let filteredMessage = "Filtered: ";

    if (testResults.failCount > 0) {
      if (!testResults.filterEvenWithTestFailures) {
        filteredMessage += "One or more tests failed - did not try to filter";
      } else {
        filteredMessage += `${filterResults.submissionsFilteredBySource} by source, ${filterResults.submissionsFilteredByTitle} by title, ${filterResults.submissionsFilteredByUser} by user`;
      }
    } else {
      filteredMessage += `${filterResults.submissionsFilteredBySource} by source, ${filterResults.submissionsFilteredByTitle} by title, ${filterResults.submissionsFilteredByUser} by user`;
    }

    document.getElementById("filteredResults").innerText = filteredMessage;
    document.getElementById("validityResults").innerText = entryValidityMessage;
    document.getElementById("executionTimeResults").innerText =
      `Execution Time: ${timeTaken} ms`;
  }
}

export default Blacklister;
