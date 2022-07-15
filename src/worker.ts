import registerPromiseWorker from 'promise-worker/register';

import { DatabaseType, Entry, loadEntries } from './types';

registerPromiseWorker(
  (entryArray: Entry[]): Entry[] => {
    return entryArray;
    //return loadEntries(msg.ctagsFileLocation);
  },
);
