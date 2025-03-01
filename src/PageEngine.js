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

    const source = titleText
      .substring(lastParenIndex + 1, titleText.length - 1)
      .trim();

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

        if (
          submissionInfo.source != null &&
          submissionInfo.source === entry.text.toLowerCase()
        ) {
          logInfo(
            `Source blacklisted - removing ${JSON.stringify(submissionInfo)}`,
          );

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

        if (
          submissionInfo.title.toLowerCase().includes(entry.text.toLowerCase())
        ) {
          logInfo(
            `Title keyword blacklisted - removing ${JSON.stringify(submissionInfo)}`,
          );

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

        if (
          submissionInfo.submitter != null &&
          submissionInfo.submitter.toLowerCase() === entry.text.toLowerCase()
        ) {
          logInfo(
            `User blacklisted - removing ${JSON.stringify(submissionInfo)}`,
          );

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

export default PageEngine;
