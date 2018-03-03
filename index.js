var path = require('path');
var streaming = require('streaming');
var optimist = require('optimist');

function jsed(input, output, transformFunction) {
  // 1. parser
  var parser = new streaming.json.Parser().on('error', function(err) {
    console.error('Failed to parse JSON input: %s', err.stack);
  });

  // 2. transform
  var mapper = new streaming.Mapper(transformFunction).on('error', function(err) {
    console.error('Failed to execute mapper function: %s', err);
  });

  // 3. stringifier
  var stringifier = new streaming.json.Stringifier().on('error', function(err) {
    console.error('Failed to stringify output to JSON: %s', err);
  });

  input.pipe(parser).pipe(mapper).pipe(stringifier).pipe(output);
}
exports.jsed = jsed;

function main() {
  var argvparser = optimist
  .usage([
    'Usage: jsed -f uniq.js <input.json >output.json',
    '',
    'JavaScript stream editor.',
    '',
    'Transform newline-separated JSON objects with JavaScript.',
    '',
    'The given file should be a Node.js-compatible commonjs module that',
    'exports a single function. That function should take a single object',
    'and return a single object.',
    '* return `undefined` to discard the current input',
    "* all other returned values will be JSON.stringify'd",
  ].join('\n'))
  .describe({
    file: 'JavaScript file to load mapper function from',
    help: 'print this help message',
    verbose: 'print more output',
    version: 'print jsed version and exit',
  })
  .boolean([
    'help',
    'verbose',
    'version',
  ])
  .alias({
    file: 'f',
    help: 'h',
    verbose: 'v',
  });

  var argv = argvparser.argv;

  if (argv.help) {
    argvparser.showHelp();
  }
  else if (argv.version) {
    console.log(require('./package').version);
  }
  else if (process.stdin.isTTY) {
    throw new Error('JSON must be piped in on STDIN');
  }
  else {
    var {file} = argvparser.demand(['file']).argv;

    process.stdin.on('error', function(err) {
      console.error('STDIN error: %s', err);
    });

    var func_filepath = file;
    if (func_filepath[0] !== '/') {
      func_filepath = path.join(process.cwd(), func_filepath);
    }
    var func = require(func_filepath);

    jsed(process.stdin, process.stdout, func);
  }
}
exports.main = main;
