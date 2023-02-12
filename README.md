# HN Blacklist

Tired of seeing articles from certain sources on Hacker News?

HN Blacklist is for you.

HN Blacklist is a [userscript](https://en.wikipedia.org/wiki/Userscript) which can be run with tools like Greasemonkey and Tampermonkey right in your browser.

Find it on [Greasy Fork](https://greasyfork.org/en/scripts/427213-hn-blacklist), or copy and paste it right from here.

## Filtering by domain

Simply modify `hn-blacklist.js` - adding the domains of sites you don't want to see articles from:

```
// Add sources you don't want to see here.
const blacklist = new Set(
    [
        'nautil.us',
        'fs.blog'
    ]
);
```

## Filtering by title text

If you're tired of seeing articles mentioning "ChatGPT", for example, add the following to the blacklist:

```
// Add sources you don't want to see here.
const blacklist = new Set(
    [
        'title:ChatGPT'
    ]
);
```

All titles containing the string "ChatGPT" will be filtered out. This filtering is case-insensitive.
