// ==UserScript==
// @name         HN Blacklist
// @author       booleandilemma
// @description  Hide Hacker News submissions from sources you don't want to see
// @homepageURL  https://greasyfork.org/en/scripts/427213-hn-blacklist
// @match        https://news.ycombinator.com/
// @match        https://news.ycombinator.com/news*
// @version      2.3.1
// @grant        none
// @license      GPL-3.0
// ==/UserScript==

"use strict";

/* ========================== Configuration Info Starts Here ========================== */

/*
 * Add sources you don't want to see here.
 *
 * Three types of sources can be filtered on:
 *
 * 1) "source:" will filter the submission by the domain it comes from.
 * 2) "title:" will filter the submission by the words contained in the title.
 * 3) "user:" will filter the submission by the user who submitted it.
 *
 * For example, "source:example.com" will filter all submissions coming from "example.com".
 */
const blacklist = new Set(
  [
  ],
);

/*
 * By default, HN Blacklist will display a summary
 * of what it did at the bottom of HN.
 * But if you're not interested in cluttering your screen,
 * the results can be hidden by changing
 * "displayResults" to false.
 */
const displayResults = true;

/*
 * If one or more tests fail, it's a good sign that the
 * rest of the script won't work as intended.
 * Therefore, we won't filter anything by default.
 * To try filtering anyway, change the variable
 * "filterEvenWithTestFailures" to true.
 */
const filterEvenWithTestFailures = false;

/* ========================== Configuration Info Ends Here ========================== */

const UserScriptName = "HN Blacklist";
const UserScriptVersion = "2.3.1";

/**
 * Logs an info message to the console.
 * @param {string} message - Specifies the message to log.
 */
function logInfo(message) {
  console.info(`${UserScriptName}: ${message}`);
}

/**
 * Logs a warning message to the console.
 * @param {string} message - Specifies the message to log.
 */
function logWarning(message) {
  console.warn(`${UserScriptName}: ${message}`);
}

/**
 * Logs an error message to the console.
 * @param {string} message - Specifies the message to log.
 */
function logError(message) {
  console.error(`${UserScriptName}: ${message}`);
}

/**
 * An entry for filtering submissions.
 */
class Entry {
  /**
   * Creates an entry.
   * @param {string} input - Something the user wants to filter by.
   * It can begin with "source:", "title:", or "user:".
   */
  constructor(input) {
    /**
     * isValid indicates whether or not the entry is valid.
     * @type {boolean}
     * @public
     */
    this.isValid = null;

    /**
     * prefix indicates the type of thing to filter by. It can be "source:", "title:", or "user:".
     * @type {string}
     * @public
     */
    this.prefix = null;

    /**
     * text indicates the value of the source, title, or user to filter by.
     * @type {string}
     * @public
     */
    this.text = null;

    this.#buildEntry(input);
  }

  /**
   * Determines if the input is valid.
   * @param {string} input - Something the user wants to filter by.
   * It can begin with "source:", "title:", or "user:".
   * @returns {boolean} A boole indicating whether or not the entry is valid.
   */
  #isValidInput(input) {
    if (input.startsWith("source:")
      || input.startsWith("title:")
      || input.startsWith("user:")) {
      return true;
    }

    return false;
  }

  #buildEntry(input) {
    this.isValid = this.#isValidInput(input);

    if (this.isValid) {
      const prefix = input.substring(0, input.indexOf(":"));
      const text = input.substring(input.indexOf(":") + 1);

      this.prefix = prefix;
      this.text = text;
    } else {
      this.prefix = null;
      this.text = input;
    }
  }
}

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
    return this.submissionsFilteredBySource
      + this.submissionsFilteredByTitle
      + this.submissionsFilteredByUser;
  }
}

/**
 * This defines an object for interacting with the HN page itself, at a low-level.
 */
class PageEngine {
  /**
   * Get the thing holding the list of submissions.
   */
  getSubmissionTable() {
    const submissions = this.getSubmissions();

    if (submissions == null || submissions.length === 0) {
      return null;
    }

    return submissions[0].parentElement;
  }

  /**
   * Get the list of submissions.
   */
  getSubmissions() {
    return document.querySelectorAll(".athing");
  }

  /**
   * Updates the specified submission to the specified rank.
   * @param {?object} submission - Specifies the HN submission.
   * @param {number} newRank - Specifies the new rank to set on the specified submission.
   */
  setRank(submission, newRank) {
    if (submission === null) {
      logWarning("submission is null");

      return;
    }

    let titleIndex = 0;

    for (let i = 0; i < submission.childNodes.length; i++) {
      const childNode = submission.childNodes[i];

      if (childNode.className === "title") {
        titleIndex++;
      }

      if (titleIndex === 1) {
        const rank = childNode.innerText;

        if (rank === null) {
          logWarning("rank is null");

          return;
        }

        childNode.innerText = `${newRank}.`;

        return;
      }
    }

    logWarning(`no rank found: ${JSON.stringify(submission)}`);
  }

  /**
   * Updates the ranks of all of the remaining submissions on the current HN page.
   * This function is intended to be called after the submissions have been filtered.
   * This is because once the submissions are filtered, there is a gap in the rankings.
   * For example, if the 3rd submission is removed, the remaining submissions will have
   * ranks of: 1, 2, 4, 5, etc.
   * This function will correct the remaining submissions to have ranks of: 1, 2, 3, 4, etc.
   * This is accomplished by passing in the top rank on the current HN page _before_
   * any filtering is done. For example, if the current HN page is the first one,
   * the top rank will be "1", and so numbering will start from 1. If the current page
   * is the second one, the top rank will be "31".
   * @param {number} topRank - Specifies the top rank to start numbering from.
   */
  reindexSubmissions(topRank) {
    const submissions = this.getSubmissions();

    for (let i = 0; i < submissions.length; i++) {
      this.setRank(submissions[i], topRank + i);
    }
  }

  /**
   * Scans the list of submissions on the current HN page
   * and returns the rank of the first submission in the list.
   * @returns {?number} The rank of the first HN submission.
   */
  getTopRank() {
    const submissions = this.getSubmissions();

    if (submissions == null) {
      logWarning("submissions are null");

      return null;
    }

    if (submissions.length === 0) {
      logWarning("submissions are empty");

      return null;
    }

    const topRank = this.getRank(submissions[0]);

    return topRank;
  }

  /**
   * Returns the source of the specified titleInfo.
   * @param {?object} titleInfo - An element containing the submission headline and source.
   */
  getSource(titleInfo) {
    if (titleInfo === null) {
      logWarning("titleInfo is null");

      return null;
    }

    const titleText = titleInfo.innerText;

    const lastParenIndex = titleText.lastIndexOf("(");

    if (lastParenIndex < 0) {
      return null;
    }

    const source = titleText.substring(lastParenIndex + 1, titleText.length - 1).trim();

    return source;
  }

  /**
   * Returns the titleText (i.e. headline) of the specified titleInfo.
   * @param {?object} titleInfo - An element containing the submission headline and source.
   */
  getTitleText(titleInfo) {
    if (titleInfo === null) {
      logWarning("titleInfo is null");

      return null;
    }

    const titleText = titleInfo.innerText;

    const lastParenIndex = titleText.lastIndexOf("(");

    if (lastParenIndex < 0) {
      return titleText;
    }

    return titleText.substring(0, lastParenIndex);
  }

  /**
   * @param {?object} submission - Specifies the HN submission.
   * @returns {?number} The "rank" of an HN submission.
   * The rank is defined as the number to the far left of the submission.
   */
  getRank(submission) {
    if (submission === null) {
      logWarning("submission is null");
      return null;
    }

    let titleIndex = 0;

    for (let i = 0; i < submission.childNodes.length; i++) {
      const childNode = submission.childNodes[i];

      if (childNode.className === "title") {
        titleIndex++;
      }

      if (titleIndex === 1) {
        const rank = childNode.innerText;

        if (rank === null) {
          logWarning("rank is null");

          return null;
        }

        return parseInt(rank.replace(".", "").trim(), 10);
      }
    }

    logWarning(`no rank found: ${JSON.stringify(submission)}`);

    return null;
  }

  /**
   * Returns the titleInfo of the specified submission.
   * This is an element containing the headline and the source
   * of the submission.
   * @param {?object} submission - Specifies the HN submission.
   */
  getTitleInfo(submission) {
    if (submission === null) {
      logWarning("submission is null");

      return null;
    }

    let titleIndex = 0;

    for (let i = 0; i < submission.childNodes.length; i++) {
      const childNode = submission.childNodes[i];

      if (childNode.className === "title") {
        titleIndex++;
      }

      if (titleIndex === 2) {
        return childNode;
      }
    }

    logWarning(`no titleInfo found: ${JSON.stringify(submission)}`);

    return null;
  }

  /**
   * Returns the submitter of the specified submission.
   * @param {?object} submission - Specifies the HN submission.
   * @returns {?string} the username of the submitter.
   */
  getSubmitter(submission) {
    if (submission === null) {
      logWarning("submission is null");

      return null;
    }

    const { nextSibling } = submission;
    if (nextSibling === null) {
      // TODO: this might be a bug
      const rank = this.getRank(submission);
      logWarning(`nextSibling is null. rank is: ${rank}`);

      return null;
    }

    const userLink = nextSibling.querySelector(".hnuser");

    if (userLink == null) {
      const rank = this.getRank(submission);
      logWarning(`userLink is null. rank is: ${rank}`);

      return null;
    }

    const hrefUser = userLink.getAttribute("href");

    if (hrefUser == null) {
      logWarning("hrefUser is null");

      return null;
    }

    return hrefUser.replace("user?id=", "");
  }

  /**
   * Returns an object representing the different parts of the specified submission.
   * These are: title, source, rank, and rowIndex.
   * @param {?object} submission - Specifies the HN submission.
   */
  getSubmissionInfo(submission) {
    if (submission === null) {
      return null;
    }

    const titleInfo = this.getTitleInfo(submission);

    const rank = this.getRank(submission);
    const submitter = this.getSubmitter(submission);
    const titleText = this.getTitleText(titleInfo);
    const source = this.getSource(titleInfo);
    const { rowIndex } = submission;

    return {
      title: titleText,
      source,
      submitter,
      rank,
      rowIndex,
    };
  }

  /**
   * Filters out (i.e. deletes) all submissions on the
   * current HN page with a domain source contained in the specified blacklist.
   * @param {Entry[]} blacklistEntries - A list containing entries to filter on.
   * @returns {number} A number indicating how many submissions were filtered out.
   */
  filterSubmissionsBySource(blacklistEntries) {
    const submissions = this.getSubmissions();

    const submissionTable = this.getSubmissionTable();

    let submissionsFiltered = 0;

    blacklistEntries.forEach((entry) => {
      if (entry.prefix !== "source") {
        return;
      }

      for (let i = 0; i < submissions.length; i++) {
        const submissionInfo = this.getSubmissionInfo(submissions[i]);

        if (submissionInfo.source != null && submissionInfo.source === entry.text.toLowerCase()) {
          logInfo(`Source blacklisted - removing ${JSON.stringify(submissionInfo)}`);

          // Delete the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the submission comments link
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the spacer row after the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          submissionsFiltered++;
        }
      }
    });

    return submissionsFiltered;
  }

  /**
   * Filters out (i.e. deletes) all submissions on the
   * current HN page with a title substring contained in the specified blacklist.
   * @param {Entry[]} blacklistEntries - A list containing entries to filter on.
   * @returns {number} A number indicating how many submissions were filtered out.
   */
  filterSubmissionsByTitle(blacklistEntries) {
    const submissions = this.getSubmissions();

    const submissionTable = this.getSubmissionTable();

    let submissionsFiltered = 0;

    blacklistEntries.forEach((entry) => {
      if (entry.prefix !== "title") {
        return;
      }

      for (let j = 0; j < submissions.length; j++) {
        const submissionInfo = this.getSubmissionInfo(submissions[j]);

        if (submissionInfo.title.toLowerCase().includes(entry.text.toLowerCase())) {
          logInfo(`Title keyword blacklisted - removing ${JSON.stringify(submissionInfo)}`);

          // Delete the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the submission comments link
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the spacer row after the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          submissionsFiltered++;
        }
      }
    });

    return submissionsFiltered;
  }

  /**
   * Filters out (i.e. deletes) all submissions on the
   * current HN page submitted by the specified user.
   * @param {Entry[]} blacklistEntries - A list containing entries to filter on.
   * @returns {number} A number indicating how many submissions were filtered out.
   */
  filterSubmissionsByUser(blacklistEntries) {
    const submissions = this.getSubmissions();

    const submissionTable = this.getSubmissionTable();

    let submissionsFiltered = 0;

    blacklistEntries.forEach((entry) => {
      if (entry.prefix !== "user") {
        return;
      }

      for (let j = 0; j < submissions.length; j++) {
        const submissionInfo = this.getSubmissionInfo(submissions[j]);

        if (submissionInfo.submitter != null
          && submissionInfo.submitter.toLowerCase() === entry.text.toLowerCase()) {
          logInfo(`User blacklisted - removing ${JSON.stringify(submissionInfo)}`);

          // Delete the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the submission comments link
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the spacer row after the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          submissionsFiltered++;
        }
      }
    });

    return submissionsFiltered;
  }

  displayResults(resultsRow) {
    const mainTable = document.getElementById("hnmain");

    /*
     * HN adds an extra child to the mainTable,
     * so we have to do this to get the tbody.
     * I'm not sure why HN does this.
     * This assumes the tbody will be the last child.
     */
    const childCount = mainTable.childNodes.length;
    const tbody = mainTable.childNodes[childCount - 1];

    tbody.appendChild(resultsRow);
  }
}

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
  constructor(pageEngine, blacklistInput) {
    this.pageEngine = pageEngine;
    this.blacklistEntries = this.buildEntries(blacklistInput);
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
        logError(`"${entry.text}" is an invalid entry and will be skipped. `
          + `Entries must begin with "source:", "title:", or "user:".`);
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

    const submissionsFilteredBySource = this.pageEngine.filterSubmissionsBySource(validEntries);
    const submissionsFilteredByTitle = this.pageEngine.filterSubmissionsByTitle(validEntries);
    const submissionsFilteredByUser = this.pageEngine.filterSubmissionsByUser(validEntries);

    const filterResults = new FilterResults();
    filterResults.submissionsFilteredBySource = submissionsFilteredBySource;
    filterResults.submissionsFilteredByTitle = submissionsFilteredByTitle;
    filterResults.submissionsFilteredByUser = submissionsFilteredByUser;

    if (filterResults.getTotalSubmissionsFilteredOut() > 0) {
      logInfo("Reindexing submissions");

      this.pageEngine.reindexSubmissions(topRank);
    } else {
      logInfo("Nothing filtered");
    }

    return filterResults;
  }

  /**
   * Displays results to the user.
   * @param {number} timeTaken - The time the script took to execute.
   * @param {FilterResults} filterResults - High-level results of what was done.
   * @param {TestResults} testResults - A summary of test results.
   */
  displayResults(timeTaken, filterResults, testResults) {
    const hnblacklistTable = document.getElementById("hnblacklist");

    if (hnblacklistTable != null) {
      hnblacklistTable.remove();
    }

    const statsRow = document.createElement("tr");

    let entryValidityMessage;

    if (this.blacklistEntries.length > 0) {
      const invalidEntriesExist = this.blacklistEntries.some((e) => !e.isValid);

      const errorMessage = "One or more of your entries is invalid. Check the log for details";
      entryValidityMessage = invalidEntriesExist ? errorMessage : "All entries valid";
    } else {
      entryValidityMessage = "No entries supplied";
    }

    let filteredMessage;

    if (testResults.failCount > 0) {
      if (!testResults.filterEvenWithTestFailures) {
        filteredMessage = "One or more tests failed - did not try to filter";
      } else {
        filteredMessage = `${filterResults.submissionsFilteredBySource} by source, 
        ${filterResults.submissionsFilteredByTitle} by title, 
        ${filterResults.submissionsFilteredByUser} by user`;
      }
    } else {
      filteredMessage = `${filterResults.submissionsFilteredBySource} by source, 
      ${filterResults.submissionsFilteredByTitle} by title, 
      ${filterResults.submissionsFilteredByUser} by user`;
    }

    let testResultsMessage = `${testResults.testCount - testResults.failCount}/${testResults.testCount} Passed.`;

    if (testResults.failCount > 0) {
      testResultsMessage += " Check the log for details.";
    }

    const stats = `
  <td>
    <table id="hnblacklist">
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
            <p>Filtered: ${filteredMessage}.
            </p>
          </td>
        </tr>
        <tr>
          <td>Entry Validity: ${entryValidityMessage}.</td>
        </tr>
        <tr>
          <td>Test Results: ${testResultsMessage}</td>
        </tr>
        <tr>
          <td>Execution Time: ${timeTaken} ms</td>
        </tr>
      </tbody>
      </table>
    </td>`;

    statsRow.innerHTML = stats;

    this.pageEngine.displayResults(statsRow);
  }
}

class TestResults {
  constructor() {
    this.filterEvenWithTestFailures = null;
    this.failCount = null;
    this.testCount = null;
    this.resultsSummary = null;
  }
}

class Tester {
  constructor() {
    this.results = [];
    this.failCount = 0;
    this.testCount = 0;
  }

  runTests(testClass) {
    const tests = this.#getTests(Object.getPrototypeOf(testClass));

    for (let i = 0; i < tests.length; i++) {
      this.#runTest(testClass, tests[i]);
    }

    const testResults = new TestResults();
    testResults.failCount = this.failCount;
    testResults.testCount = this.testCount;
    testResults.summary = this.#getSummary();

    return testResults;
  }

  #getTests(testClass) {
    return Object.getOwnPropertyNames(testClass).filter((p) => p.startsWith("test_"));
  }

  #runTest(testClass, testToRun) {
    this.testCount++;

    try {
      testClass[testToRun](this);
    } catch (error) {
      const result = {
        name: testToRun,
        status: error.status ?? "failed",
        message: error.message,
        stackTrace: error.stack,
      };

      if (result.status === "failed") {
        this.failCount++;
      }

      this.results.push(result);

      return result;
    }

    const result = {
      name: testToRun,
      status: "passed",
    };

    this.results.push(result);

    return result;
  }

  failWith(result) {
    result.status = "failed";

    throw result;
  }

  #getSummary() {
    let summary;

    if (this.failCount === 0) {
      summary = `Tests Results ${this.testCount}/${this.testCount} Passed`;
    } else {
      summary = `Tests Results ${this.testCount - this.failCount}/${this.testCount} Passed ${JSON.stringify(this.results, null, 2)}`;
    }

    return summary;
  }
}

/**
 * This class contains several tests for testing the correctness of the PageEngine.
 * As the PageEngine is the closest code in this userscript to HN,
 * it's most susceptible to breaking if the HN developers change something.
 * Therefore, it's good to have tests for all of its functionality.
 */
class PageEngineTester {
  constructor(pageEngine) {
    this.pageEngine = pageEngine;
  }

  test_getSubmissionTable_ableToGetSubmissionTable(tester) {
    // Arrange
    // Act
    let table;

    try {
      table = this.pageEngine.getSubmissionTable();
    } catch {
      // Empty
    }

    // Assert
    if (table == null) {
      tester.failWith({
        message: "Unable to obtain submission table",
      });
    }
  }

  test_getSubmissions_numberOfSubmissionsIsCorrect(tester) {
    // Arrange
    const expectedLength = 30;

    // Act
    const { submissions, result } = this.getSubmissionsWithResult();

    // Assert
    if (submissions == null) {
      tester.failWith(result);
    }

    if (submissions.length !== expectedLength) {
      tester.failWith({
        message: `Submissions length is wrong. expected ${expectedLength}, got ${submissions.length}`,
      });
    }
  }

  test_getRank_ableToGetRank(tester) {
    // Arrange
    const { submissions, result } = this.getSubmissionsWithResult();

    if (submissions == null) {
      tester.failWith(result);
    }

    // Arbitrarily testing the 5th submission.
    if (submissions.length < 5) {
      tester.failWith({
        message: "Submissions length less than 5, can't get a rank",
      });
    }

    // Act
    let firstRankOnPage = null;

    try {
      firstRankOnPage = this.pageEngine.getRank(submissions[0]);
    } catch {
      // Empty
    }

    // Assert
    if (firstRankOnPage == null) {
      tester.failWith({
        message: "First submission rank is null",
      });
    }

    let fifthRank = null;

    try {
      fifthRank = this.pageEngine.getRank(submissions[4]);
    } catch {
      // Empty
    }

    if (fifthRank == null) {
      tester.failWith({
        message: "Fifth submission rank is null",
      });
    }

    /*
     * We offset the rank like this so that this test will work
     * on any submissions page.
     */
    if (fifthRank !== (firstRankOnPage + 4)) {
      tester.failWith({
        message: "Unable to obtain submission rank",
      });
    }
  }

  test_getTopRank_ableToGetTopRank(tester) {
    // Arrange
    // Act
    let topRank = null;

    try {
      topRank = this.pageEngine.getTopRank();
    } catch {
      // Empty
    }

    // Assert
    if (topRank == null) {
      tester.failWith({
        message: "Unable to get top rank",
      });
    }
  }

  test_getSubmitter_ableToGetSubmitter(tester) {
    // Arrange
    const { submissions, result } = this.getSubmissionsWithResult();

    if (submissions == null) {
      tester.failWith(result);
    }

    // Arbitrarily testing the 5th submission.
    if (submissions.length < 5) {
      tester.failWith({
        message: "Submissions length less than 5, can't get a rank",
      });
    }

    // Act
    let submitter = null;

    try {
      submitter = this.pageEngine.getSubmitter(submissions[4]);
    } catch {
      // Empty
    }

    // Assert
    if (submitter == null || submitter.trim() === "") {
      tester.failWith({
        message: "Couldn't get submitter",
      });
    }
  }

  test_getTitleInfo_ableToGetTitleInfo(tester) {
    // Arrange
    const submissionsAndResult = this.getSubmissionsWithResult();
    const submissions = submissionsAndResult.submissions;

    if (submissions == null) {
      tester.failWith(submissionsAndResult.result);
    }

    // Arbitrarily testing the 5th submission.
    if (submissions.length < 5) {
      tester.failWith({
        message: "Submissions length less than 5, can't get a rank",
      });
    }

    // Act
    const { titleInfo, result } = this.getTitleInfoWithResult(submissions[4]);

    // Assert
    if (titleInfo == null) {
      tester.failWith(result);
    }
  }

  test_getTitleText_ableToGetTitleText(tester) {
    // Arrange
    const submissionsAndResult = this.getSubmissionsWithResult();
    const submissions = submissionsAndResult.submissions;

    if (submissions == null) {
      tester.failWith(submissionsAndResult.result);
    }

    // Arbitrarily testing the 5th submission.
    if (submissions.length < 5) {
      tester.failWith({
        message: "Submissions length less than 5, can't get a rank",
      });
    }

    const { titleInfo, result } = this.getTitleInfoWithResult(submissions[4]);

    if (titleInfo == null) {
      tester.failWith(result);
    }

    // Act
    const titleText = this.pageEngine.getTitleText(titleInfo);

    // Assert
    if (titleText == null || titleText.trim() === "") {
      tester.failWith({
        message: "Unable to get title text on title info",
      });
    }
  }

  test_getSource_ableToGetSource(tester) {
    // Arrange
    const submissionsAndResult = this.getSubmissionsWithResult();
    const submissions = submissionsAndResult.submissions;

    if (submissions == null) {
      tester.failWith(submissionsAndResult.result);
    }

    // Arbitrarily testing the 5th submission.
    if (submissions.length < 5) {
      tester.failWith({
        message: "Submissions length less than 5, can't get a rank",
      });
    }

    const { titleInfo, result } = this.getTitleInfoWithResult(submissions[4]);

    if (titleInfo == null) {
      tester.failWith(result);
    }

    // Act
    const source = this.pageEngine.getSource(titleInfo);

    // Assert
    if (source == null || source.trim() === "") {
      tester.failWith({
        message: "Unable to get source on title info",
      });
    }
  }

  getSubmissionsWithResult() {
    let submissions = null;

    try {
      submissions = this.pageEngine.getSubmissions();
    } catch {
      // Empty
    }

    if (submissions == null) {
      return {
        submissions: null,
        result: {
          message: "Unable to obtain submission",
        },
      };
    }

    return {
      submissions,
      result: null,
    };
  }

  getTitleInfoWithResult(submission) {
    let titleInfo = null;

    try {
      titleInfo = this.pageEngine.getTitleInfo(submission);
    } catch {
      // Empty
    }

    if (titleInfo == null) {
      return {
        titleInfo: null,
        result: {
          message: "Couldn't get title info",
        },
      };
    }

    return {
      titleInfo,
      result: null,
    };
  }
}

function main() {
  const startTime = performance.now();

  const pageEngine = new PageEngine();

  const tester = new Tester();
  const pageEngineTester = new PageEngineTester(pageEngine);
  const testResults = tester.runTests(pageEngineTester);

  logInfo(testResults.summary);

  testResults.filterEvenWithTestFailures = filterEvenWithTestFailures;

  const blacklister = new Blacklister(pageEngine, blacklist);

  blacklister.warnAboutInvalidBlacklistEntries();

  let filterResults = null;

  if (filterEvenWithTestFailures || testResults.failCount === 0) {
    filterResults = blacklister.filterSubmissions();
  } else {
    filterResults = new FilterResults();
  }

  if (displayResults) {
    const timeTaken = performance.now() - startTime;

    blacklister.displayResults(timeTaken, filterResults, testResults);
  }
}

main();
