// ==UserScript==
// @name         HN Blacklist
// @author       booleandilemma
// @description  Hide Hacker News submissions from sources you don't want to see
// @homepageURL  https://github.com/booleandilemma/hn-blacklist
// @include      https://news.ycombinator.com/
// @include      https://news.ycombinator.com/news*
// @version      2.0.3
// @grant        none
// @license      GPL-3.0
// ==/UserScript==

const UserScriptName = 'HN Blacklist';

class Entry {
  constructor(prefixedInput) {
    this.buildEntry(prefixedInput);
  }

  buildEntry(prefixedInput) {
    const prefix = prefixedInput.substring(0, prefixedInput.indexOf(':'));
    const text = prefixedInput.substring(prefixedInput.indexOf(':') + 1);

    this.prefix = prefix;
    this.text = text;
  }
}

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
 * Updates the specified submission to the specified rank.
 * @param {?object} submission - Specifies the HN submission.
 * @param {?number} newRank - Specifies the new rank to set on the specified submission.
 */
function setRank(submission, newRank) {
  if (submission === null) {
    logWarning('submission is null');

    return;
  }

  let titleIndex = 0;

  for (let i = 0; i < submission.childNodes.length; i++) {
    const childNode = submission.childNodes[i];

    if (childNode.className === 'title') {
      titleIndex++;
    }

    if (titleIndex === 1) {
      const rank = childNode.innerText;

      if (rank === null) {
        logWarning('rank is null');

        return;
      }

      childNode.innerText = `${newRank}.`;

      return;
    }
  }

  logWarning(`no rank found: ${JSON.stringify(submission)}`);
}

/**
 * Returns the source of the specified titleInfo.
 * @param {?object} titleInfo - An element containing the submission headline and source.
 */
function getSource(titleInfo) {
  if (titleInfo === null) {
    logWarning('titleInfo is null');

    return null;
  }

  const titleText = titleInfo.innerText;

  const lastParenIndex = titleText.lastIndexOf('(');

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
function getTitleText(titleInfo) {
  if (titleInfo === null) {
    logWarning('titleInfo is null');

    return null;
  }

  const titleText = titleInfo.innerText;

  const lastParenIndex = titleText.lastIndexOf('(');

  if (lastParenIndex < 0) {
    return titleText;
  }

  return titleText.substring(0, lastParenIndex);
}

/**
 * Returns the "rank" of an HN submission. The rank is defined as the
 * number to the far left of the submission.
 * @param {?object} submission - Specifies the HN submission.
 */
function getRank(submission) {
  if (submission === null) {
    logWarning('submission is null');
    return null;
  }

  let titleIndex = 0;

  for (let i = 0; i < submission.childNodes.length; i++) {
    const childNode = submission.childNodes[i];

    if (childNode.className === 'title') {
      titleIndex++;
    }

    if (titleIndex === 1) {
      const rank = childNode.innerText;

      if (rank === null) {
        logWarning('rank is null');

        return null;
      }

      return parseInt(rank.replace('.', '').trim(), 10);
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
function getTitleInfo(submission) {
  if (submission === null) {
    logWarning('submission is null');

    return null;
  }

  let titleIndex = 0;

  for (let i = 0; i < submission.childNodes.length; i++) {
    const childNode = submission.childNodes[i];

    if (childNode.className === 'title') {
      titleIndex++;
    }

    if (titleIndex === 2) {
      return childNode;
    }
  }

  logWarning(`no titleInfo found: ${JSON.stringify(submission)}`);

  return null;
}

function getSubmitter(submission) {
  if (submission === null) {
    logWarning('submission is null');

    return null;
  }

  const { nextSibling } = submission;
  if (nextSibling === null) {
    // TODO: this might be a bug
    logWarning('nextSibling is null');

    return null;
  }

  const userLink = nextSibling.querySelector('.hnuser');

  if (userLink == null) {
    logWarning('userLink is null');

    return null;
  }

  const hrefUser = userLink.getAttribute('href');

  if (hrefUser == null) {
    logWarning('hrefUser is null');

    return null;
  }

  return hrefUser.replace('user?id=', '');
}

/**
 * Returns an object representing the different parts of the specified submission.
 * These are: title, source, rank, and rowIndex.
 * @param {?object} submission - Specifies the HN submission.
 */
function getSubmissionInfo(submission) {
  if (submission === null) {
    return null;
  }

  const titleInfo = getTitleInfo(submission);

  const rank = getRank(submission);
  const submitter = getSubmitter(submission);
  const titleText = getTitleText(titleInfo);
  const source = getSource(titleInfo);
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
 * Get the thing holding the list of submissions.
 */
function getSubmissionTable() {
  return document.querySelectorAll('.athing')[0].parentElement;
}

/**
 * Get the list of submissions.
 */
function getSubmissions() {
  return document.querySelectorAll('.athing');
}

/**
 * Filters out (i.e. deletes) all submissions on the
 * current HN page with a domain source contained in the specified blacklist.
 * Returns a boolean indicating
 * whether or not at least one submission was filtered out.
 * @param {set} blacklistEntries - A list containing entries to filter on.
 */
function filterSubmissionsBySource(blacklistEntries) {
  const submissions = getSubmissions();

  const submissionTable = getSubmissionTable();

  let somethingRemoved = false;

  blacklistEntries.forEach((entry) => {
    if (entry.prefix !== 'source') {
      return;
    }

    for (let i = 0; i < submissions.length; i++) {
      const submissionInfo = getSubmissionInfo(submissions[i]);

      if (submissionInfo.source !== null && submissionInfo.source === entry.text.toLowerCase()) {
        logInfo(`Removing ${JSON.stringify(submissionInfo)}`);

        // Delete the submission
        submissionTable.deleteRow(submissionInfo.rowIndex);

        // Delete the submission comments link
        submissionTable.deleteRow(submissionInfo.rowIndex);

        // Delete the spacer row after the submission
        submissionTable.deleteRow(submissionInfo.rowIndex);

        somethingRemoved = true;
      }
    }
  });

  return somethingRemoved;
}

/**
 * Filters out (i.e. deletes) all submissions on the
 * current HN page with a title substring contained in the specified blacklist.
 * Returns a boolean indicating
 * whether or not at least one submission was filtered out.
 * @param {set} blacklistEntries - A list containing entries to filter on.
 */
function filterSubmissionsByTitle(blacklistEntries) {
  const submissions = getSubmissions();

  const submissionTable = getSubmissionTable();

  let somethingRemoved = false;

  blacklistEntries.forEach((entry) => {
    if (entry.prefix !== 'title') {
      return;
    }

    for (let j = 0; j < submissions.length; j++) {
      const submissionInfo = getSubmissionInfo(submissions[j]);

      if (submissionInfo.title.toLowerCase().includes(entry.text.toLowerCase())) {
        logInfo(`Removing ${JSON.stringify(submissionInfo)}`);

        // Delete the submission
        submissionTable.deleteRow(submissionInfo.rowIndex);

        // Delete the submission comments link
        submissionTable.deleteRow(submissionInfo.rowIndex);

        // Delete the spacer row after the submission
        submissionTable.deleteRow(submissionInfo.rowIndex);

        somethingRemoved = true;
      }
    }
  });

  return somethingRemoved;
}

/**
 * Filters out (i.e. deletes) all submissions on the
 * current HN page submitted by the specified user.
 * Returns a boolean indicating whether or not at least one submission was filtered out.
 * @param {set} blacklistEntries - A list containing entries to filter on.
 */
function filterSubmissionsByUser(blacklistEntries) {
  const submissions = getSubmissions();

  const submissionTable = getSubmissionTable();

  let somethingRemoved = false;

  blacklistEntries.forEach((entry) => {
    if (entry.prefix !== 'user') {
      return;
    }

    for (let j = 0; j < submissions.length; j++) {
      const submissionInfo = getSubmissionInfo(submissions[j]);

      if (submissionInfo.submitter !== null
        && submissionInfo.submitter.toLowerCase().includes(entry.text.toLowerCase())) {
        logInfo(`Removing ${JSON.stringify(submissionInfo)}`);

        // Delete the submission
        submissionTable.deleteRow(submissionInfo.rowIndex);

        // Delete the submission comments link
        submissionTable.deleteRow(submissionInfo.rowIndex);

        // Delete the spacer row after the submission
        submissionTable.deleteRow(submissionInfo.rowIndex);

        somethingRemoved = true;
      }
    }
  });

  return somethingRemoved;
}

/**
 * Filters out (i.e. deletes) all submissions on the
 * current HN page matching an entry in the specified blacklist.
 * Returns a boolean indicating
 * whether or not at least one submission was filtered out.
 * @param {set} blacklist - A set containing the domains to filter out.
 */
function filterSubmissions(blacklist) {
  const submissionFilteredBySource = filterSubmissionsBySource(blacklist);
  const submissionFilteredByTitle = filterSubmissionsByTitle(blacklist);
  const submissionFilteredByUser = filterSubmissionsByUser(blacklist);

  return submissionFilteredBySource
         || submissionFilteredByTitle
         || submissionFilteredByUser;
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
 * @param {?number} topRank - Specifies the top rank to start numbering from.
 */
function reindexSubmissions(topRank) {
  const submissions = document.querySelectorAll('.athing');

  for (let i = 0; i < submissions.length; i++) {
    setRank(submissions[i], topRank + i);
  }
}

/**
 * Scans the list of submissions on the current HN page
 * and returns the rank of the first submission in the list.
 */
function getTopRank() {
  const submissions = document.querySelectorAll('.athing');

  const topRank = getRank(submissions[0]);

  return topRank;
}

function isValidInput(input) {
  if (input.startsWith('source:')
  || input.startsWith('title:')
  || input.startsWith('user:')) {
    return true;
  }

  return false;
}

function warnAboutInvalidBlacklistEntries(blacklist) {
  blacklist.forEach((input) => {
    if (!isValidInput(input)) {
      logWarning(`'${input}' is an invalid entry and will be skipped. `
      + 'Entries must begin with \'source:\', \'title:\', or \'user:\'.');
    }
  });
}

function buildEntries(blacklist) {
  const entries = [];

  blacklist.forEach((input) => {
    if (isValidInput(input)) {
      entries.push(
        new Entry(input),
      );
    }
  });

  return entries;
}

function main() {
  /*
   * Add sources you don't want to see here.
   *
   * Three types of sources can be filtered on:
   *
   * 1) 'source:' will filter the submission by the domain it comes from.
   * 2) 'title:' will filter the submission by the words contained in the title.
   * 3) 'user:' will filter the submission by the user who submitted it.
   *
   * For example, 'source:example.com' will filter all submissions coming from 'example.com'.
  */
  const blacklist = new Set(
    [
    ],
  );

  warnAboutInvalidBlacklistEntries(blacklist);

  const blacklistEntries = buildEntries(blacklist);

  const topRank = getTopRank();

  const somethingRemoved = filterSubmissions(blacklistEntries);

  if (!somethingRemoved) {
    logInfo('Nothing filtered');

    return;
  }

  logInfo('Reindexing submissions');

  reindexSubmissions(topRank);
}

main();
