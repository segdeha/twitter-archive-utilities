# Delete Old Retweets

1. Clone or download this repo
1. Run `npm install` (first use only)
1. Make a copy of the file `.envsample` called `.env` at the root of the `twitter-archive-utilities` directory
1. Get your tokens and keys from Twitter
1. Add your tokens and keys to `.env` along with your username and the max age (in days) of the retweets you want to keep
1. Request your archive from [your Twitter settings page](https://twitter.com/settings/account)
1. From the downloaded archive, copy the `tweets` directory (located in `<archive>/data/`) to the root of the `twitter-archive-utilities` directory
1. Open a terminal window
1. Run `node app.js`
