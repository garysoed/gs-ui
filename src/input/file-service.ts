import { Arrays, Maps } from 'external/gs_tools/src/collection';
import { DomEvent, ListenableDom } from 'external/gs_tools/src/event';
import { bind } from 'external/gs_tools/src/inject';
import { SimpleIdGenerator } from 'external/gs_tools/src/random';


@bind('gs.input.FileService')
export class FileService {
  private readonly bundles_: Map<string, File[]>;
  private readonly idGenerator_: SimpleIdGenerator;

  constructor() {
    this.bundles_ = new Map<string, File[]>();
    this.idGenerator_ = new SimpleIdGenerator();
  }

  private createFileReader_(): FileReader {
    return new FileReader();
  }

  /**
   * Processes the given file.
   *
   * @param file The file object to process.
   * @return Promise that will be resolved with the file content when done.
   */
  protected processFile_(file: File): Promise<string> {
    return new Promise<string[]>((
        resolve: (data: string[]) => void,
        reject: (error: any) => void) => {
      const fileReader = this.createFileReader_();
      const listenableFileReader = ListenableDom.of<FileReader>(fileReader);
      listenableFileReader.on(
          DomEvent.LOADEND,
          () => {
            listenableFileReader.dispose();
            if (fileReader.readyState === 2) {
              resolve(fileReader.result);
            } else {
              reject(new Error(`Error loading file ${file.name}: ${fileReader.readyState}`));
            }
          },
          this);
      fileReader.readAsText(file);
    });
  }

  /**
   * @param files The bundle of files to add.
   * @return Object containing the bundle ID and a function to delete the bundle.
   */
  addBundle(files: File[]): {id: string, deleteFn: () => void} {
    const id = this.idGenerator_.generate(Maps.of(this.bundles_).keys().asArray());
    this.bundles_.set(id, files);
    return {
      deleteFn: function(): void {
        this.bundles_.delete(id);
      }.bind(this),
      id: id,
    };
  }

  /**
   * @param bundleId The bundle ID to return.
   * @return The bundle corresponding to the bundle ID, or null if it does not exist.
   */
  getBundle(bundleId: string): File[] | null {
    return this.bundles_.get(bundleId) || null;
  }

  /**
   * @param bundleId ID of the bundle to process.
   * @return Promise that will be resolved with a map of File to its content, or null if the
   *     bundle ID does not exist.
   */
  async processBundle(bundleId: string): Promise<Map<File, string> | null> {
    const files = this.getBundle(bundleId);
    if (files === null) {
      return Promise.resolve(null);
    }

    const promises = Arrays
        .of(files)
        .map((file: File) => {
          return Promise.all(<[File, Promise<string>]> [
            file,
            this.processFile_(file),
          ]);
        })
        .asArray();
    const entries = await Promise.all(promises);
    return new Map(entries);
  }
}
