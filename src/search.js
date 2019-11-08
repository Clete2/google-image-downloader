import util from 'util';
import gisUnpromisified from 'g-i-s';
import fs from 'fs';
import fetch from 'node-fetch';
import mime from 'mime';
import to from 'await-to-js';
import sleep from 'sleep-promise';

export default async (searchQuery) => {
  const gis = util.promisify(gisUnpromisified);

  let searchResults = [];
  let retries = 0;

  console.info(`'${searchQuery}': START`);

  while (retries < 5 && searchResults.length === 0) {
    // eslint-disable-next-line no-await-in-loop
    searchResults = await gis(searchQuery);
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    retries += 1;
    console.info(`'${searchQuery}': Query attempt ${retries}`);
  }

  console.info(`'${searchQuery}': Result length ${searchResults.length}`);

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
      console.log(`'${searchQuery}': Failed to get ${url} with error ${JSON.stringify(error)}`);
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
    console.info(`'${searchQuery}': SAVED #${imagesGrabbed}`);
  }

  console.log(`'${searchQuery}': DONE. Saved ${imagesGrabbed} file(s).`);
};
