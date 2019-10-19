import util from 'util';
import gisUnpromisified from 'g-i-s';
import fs from 'fs';
import fetch from 'node-fetch';
import mime from 'mime';
import to from 'await-to-js';

export default async (searchQuery) => {
  const gis = util.promisify(gisUnpromisified);

  const searchResults = await gis(searchQuery);

  let imagesGrabbed = 0;
  let i = 0;

  while (imagesGrabbed < 5 && i < searchResults.length) {
    const {
      url,
    } = searchResults[i];

    i += 1;

    // eslint-disable-next-line no-await-in-loop
    const [error, response] = await to(fetch(url));

    if (error) {
      console.log(`Query '${searchQuery}' failed to get ${url} with error ${JSON.stringify(error)}`);
      // eslint-disable-next-line no-continue
      continue;
    }

    const extension = mime.getExtension(response.headers.get('content-type')) || 'jpeg';

    if (extension === 'html') {
      // eslint-disable-next-line no-continue
      continue;
    }

    const file = fs.createWriteStream(`output/${searchQuery} - ${imagesGrabbed + 1}.${extension}`);
    response.body.pipe(file);

    imagesGrabbed += 1;
  }
};
