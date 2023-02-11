// ==UserScript==
// @name         HN Blacklist
// @description  Hide Hacker News submissions from sources you don't want to see
// @include      https://news.ycombinator.com/
// @include      https://news.ycombinator.com/news*
// @version      1.1
// @grant        none
// @license      GPL-3.0-or-later
// ==/UserScript==

const UserScriptName = "HN Blacklist";

function main() {

    // Add sources you don't want to see here.
    const blacklist = new Set(
        [
        ]
    );

    const topRank = getTopRank();

    const somethingRemoved = filterSubmissions(blacklist);

    if (!somethingRemoved) {

        logInfo("Nothing filtered");

        return;
    }

    logInfo('Reindexing submissions');

    reindexSubmissions(topRank);
}

/**
 * Updates the specified submission to the specified rank.
 * @param {?object} submission - Specifies the HN submission.
 * @param {?number} newRank - Specifies the new rank to set on the specified submission.
 */
function setRank(submission, newRank) {

    if (submission === null) {
        logWarning("submission is null");

        return null;
    }

    let titleIndex = 0;

    for (let i = 0; i < submission.childNodes.length; i++) {

        const childNode = submission.childNodes[i];

        if (childNode.className == "title") {

            titleIndex++;
        }

        if (titleIndex === 1) {

            let rank = childNode.innerText;

            if (rank === null) {
                logWarning("rank is null");

                return null;
            }

            childNode.innerText = newRank + "."

            return;
        }
    }

    logWarning("no rank found: " + JSON.stringify(submission));
}

/**
 * Returns the source of the specified titleInfo.
 * @param {?object} titleInfo - An element containing the submission headline and source.
 */
function getSource(titleInfo) {

    if (titleInfo === null) {
        logWarning("titleInfo is null");

        return null;
    }

    let titleText = titleInfo.innerText;

    let lastParenIndex = titleText.lastIndexOf("(");

    if (lastParenIndex < 0) {
        return null;
    }

    let source = titleText.substring(lastParenIndex + 1, titleText.length - 1).trim();

    return source;
}

/**
 * Returns the titleText (i.e. headline) of the specified titleInfo.
 * @param {?object} titleInfo - An element containing the submission headline and source.
 */
function getTitleText(titleInfo) {

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
 * Returns the "rank" of an HN submission. The rank is defined as the
 * number to the far left of the submission.
 * @param {?object} submission - Specifies the HN submission.
 */
function getRank(submission) {

    if (submission === null) {
        logWarning("submission is null");
        return null;
    }

    let titleIndex = 0;

    for (let i = 0; i < submission.childNodes.length; i++) {

        const childNode = submission.childNodes[i];

        if (childNode.className == "title") {

            titleIndex++;
        }

        if (titleIndex === 1) {

            let rank = childNode.innerText;

            if (rank === null) {
                logWarning("rank is null");

                return null;
            }

            return parseInt(rank.replace(".", "").trim());
        }
    }

    logWarning("no rank found: " + JSON.stringify(submission));

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
        logWarning("submission is null");

        return null;
    }

    let titleIndex = 0;

    for (let i = 0; i < submission.childNodes.length; i++) {

        const childNode = submission.childNodes[i];

        if (childNode.className == "title") {

            titleIndex++;
        }

        if (titleIndex === 2) {
            return childNode;
        }
    }

    logWarning("no titleInfo found: " + JSON.stringify(submission));

    return null;
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
    const titleText = getTitleText(titleInfo);
    const source = getSource(titleInfo);
    const rowIndex = submission.rowIndex;

    return {
        title: titleText,
        source: source,
        rank: rank,
        rowIndex: rowIndex
    };
}

/**
 * Filters out (i.e. deletes) all submissions on the
 * current HN page matching an entry in the specified blacklist.
 * Returns a boolean indicating
 * whether or not at least one submission was filtered out.
 * @param {set} blacklist - A set containing the domains to filter out.
 */
 function filterSubmissions(blacklist) {

    let submissionFilteredBySource = filterSubmissionsBySource(blacklist);
    let submissionFilteredByTitle = filterSubmissionsByTitle(blacklist);

    return submissionFilteredBySource || submissionFilteredByTitle;
}

/**
 * Filters out (i.e. deletes) all submissions on the
 * current HN page with a domain source contained in the specified blacklist.
 * Returns a boolean indicating
 * whether or not at least one submission was filtered out.
 * @param {set} blacklist - A set containing the domains to filter out.
 */
function filterSubmissionsBySource(blacklist) {
    const submissions = getSubmissions();

    const submissionTable = getSubmissionTable();

    let somethingRemoved = false;

    for (let i = 0; i < submissions.length; i++) {

        const submissionInfo = getSubmissionInfo(submissions[i]);

        if (submissionInfo.source === null) {
            continue;
        }

        if (blacklist.has(submissionInfo.source)) {

            logInfo("Removing " + JSON.stringify(submissionInfo));

            submissionTable.deleteRow(submissionInfo.rowIndex); //delete the submission
            submissionTable.deleteRow(submissionInfo.rowIndex); //delete the submission comments link
            submissionTable.deleteRow(submissionInfo.rowIndex); //delete the spacer row after the submission

            somethingRemoved = true;
        }
    }

    return somethingRemoved;
}

/**
 * Filters out (i.e. deletes) all submissions on the
 * current HN page with a title substring contained in the specified blacklist.
 * Returns a boolean indicating
 * whether or not at least one submission was filtered out.
 * @param {set} blacklist - A set containing the title substrings to filter out.
 */
function filterSubmissionsByTitle(blacklist) {
    const submissions = getSubmissions();

    const submissionTable = getSubmissionTable();

    let somethingRemoved = false;

    blacklist.forEach(entry => {

        if(!entry.startsWith("title:")) {
            return;
        }

        const filter = entry.substring(entry.indexOf("title:") + "title:".length).toLowerCase();

        for (let j = 0; j < submissions.length; j++) {

            const submissionInfo = getSubmissionInfo(submissions[j]);

            if (submissionInfo.title.toLowerCase().includes(filter)) {

                logInfo("Removing " + JSON.stringify(submissionInfo));

                submissionTable.deleteRow(submissionInfo.rowIndex); //delete the submission
                submissionTable.deleteRow(submissionInfo.rowIndex); //delete the submission comments link
                submissionTable.deleteRow(submissionInfo.rowIndex); //delete the spacer row after the submission

                somethingRemoved = true;
            }
        }
    });
    
    return somethingRemoved;
}

/**
 * Updates the ranks of all of the remaining submissions on the current HN page.
 * This function is intended to be called after the submissions have been filtered.
 * This is because once the submissions are filtered, there is a gap in the rankings.
 * For example, if the 3rd submission is removed, the remaining submissions will have
 * ranks of: 1, 2, 4, 5, etc.
 * This function will correct the remaining submissions to have ranks of: 1, 2, 3, 4, etc.
 * This is accomplished by passing in the top rank on the current HN page _before_ any filtering is done.
 * For example, if the current HN page is the first one, the top rank will be "1",
 * and so numbering will start from 1. If the current page is the second one, the top rank will be "31".
 * @param {?number} topRank - Specifies the top rank to start numbering from.
 */
function reindexSubmissions(topRank) {
    const submissions = document.querySelectorAll('.athing');

    for (let i = 0; i < submissions.length; i++) {

        const submissionInfo = getSubmissionInfo(submissions[i]);

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

    return topRank
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
 * Logs an info message to the console.
 * @param {string} message - Specifies the message to log.
 */
function logInfo(message) {
    console.info(UserScriptName + ": " + message);
}

/**
 * Logs a warning message to the console.
 * @param {string} message - Specifies the message to log.
 */
function logWarning(message) {
    console.warn(UserScriptName + ": " + message);
}

main();
