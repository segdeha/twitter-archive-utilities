require('dotenv').config()
const Twitter = require('./lib/twitter')
const Moment = require('moment')
const dir = require('node-dir')
const Promise = require('bluebird')

let tweets = []

function readTweets(err, content, next) {
    if (err) throw err
    // strip Grailbird assignment statement
    content = content.replace(/Grailbird\.data\.tweets_\d\d\d\d_\d\d\s=/, '').trim()
    // parse as JSON
    try {
        let json = JSON.parse(content)
        // append to tweets array
        tweets = tweets.concat(json)
    }
    catch(e) {
        console.log(content, e)
    }
    next()
}

function handleEndOfFiles(err, files) {
    if (err) throw err
    console.log(`Finished reading ${files.length} files`)
    filterRetweets()
}

function filterRetweets() {
    console.log('Total tweets:', tweets.length)
    let retweets = tweets.filter(tweet => {
        return (
            // is a retweet
            typeof tweet.retweeted_status !== 'undefined'
            &&
            // is older than RETWEETS_MAX_AGE
            new Moment().diff(new Moment(new Date(tweet.created_at)), 'days') >= process.env.RETWEETS_MAX_AGE
        )
    })
    console.log('Total retweets:', retweets.length)
    if ('true' === process.env.RETWEETS_DELETE) {
        if (retweets.length > 0) {
            deleteRetweets(retweets)
        }
    }
    else {
        console.log(`To delete retweets, change the value of RETWEETS_DELETE to true in your .env file`)
    }
}

function deleteRetweets(retweets) {
    console.log('Deleting retweets')
    Promise.mapSeries(retweets, deleteRetweet)
}

function deleteRetweet(retweet) {
    let id = retweet.id_str
    return Twitter.request(`statuses/destroy/${id}`, 'POST', { id })
        .then(deletedRetweet => { console.log(`Deleted retweet with ID: ${id}`) })
        .catch(error => { console.error(`Could not delete retweet with ID ${id} because ${error}`) })
}

// kick it off
dir.readFiles('./tweets', { match: /.js$/ }, readTweets, handleEndOfFiles)
