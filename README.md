# jsed: JavaScript Stream Editor

    npm install -g jsed


## Usage

Suppose you're dealing with a [stream of tweets](https://chbrown.github.io/docs/twitter).

**tweetlang.jsed** somewhere on your PATH:

    #!/usr/bin/env jsed -f
    function flatten(s) { return s.replace(/\s+/g, " "); }

    module.exports = function(tweet) {
      if (!tweet.delete) {
        return {
          user: tweet.user.screen_name,
          user_lang: tweet.user.lang,
          tweet: flatten(tweet.text),
          tweet_lang: tweet.lang,
        };
      }
    };

Then call:

    twilight stream | tweetlang.jsed | jq .

`twilight stream` emits a stream from the Twitter Streaming API spritzer. `jq` pretty prints JSON.

Or if you don't want to have to `chmod +x tweetlang.jsed`, call:

    twilight stream | jsed ~/Desktop/tweetlang.jsed | jq .


## License

Copyright 2014 Christopher Brown. [MIT Licensed](http://opensource.org/licenses/MIT).
