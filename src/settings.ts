import {
  AbstractTextComponent,
  App,
  DropdownComponent,
  FileSystemAdapter,
  PluginSettingTab,
  Setting,
} from 'obsidian';

import CtagsPlugin from './main';
import { IIndexable, DatabaseType, TEMPLATE_VARIABLES } from './types';

const CITATION_DATABASE_FORMAT_LABELS: Record<DatabaseType, string> = {
  'csl-json': 'CSL-JSON',
  biblatex: 'BibLaTeX',
};

export class CtagsPluginSettings {
  public citationExportPath: string;
}

export class CtagsSettingTab extends PluginSettingTab {
  private plugin: CtagsPlugin;

  citationPathLoadingEl: HTMLElement;
  citationPathErrorEl: HTMLElement;
  citationPathSuccessEl: HTMLElement;

  constructor(app: App, plugin: CtagsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  open(): void {
    super.open();
    this.checkCitationExportPath(
      this.plugin.settings.citationExportPath,
    ).then(() => this.showCitationExportPathSuccess());
  }

  addValueChangeCallback<T extends HTMLTextAreaElement | HTMLInputElement>(
    component: AbstractTextComponent<T> | DropdownComponent,
    settingsKey: string,
    cb?: (value: string) => void,
  ): void {
    component.onChange(async (value) => {
      (this.plugin.settings as IIndexable)[settingsKey] = value;
      this.plugin.saveSettings().then(() => {
        if (cb) {
          cb(value);
        }
      });
    });
  }

  buildValueInput<T extends HTMLTextAreaElement | HTMLInputElement>(
    component: AbstractTextComponent<T> | DropdownComponent,
    settingsKey: string,
    cb?: (value: string) => void,
  ): void {
    component.setValue((this.plugin.settings as IIndexable)[settingsKey]);
    this.addValueChangeCallback(component, settingsKey, cb);
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();
    containerEl.setAttr('id', 'zoteroSettingTab');

    containerEl.createEl('h2', { text: 'Citation plugin settings' });

    // NB: we force reload of the library on path change.
    new Setting(containerEl)
      .setName('Citation database path')
      .setDesc(
        'Path to citation library exported by your reference manager. ' +
          'Can be an absolute path or a path relative to the current vault root folder. ' +
          'Citations will be automatically reloaded whenever this file updates.',
      )
      .addText((input) =>
        this.buildValueInput(
          input.setPlaceholder('/path/to/export.json'),
          'citationExportPath',
          (value) => {
            this.checkCitationExportPath(value).then(
              (success) =>
                success &&
                this.plugin
                  .loadLibrary()
                  .then(() => this.showCitationExportPathSuccess()),
            );
          },
        ),
      );

    this.citationPathLoadingEl = containerEl.createEl('p', {
      cls: 'zoteroSettingCitationPathLoading d-none',
      text: 'Loading citation database...',
    });
    this.citationPathErrorEl = containerEl.createEl('p', {
      cls: 'zoteroSettingCitationPathError d-none',
      text:
        'The citation export file cannot be found. Please check the path above.',
    });
    this.citationPathSuccessEl = containerEl.createEl('p', {
      cls: 'zoteroSettingCitationPathSuccess d-none',
      text: 'Loaded library with {{n}} references.',
    });
  }

  /**
   * Returns true iff the path exists; displays error as a side-effect
   */
  async checkCitationExportPath(filePath: string): Promise<boolean> {
    this.citationPathLoadingEl.addClass('d-none');

    try {
      await FileSystemAdapter.readLocalFile(
        this.plugin.resolveLibraryPath(filePath),
      );
      this.citationPathErrorEl.addClass('d-none');
    } catch (e) {
      this.citationPathSuccessEl.addClass('d-none');
      this.citationPathErrorEl.removeClass('d-none');
      return false;
    }

    return true;
  }

  showCitationExportPathSuccess(): void {
    if (!this.plugin.library) return;

    this.citationPathSuccessEl.setText(
      `Loaded library with ${this.plugin.library.size} references.`,
    );
    this.citationPathSuccessEl.removeClass('d-none');
  }
}
