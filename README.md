![Greasy Fork Version](https://img.shields.io/greasyfork/v/427213-hn-blacklist)
![Greasy Fork Downloads](https://img.shields.io/greasyfork/dt/427213-hn-blacklist)

# HN Blacklist

Tired of seeing articles from certain sources on Hacker News?

HN Blacklist is for you.

HN Blacklist is a [userscript](https://en.wikipedia.org/wiki/Userscript) which can be run with tools like Greasemonkey and Tampermonkey right in your browser.

Find it on [Greasy Fork](https://greasyfork.org/en/scripts/427213-hn-blacklist), or copy and paste it right from here.

## Filtering

### By domain:

Simply modify `hn-blacklist.js` - adding the domains of sites you don't want to see articles from:

```
// Add sources you don't want to see here.
const blacklist = new Set(
    [
        "source:nautil.us",
        "source:fs.blog"
    ]
);
```

### By title text:

If you're tired of seeing articles mentioning "ChatGPT", for example, add the following to the blacklist:

```
// Add sources you don't want to see here.
const blacklist = new Set(
    [
        "title:ChatGPT"
    ]
);
```

All titles containing the string "ChatGPT" will be filtered out. This filtering is case-insensitive.

### By user:

If you want to filter out submissions by a certain user, prefix your blacklist entry with the string `user:`, followed by the username.

```
// Add sources you don't want to see here.
const blacklist = new Set(
    [
        "user:booleandilemma"
    ]
);
```

## UI

As of [release 2.1.0](https://github.com/booleandilemma/hn-blacklist/releases/tag/2.1.0), HN Blacklist displays helpful information at the bottom of HN:

<img width="263" alt="ui" src="https://github.com/user-attachments/assets/494a7721-5807-4343-a2a5-33568322d9c6" />

This can be hidden by changing the config variable `displayResults` to `false`.

## Testing

TBD