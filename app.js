require('dotenv').config()
const Twitter = require('./lib/twitter')
const Moment = require('moment')
const dir = require('node-dir')
const fs = require('fs')
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

function getPreviouslyDeletedRetweets() {
    let contents = fs.readFileSync('./deleted-retweet-ids.txt', 'utf8')
    let deletedRetweets = contents.split('\n')
    return deletedRetweets
}

function filterRetweets() {
    let deletedRetweets = getPreviouslyDeletedRetweets()
    console.log(`Total tweets for user ${process.env.TWITTER_USERNAME}:`, tweets.length)

    let retweets = tweets.filter(tweet => {
        return typeof tweet.retweeted_status !== 'undefined'
    })
    console.log(`Total retweets:`, retweets.length)

    let oldRetweets = retweets.filter(tweet => {
        return new Moment().diff(new Moment(new Date(tweet.created_at)), 'days') >= process.env.RETWEETS_MAX_DAYS
    })
    console.log(`Retweets older than ${process.env.RETWEETS_MAX_DAYS} days:`, oldRetweets.length)

    let undeletedRetweets = oldRetweets.filter(tweet => {
        // filter out IDs that are in the list of previously deleted tweets
        return deletedRetweets.indexOf(tweet.id_str) < 0
    })
    console.log(`Undeleted old retweets:`, undeletedRetweets.length)

    if ('true' === process.env.RETWEETS_DELETE) {
        if (undeletedRetweets.length > 0) {
            deleteRetweets(undeletedRetweets)
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
        .then(deletedRetweet => {
            console.log(`Deleted retweet with ID: ${id}`)
            // write to file so we can avoid making requests for already deleted retweets
            try {
                fs.appendFileSync('./deleted-retweet-ids.txt', `${id}\n`, 'utf8')
            } catch (err) {
                console.log('Problem writing to file:', err)
            }
        })
        .catch(error => { console.error(`Could not delete retweet with ID ${id} because ${error}`) })
}

// kick it off
dir.readFiles('./tweets', { match: /.js$/ }, readTweets, handleEndOfFiles)
