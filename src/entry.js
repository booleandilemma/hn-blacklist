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

    /**
     * starCount indicates the number of stars (asterisks) of the source to filter by.
     * @type {number}
     * @public
     */
    this.starCount = null;

    /**
     * isExclusion indicates whether or not this source should be excluded from blacklisting.
     * @type {boolean}
     * @public
     */
    this.isExclusion = null;

    this.#buildEntry(input);
  }

  /**
   * Determines if the input is valid.
   * @param {string} input - Something the user wants to filter by.
   * @param {number} starCount - The number of stars in the input.
   * It can begin with "source:", "title:", or "user:".
   * @returns {boolean} A boole indicating whether or not the entry is valid.
   */
  #isValidInput(input, starCount) {
    if (input.startsWith("source:") && this.#isValidSource(input, starCount)) {
      return true;
    }

    if (input.startsWith("title:") && this.#isValidTitle(input)) {
      return true;
    }

    if (input.startsWith("user:") && this.#isValidUser(input)) {
      return true;
    }

    return false;
  }

  #isValidSource(input, starCount) {

    if (this.#getCharCount(input, "!") > 1) {
      return false;
    }

    if (input.includes("!") && input.includes("*")) {
      return false;
    }

    if (input.includes("!") && !input.startsWith("source:!")) {
      return false;
    }

    return this.#hasValidStars(input, starCount);
  }

  #isValidTitle(input) {
    return !input.includes("!") && !input.includes("*");
  }

  #isValidUser(input) {
    return !input.includes("!") && !input.includes("*");
  }

  #hasValidStars(input, starCount) {
    input = input.replace("source:", "");

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

  #getCharCount(input, char) {
    let starCount = 0;

    for (let c of input) {
      if (c == char) {
        starCount++;
      }
    }

    return starCount;
  }

  #isExclusion(input) {
    return input.startsWith("source:!");
  }

  #buildEntry(input) {
    this.starCount = this.#getCharCount(input, "*");
    this.isExclusion = this.#isExclusion(input);
    this.isValid = this.#isValidInput(input, this.starCount);

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
