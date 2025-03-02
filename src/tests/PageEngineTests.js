/**
 * This class contains several tests for testing the correctness of the PageEngine.
 * As the PageEngine is the closest code in this userscript to HN,
 * it's most susceptible to breaking if the HN developers change something.
 * Therefore, it's good to have tests for all of its functionality.
 */
class PageEngineTests {
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
    if (fifthRank !== firstRankOnPage + 4) {
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

export default PageEngineTests;
