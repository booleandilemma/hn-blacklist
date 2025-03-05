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
    if (input.startsWith("source:") && this.#hasValidStars(input)) {
      return true;
    }

    if (input.startsWith("title:") || input.startsWith("user:")) {
      return true;
    }

    return false;
  }

  #hasValidStars(input) {
    input = input.replace("source:", "");

    let starCount = 0;

    for (let c of input) {
      if (c == "*") {
        starCount++;
      }
    }

    switch (starCount) {
      case 0:
        return true;
      case 1:
        return input.startsWith("*") || input.endsWith("*");
      case 2:
        return input.startsWith("*") && input.endsWith("*");
      default:
        return false;
    }
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

export default Entry;
