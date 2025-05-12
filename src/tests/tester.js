class TestResults {
  constructor() {
    this.filterEvenWithTestFailures = null;
    this.failCount = null;
    this.testCount = null;
    this.timeTaken = null;
  }
}

class Tester {
  runTests(testClass) {
    const tests = this.#getTests(Object.getPrototypeOf(testClass));

    const resultsForLogging = [];
    let failCount = 0;

    const startTime = performance.now();

    for (let i = 0; i < tests.length; i++) {
      const testResult = this.#runTest(testClass, tests[i]);

      if (testResult.status !== "passed") {
        failCount++;
      }

      resultsForLogging.push(testResult);
    }

    const timeTaken = Math.floor(performance.now() - startTime);

    const testResults = new TestResults();
    testResults.failCount = failCount;
    testResults.testCount = tests.length;
    testResults.timeTaken = timeTaken;
    testResults.summaryForLogging = this.#getSummaryForLogging(
      resultsForLogging,
      failCount,
      timeTaken,
    );

    return testResults;
  }

  failWith(result) {
    result.status = "failed";

    throw result;
  }

  #getTests(testClass) {
    return Object.getOwnPropertyNames(testClass).filter((p) =>
      p.startsWith("test_"),
    );
  }

  #runTest(testClass, testToRun) {
    try {
      testClass[testToRun](this);
    } catch (error) {
      const result = {
        name: testToRun,
        status: error.status ?? "failed",
        message: error.message,
        stackTrace: error.stack,
      };

      return result;
    }

    const result = {
      name: testToRun,
      status: "passed",
    };

    return result;
  }

  #getSummaryForLogging(results, failCount, timeTaken) {
    const testCount = results.length;

    let summary;

    if (failCount === 0) {
      summary = `Tests Results ${testCount}/${testCount} Passed in ${timeTaken} ms`;
    } else {
      summary = `Tests Results ${testCount - failCount}/${testCount} Passed ${JSON.stringify(results, null, 2)} in ${timeTaken} ms`;
    }

    return summary;
  }
}

export default Tester;
