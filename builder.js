import * as fs from "fs";

let finalOutput = "";

let mainContent = getFileContent("src/main.js");
mainContent = insertUseStrict(mainContent);

finalOutput += mainContent;

const files = fs
  .readdirSync("src", { recursive: true })
  .filter((f) => f.endsWith(".js"))
  .filter((f) => f !== "main.js")
  .sort();

for (const file of files) {
  finalOutput += getFileContent(`src/${file}`);
}

finalOutput += "main();\n";

fs.writeFileSync("hn-blacklist.js", finalOutput);

function getFileContent(file) {
  const content = fs.readFileSync(file, { encoding: "utf8" });

  let output = "";

  const lines = content.split("\n");
  let lineNumber = 0;

  for (const line of lines) {
    if (line.startsWith("import ") || line.startsWith("export default ")) {
      continue;
    }

    lineNumber++;

    if (lineNumber == lines.length - 1) {
      break;
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

    if (line.startsWith("// ==/UserScript==")) {
      insertOnNextLine = true;
    }
  }

  return results;
}
