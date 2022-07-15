
// Trick: allow string indexing onto object properties
export interface IIndexable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const databaseTypes = ['csl-json', 'biblatex'] as const;
export type DatabaseType = typeof databaseTypes[number];

export const TEMPLATE_VARIABLES = {
  citekey: 'Unique citekey',
  abstract: '',
  authorString: 'Comma-separated list of author names',
  containerTitle:
    'Title of the container holding the reference (e.g. book title for a book chapter, or the journal title for a journal article)',
  DOI: '',
  eprint: '',
  eprinttype: '',
  eventPlace: 'Location of event',
  note: '',
  page: 'Page or page range',
  publisher: '',
  publisherPlace: 'Location of publisher',
  title: '',
  URL: '',
  year: 'Publication year',
  zoteroSelectURI: 'URI to open the reference in Zotero',
};

export class Library {
  //constructor() {}
  //constructor(public entries: { [citekey: string]: Entry }) {}
  constructor(public entries: Entry[] ) {}

  get size(): number {
    return Object.keys(this.entries).length;
  }
}

/**
 * Load reference entries from the given raw database data.
 *
 * Returns a list of `EntryData`, which should be wrapped with the relevant
 * adapter and used to instantiate a `Library`.
 */
export function loadEntries(
  ctagsFileLocation: string,
): Entry[] {
  let libraryArray: Entry[];

  const firstTag = { name: "firstTag", file: "firstFile"};
  const secondTag = { name: "secondTag", file: "secondFile"};
  const thirdTag = { name: "thirdTag", file: "thirdFile"};
  
  libraryArray = [firstTag, secondTag, thirdTag]
  // TODO ctags do this but in typescript
  //for line in open('/Users/zach.gibbs/ctagsFile'):
   // libraryArray.append(line);
  return libraryArray;
}

export interface Author {
  given?: string;
  family?: string;
}

/**
 * An `Entry` represents a single reference in a reference database.
 * Each entry has a unique identifier, known in most reference managers as its
 * "citekey."
 */
export abstract class Entry {
  /**
   * Unique identifier for the entry (also the citekey).
   */
  public abstract name: string;

  public abstract file: string;

  public abstract pattern?: string;


/**  toJSON(): Record<string, unknown> {
    const jsonObj: Record<string, unknown> = Object.assign({}, this);

    // add getter values
    const proto = Object.getPrototypeOf(this);
    Object.entries(Object.getOwnPropertyDescriptors(proto))
      .filter(([, descriptor]) => typeof descriptor.get == 'function')
      .forEach(([key, descriptor]) => {
        if (descriptor && key[0] !== '_') {
          try {
            const val = (this as IIndexable)[key];
            jsonObj[key] = val;
          } catch (error) {
            return;
          }
        }
      });

    return jsonObj;
  }
*/
}

export type EntryData = EntryDataCtags;

export interface EntryDataCtags {
  name: string;
  file: string;
  pattern?: string;
}

