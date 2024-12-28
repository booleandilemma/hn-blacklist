![Greasy Fork Version](https://img.shields.io/greasyfork/v/427213-hn-blacklist)
![Greasy Fork Downloads](https://img.shields.io/greasyfork/dt/427213-hn-blacklist)

# HN Blacklist

Tired of seeing articles from certain sources on Hacker News?

HN Blacklist is for you.

HN Blacklist is a [userscript](https://en.wikipedia.org/wiki/Userscript) which can be run with tools like Greasemonkey and Tampermonkey right in your browser.

Find it on [Greasy Fork](https://greasyfork.org/en/scripts/427213-hn-blacklist), or copy and paste it right from here.

## Filtering

HN Blacklist provides a UI at the bottom of HN. You can add entries and see helpful output from HN Blacklist there.

### By domain:

Prefix them with "source:", like so:

<img width="293" alt="filter_by_source" src="https://github.com/user-attachments/assets/b4fe8580-05f1-400d-b3c4-ea84551cde37" />

### By title text:

If you're tired of seeing articles mentioning "ChatGPT", for example, add the following to the blacklist:

<img width="290" alt="filter_by_title" src="https://github.com/user-attachments/assets/3421def0-76fc-48dc-a1ab-8cb031d22d22" />

All titles containing the string "ChatGPT" will be filtered out. This filtering is case-insensitive.

### By user:

If you want to filter out submissions by a certain user, prefix your blacklist entry with the string `user:`, followed by the username, like so:

<img width="287" alt="filter_by_user" src="https://github.com/user-attachments/assets/fe0bb407-3546-4a96-b8af-039b17fd7103" />

## Testing

TBD
