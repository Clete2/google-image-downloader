import util from 'util';
import gisUnpromisified from 'g-i-s';
import fs from 'fs';
import fetch from 'node-fetch';
import mime from 'mime';
import to from 'await-to-js';

export default async (searchQuery) => {
  const gis = util.promisify(gisUnpromisified);

  const searchResults = await gis(searchQuery);

  const imagePromises = searchResults.slice(0, 5).map(async (searchResult, i) => {
    const {
      url,
    } = searchResult;
    const [error, response] = await to(fetch(url));

    if (error) {
      console.log(`Query '${searchQuery}' failed to get ${url} with error ${JSON.stringify(error)}`);
      return;
    }

    const extension = mime.getExtension(response.headers.get('content-type')) || 'jpeg';
    const file = fs.createWriteStream(`output/${searchQuery} - ${i + 1}.${extension}`);
    response.body.pipe(file);
  });

  return Promise.all(imagePromises);
};
