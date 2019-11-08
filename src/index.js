import fs from 'fs';
import rimraf from 'rimraf';
import sleep from 'sleep-promise';
import search from './search';

rimraf.sync('output');

try {
  fs.mkdirSync('output');
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

const input = fs.readFileSync('input.txt').toString('utf-8');
const inputLines = input.split(/\r?\n/);

const promises = inputLines.map(async (line) => search(line));

Promise.all(promises).then(() => {
  console.log('Done!');
}).catch((error) => {
  console.log(`Got error: ${JSON.stringify(error)}`);
});
