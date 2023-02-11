# HN Blacklist

Tired of seeing articles from certain sources on Hacker News?

HN Blacklist is for you.

Simply modify hn-blacklist.js - adding the domains of sites you don't want to see articles from:

```
    // Add sources you don't want to see here.
    const blacklist = new Set(
        [
         "nautil.us",
         "fs.blog"
        ]
    );
```

It's also possible to filter articles by title substrings. If you're tired of seeing articles mentioning "Amazon",
add the following to the blacklist:

```
    // Add sources you don't want to see here.
    const blacklist = new Set(
        [
         "title:Amazon"
        ]
    );
```

All titles containing the string "Amazon" will be filtered. This filtering is case-insensitive.

---

HN Blacklist is a [userscript](https://en.wikipedia.org/wiki/Userscript) which can be run with tools like Greasemonkey and Tampermonkey right in your browser.

Find it on [Greasy Fork](https://greasyfork.org/en/scripts/427213-hn-blacklist).
