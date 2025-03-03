import PageEngine from "./pageEngine.js";
import Blacklister from "./blacklister.js";
import FilterResults from "./filterResults.js";
import Tester from "./tests/tester.js";
import PageEngineTests from "./tests/pageEngineTests.js";
// ==UserScript==
// @name         HN Blacklist
// @author       booleandilemma
// @description  Hide Hacker News submissions from sources you don't want to see
// @homepageURL  https://greasyfork.org/en/scripts/427213-hn-blacklist
// @match        https://news.ycombinator.com/
// @match        https://news.ycombinator.com/news*
// @version      3.0.3
// @grant        GM.getValue
// @grant        GM.setValue
// @license      GPL-3.0
// ==/UserScript==

const UserScriptName = "HN Blacklist";
const UserScriptVersion = "3.0.3";

async function saveInputsAsync() {
  const filtersElement = document.getElementById("filters");

  const filterText = filtersElement.value.trim();

  const chkfilterEvenWithTestFailuresElement = document.getElementById(
    "chkfilterEvenWithTestFailures",
  );

  await GM.setValue("filters", filterText);
  await GM.setValue(
    "filterEvenWithTestFailures",
    chkfilterEvenWithTestFailuresElement.checked,
  );

  alert("Filters saved! Please refresh the page.");
}

function getBlacklist(filterText) {
  const blacklist = new Set();

  if (filterText == null) {
    return blacklist;
  }

  const filters = filterText.split("\n");

  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i].trim();

    if (filter !== "" && !filter.startsWith("#")) {
      blacklist.add(filter);
    }
  }

  return blacklist;
}

async function main() {
  const startTime = performance.now();

  const logger = new Logger();

  const pageEngine = new PageEngine(logger);

  const tester = new Tester();
  const pageEngineTester = new PageEngineTests(pageEngine);
  const testResults = tester.runTests(pageEngineTester);

  logger.logInfo(testResults.summaryForLogging);

  const filterText = (await GM.getValue("filters")) ?? "";
  const filterEvenWithTestFailures = await GM.getValue(
    "filterEvenWithTestFailures",
  );

  testResults.filterEvenWithTestFailures = filterEvenWithTestFailures;

  const blacklist = getBlacklist(filterText);

  const blacklister = new Blacklister(pageEngine, blacklist);
  blacklister.warnAboutInvalidBlacklistEntries();

  blacklister.displayUI(testResults, filterText, filterEvenWithTestFailures);

  let filterResults = null;

  if (filterEvenWithTestFailures || testResults.failCount === 0) {
    filterResults = blacklister.filterSubmissions();
  } else {
    filterResults = new FilterResults();
  }

  const timeTaken = performance.now() - startTime;

  blacklister.displayResults(timeTaken, filterResults, testResults);
}
