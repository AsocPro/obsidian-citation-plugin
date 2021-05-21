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

export class CtagsPluginSettings {
  public ctagsFilePath: string;
}

export class CtagsSettingTab extends PluginSettingTab {
  private plugin: CtagsPlugin;

  ctagsPathLoadingEl: HTMLElement;
  ctagsPathErrorEl: HTMLElement;
  ctagsPathSuccessEl: HTMLElement;

  constructor(app: App, plugin: CtagsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  open(): void {
    super.open();
    this.checkCtagsFilePath(
      this.plugin.settings.ctagsFilePath,
    ).then(() => this.showCtagsFilePathSuccess());
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
    containerEl.setAttr('id', 'ctagsSettingTab');

    containerEl.createEl('h2', { text: 'Ctags plugin settings' });

    // NB: we force reload of the library on path change.
    new Setting(containerEl)
      .setName('Ctags database path')
      .setDesc(
        'Path to ctags file. ' +
          'Can be an absolute path or a path relative to the current vault root folder. ' +
          'File paths inside the ctags file should be relative to the tags file itself.' +
          'Symbols will be automatically reloaded whenever this file updates.',
      )
      .addText((input) =>
        this.buildValueInput(
          input.setPlaceholder('/path/to/tags'),
          'ctagsFilePath',
          (value) => {
            this.checkCtagsFilePath(value).then(
              (success) =>
                success &&
                this.plugin
                  .loadLibrary()
                  .then(() => this.showCtagsFilePathSuccess()),
            );
          },
        ),
      );

    this.ctagsPathLoadingEl = containerEl.createEl('p', {
      cls: 'settingCtagsFilePathLoading d-none',
      text: 'Loading tags file...',
    });
    this.ctagsPathErrorEl = containerEl.createEl('p', {
      cls: 'settingCtagsFilePathError d-none',
      text:
        'The tags file cannot be found. Please check the path above.',
    });
    this.ctagsPathSuccessEl = containerEl.createEl('p', {
      cls: 'settingCtagsFilePathSuccess d-none',
      text: 'Loaded tags file with {{n}} symbols.',
    });
  }

  /**
   * Returns true iff the path exists; displays error as a side-effect
   */
  async checkCtagsFilePath(filePath: string): Promise<boolean> {
    this.ctagsPathLoadingEl.addClass('d-none');

    try {
      await FileSystemAdapter.readLocalFile(
        this.plugin.resolveLibraryPath(filePath),
      );
      this.ctagsPathErrorEl.addClass('d-none');
    } catch (e) {
      this.ctagsPathSuccessEl.addClass('d-none');
      this.ctagsPathErrorEl.removeClass('d-none');
      return false;
    }

    return true;
  }

  showCtagsFilePathSuccess(): void {
    if (!this.plugin.library) return;

    this.ctagsPathSuccessEl.setText(
      `Loaded library with ${this.plugin.library.size} references.`,
    );
    this.ctagsPathSuccessEl.removeClass('d-none');
  }
}
