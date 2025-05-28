import SubmissionInfo from "./submissionInfo.js";

/**
 * This defines an object for interacting with the HN page itself, at a low-level.
 */
class PageEngine {
  constructor(logger) {
    this.logger = logger;
  }

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
   * @param {?object} submission Specifies the HN submission.
   * @param {number} newRank Specifies the new rank to set on the specified submission.
   */
  setRank(submission, newRank) {
    if (submission === null) {
      this.logger.logWarning("submission is null");

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
          this.logger.logWarning("rank is null");

          return;
        }

        childNode.innerText = `${newRank}.`;

        return;
      }
    }

    this.logger.logWarning(`no rank found: ${JSON.stringify(submission)}`);
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
   * @param {number} topRank Specifies the top rank to start numbering from.
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
      this.logger.logWarning("submissions are null");

      return null;
    }

    if (submissions.length === 0) {
      this.logger.logWarning("submissions are empty");

      return null;
    }

    const topRank = this.getRank(submissions[0]);

    return topRank;
  }

  /**
   * Returns the source of the specified titleInfo.
   * @param {?object} titleInfo An element containing the submission headline and source.
   */
  getSource(titleInfo) {
    if (titleInfo === null) {
      this.logger.logWarning("titleInfo is null");

      return null;
    }

    const titleText = titleInfo.innerText;

    const lastParenIndex = titleText.lastIndexOf("(");

    if (lastParenIndex < 0) {
      return null;
    }

    const source = titleText
      .substring(lastParenIndex + 1, titleText.length - 1)
      .trim();

    return source;
  }

  /**
   * Returns the titleText (i.e. headline) of the specified titleInfo.
   * @param {?object} titleInfo An element containing the submission headline and source.
   */
  getTitleText(titleInfo) {
    if (titleInfo === null) {
      this.logger.logWarning("titleInfo is null");

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
   * @param {?object} submission Specifies the HN submission.
   * @returns {?number} The "rank" of an HN submission.
   * The rank is defined as the number to the far left of the submission.
   */
  getRank(submission) {
    if (submission === null) {
      this.logger.logWarning("submission is null");
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
          this.logger.logWarning("rank is null");

          return null;
        }

        return parseInt(rank.replace(".", "").trim(), 10);
      }
    }

    this.logger.logWarning(`no rank found: ${JSON.stringify(submission)}`);

    return null;
  }

  /**
   * Returns the titleInfo of the specified submission.
   * This is an element containing the headline and the source
   * of the submission.
   * @param {?object} submission Specifies the HN submission.
   */
  getTitleInfo(submission) {
    if (submission === null) {
      this.logger.logWarning("submission is null");

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

    this.logger.logWarning(`no titleInfo found: ${JSON.stringify(submission)}`);

    return null;
  }

  /**
   * Returns the submitter of the specified submission.
   * @param {?object} submission Specifies the HN submission.
   * @returns {?string} the username of the submitter.
   */
  getSubmitter(submission) {
    if (submission === null) {
      this.logger.logWarning("submission is null");

      return null;
    }

    const { nextSibling } = submission;
    if (nextSibling === null) {
      // TODO: this might be a bug
      const rank = this.getRank(submission);
      this.logger.logWarning(`nextSibling is null. rank is: ${rank}`);

      return null;
    }

    const userLink = nextSibling.querySelector(".hnuser");

    if (userLink == null) {
      const rank = this.getRank(submission);
      this.logger.logWarning(`userLink is null. rank is: ${rank}`);

      return null;
    }

    const hrefUser = userLink.getAttribute("href");

    if (hrefUser == null) {
      this.logger.logWarning("hrefUser is null");

      return null;
    }

    return hrefUser.replace("user?id=", "");
  }

  /**
   * Gets a SubmissionInfo object representing the different parts of the specified submission.
   * @param {?object} submission Specifies the HN submission.
   * @returns {?SubmissionInfo} A SubmissionInfo object representing the different parts of the specified submission.
   */
  getSubmissionInfoObject(submission) {
    if (submission === null) {
      return null;
    }

    const titleInfo = this.getTitleInfo(submission);

    const rank = this.getRank(submission);
    const submitter = this.getSubmitter(submission);
    const titleText = this.getTitleText(titleInfo);
    const source = this.getSource(titleInfo);
    const { rowIndex } = submission;

    const submissionInfo = new SubmissionInfo();
    submissionInfo.title = titleText;
    submissionInfo.source = source;
    submissionInfo.submitter = submitter;
    submissionInfo.rank = rank;
    submissionInfo.rowIndex = rowIndex;

    return submissionInfo;
  }

  /**
   * Filters out (i.e. deletes) all submissions on the
   * current HN page with a domain source contained in the specified blacklist.
   * @param {Entry[]} blacklistEntries A list containing entries to filter on.
   * @returns {SubmissionInfo[]} A list of submissions filtered out.
   */
  filterSubmissionsBySource(blacklistEntries) {
    const submissions = this.getSubmissions();

    const submissionTable = this.getSubmissionTable();

    const submissionsFiltered = [];

    function shouldFilter(source, entry) {
      const entryText = entry.text.toLowerCase();

      switch (entry.starCount) {
        case 0:
          return source === entryText;
        case 1:
          if (entryText.endsWith("*")) {
            return source.startsWith(entryText.replace("*", ""));
          }

          return source.endsWith(entryText.replace("*", ""));
        case 2:
          return source.includes(entryText.replaceAll("*", ""));
        default:
          this.logger.logError(`Invalid number of asterisks in ${entryText}`);

          return false;
      }
    }

    const exclusions = new Set();

    blacklistEntries.forEach((entry) => {
      if (entry.isExclusion) {
        exclusions.add(entry.text.toLowerCase().substring(1));
      }
    });

    blacklistEntries.forEach((entry) => {
      if (entry.prefix !== "source" || entry.isExclusion) {
        return;
      }

      for (let i = 0; i < submissions.length; i++) {
        const submissionInfo = this.getSubmissionInfoObject(submissions[i]);

        if (submissionInfo === null) {
          this.logger.logWarning(`submissionInfo is null. rank is ${i}`);

          continue;
        }

        if (submissionInfo.source == null) {
          this.logger.logWarning(`source is null. rank is ${i}`);

          continue;
        }

        if (exclusions.has(submissionInfo.source)) {
          this.logger.logInfo(
            `Source excluded from blacklisting - ${submissionInfo.source}`,
          );

          continue;
        }

        if (shouldFilter.call(this, submissionInfo.source, entry)) {
          this.logger.logInfo(
            `Source blacklisted - removing ${JSON.stringify(submissionInfo)}`,
          );

          // Delete the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the submission comments link
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the spacer row after the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          submissionsFiltered.push(submissionInfo);
        }
      }
    });

    return submissionsFiltered;
  }

  /**
   * Filters out (i.e. deletes) all submissions on the
   * current HN page with a title substring contained in the specified blacklist.
   * @param {Entry[]} blacklistEntries A list containing entries to filter on.
   * @returns {SubmissionInfo[]} A list of submissions filtered out.
   */
  filterSubmissionsByTitle(blacklistEntries) {
    const submissions = this.getSubmissions();

    const submissionTable = this.getSubmissionTable();

    const submissionsFiltered = [];

    blacklistEntries.forEach((entry) => {
      if (entry.prefix !== "title") {
        return;
      }

      for (let j = 0; j < submissions.length; j++) {
        const submissionInfo = this.getSubmissionInfoObject(submissions[j]);
        
        if (submissionInfo === null) {
          this.logger.logWarning(`submissionInfo is null. rank is ${i}`);

          continue;
        }

        if (
          submissionInfo.title.toLowerCase().includes(entry.text.toLowerCase())
        ) {
          this.logger.logInfo(
            `Title keyword blacklisted - removing ${JSON.stringify(submissionInfo)}`,
          );

          // Delete the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the submission comments link
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the spacer row after the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          submissionsFiltered.push(submissionInfo);
        }
      }
    });

    return submissionsFiltered;
  }

  /**
   * Filters out (i.e. deletes) all submissions on the
   * current HN page submitted by the specified user.
   * @param {Entry[]} blacklistEntries A list containing entries to filter on.
   * @returns {SubmissionInfo[]} A list of submissions filtered out.
   */
  filterSubmissionsByUser(blacklistEntries) {
    const submissions = this.getSubmissions();

    const submissionTable = this.getSubmissionTable();

    const submissionsFiltered = [];

    blacklistEntries.forEach((entry) => {
      if (entry.prefix !== "user") {
        return;
      }

      for (let j = 0; j < submissions.length; j++) {
        const submissionInfo = this.getSubmissionInfoObject(submissions[j]);

        if (submissionInfo === null) {
          this.logger.logWarning(`submissionInfo is null. rank is ${i}`);

          continue;
        }

        if (
          submissionInfo.submitter != null &&
          submissionInfo.submitter.toLowerCase() === entry.text.toLowerCase()
        ) {
          this.logger.logInfo(
            `User blacklisted - removing ${JSON.stringify(submissionInfo)}`,
          );

          // Delete the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the submission comments link
          submissionTable.deleteRow(submissionInfo.rowIndex);

          // Delete the spacer row after the submission
          submissionTable.deleteRow(submissionInfo.rowIndex);

          submissionsFiltered.push(submissionInfo);
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

export default PageEngine;
