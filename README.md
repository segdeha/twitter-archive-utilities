# Delete Old Retweets

Script to delete retweets using your Twitter archive. These are different from quote tweets. This script does not delete quote tweets.

This script does not delete the original tweet. It does remove retweets from your timeline.

## WARNING: Retweets are removed from your timeline immediately upon running the script. Be sure this is what you want before you run it!

1. Clone or download this repo
1. Make a copy of the file `.envsample` called `.env` at the root of the `twitter-archive-utilities` directory
1. Get your tokens and keys from Twitter by [creating an app](https://apps.twitter.com/)
1. Add your tokens and keys to `.env` along with your username and the max age (in days) of the retweets you want to keep
1. Request your archive from [your Twitter settings page](https://twitter.com/settings/account)
1. From the downloaded archive, copy the `tweets` directory (located in `<archive>/data/`) to the root of the `twitter-archive-utilities` directory
1. Open a terminal window
1. Run `npm install` (first use only)
1. Run `node app.js`
