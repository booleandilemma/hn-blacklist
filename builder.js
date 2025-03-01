import * as fs from "fs";

let finalOutput = "";

let mainContent = getFileContent("src/Main.js");
mainContent = insertUseStrict(mainContent);

finalOutput += mainContent;

const files = fs
  .readdirSync("src", { recursive: true })
  .filter((f) => f.endsWith(".js"))
  .filter((f) => f !== "Main.js")
  .sort();

for (const file of files) {
  finalOutput += getFileContent(`src/${file}`);
}

fs.writeFileSync("hn-blacklist.js", finalOutput);

function getFileContent(file) {
  const content = fs.readFileSync(file, { encoding: "utf8" });

  let output = "";

  for (const line of content.split("\n")) {
    if (line.startsWith("import ") || line.startsWith("export default ")) {
      continue;
    }

    output += `${line}\n`;
  }

  return output;
}

function insertUseStrict(mainContent) {
  let results = "";

  let insertOnNextLine = false;

  for (const line of mainContent.split("\n")) {
    if (insertOnNextLine) {
      results += "\n";
      results += '"use strict";\n';
      results += "\n";

      insertOnNextLine = false;
      continue;
    }

    results += `${line}\n`;

    if (line === "// ==/UserScript==") {
      insertOnNextLine = true;
    }
  }

  return results;
}
