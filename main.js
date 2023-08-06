const {Plugin, Notice} = require("obsidian")
const fs = require('fs');
const path = require('path');

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);


// -------------------------------------------------- //


class NoteConfig {
  constructor(note_name_template, template_name, base_path, frequency, subfolder = null) {
      this.note_name_template = note_name_template;
      this.template_name = template_name;
      this.base_path = base_path;
      this.frequency = frequency;
      this.subfolder = subfolder;
  }
}

function formatDate(date, format) {
  // Helper function to pad single digit numbers with a leading zero
  const padZero = (number) => number < 10 ? '0' + number : number.toString();

  const replacements = {
      '%d': padZero(date.getDate()),
      '%m': padZero(date.getMonth() + 1),
      '%Y': date.getFullYear(),
      '%y': date.getFullYear().toString().slice(-2),
      '%H': padZero(date.getHours()),
      '%M': padZero(date.getMinutes()),
      '%S': padZero(date.getSeconds())
  };

  let formattedDate = format;
  for (const [specifier, replacement] of Object.entries(replacements)) {
      formattedDate = formattedDate.replace(specifier, replacement);
  }

  return formattedDate;
}

function generateNoteName(noteNameTemplate, targetDate) {
  const weekDates = calculateWeekDates(targetDate);
  const monthDates = calculateMonthDates(targetDate);
  const yearDates = calculateYearDates(targetDate);

  // Mapping variables to their corresponding values
  const variables = {
      week_start_date: weekDates.start_date,
      week_end_date: weekDates.end_date,
      month_start_date: monthDates.start_date,
      month_end_date: monthDates.end_date,
      year_start_date: yearDates.start_date,
      year_end_date: yearDates.end_date,
      current_date: targetDate
  };

  let finalName = noteNameTemplate;

  // Replacing variables in the template based on the provided format
  for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`{${key}:(.*?)}`, 'g');
      let match;
      while ((match = pattern.exec(finalName)) !== null) {
          const dateFormat = match[1];
          const formattedDate = formatDate(value, dateFormat);
          finalName = finalName.replace(`{${key}:${dateFormat}}`, formattedDate);
      }
  }

  return finalName;
}

function calculateWeekDates(currentDate) {
  let start_date = new Date(currentDate);
  start_date.setDate(start_date.getDate() - start_date.getDay());
  let end_date = new Date(start_date);
  end_date.setDate(end_date.getDate() + 6);
  return { start_date, end_date };
}

function calculateMonthDates(currentDate) {
  let start_date = new Date(currentDate);
  start_date.setDate(1);
  let end_date = new Date(start_date.getFullYear(), start_date.getMonth() + 1, 0);
  return { start_date, end_date };
}

function calculateYearDates(currentDate) {
  let date = new Date(currentDate);
  let year = date.getFullYear();
  let start_date = new Date(year, 0, 1);
  let end_date = new Date(year, 11, 31);
  return { start_date, end_date };
}


// -------------- main.ts -------------- //

var main_exports = {};
__export(main_exports, {
  default: () => AutomaticNotes
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");
var DEFAULT_SETTINGS = {
  templateFolderPath: "templates",
  noteConfigs: [],
};

class SampleSettingTab extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
      super(app, plugin);
      this.plugin = plugin;
  }

  unload() {
    super.unload();
    this.plugin.saveSettings();
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    // Plugin Description
    containerEl.createEl('h1', { text: 'Auto Note Creation Plugin' });
    containerEl.createEl('p', { text: "This plugin helps automate the creation of notes based on your predefined configurations. Define your note name templates, associate them with templates, and let the plugin handle note creation for you." });
    
    // How to Use
    containerEl.createEl('h3', { text: 'How to Use:' });
    const usageList = containerEl.createEl('ol');
    usageList.createEl('li', { text: 'Define a Note Configuration by setting its parameters.' });
    usageList.createEl('li', { text: 'Use expressions like {current_date:%m.%Y} in your note names and paths to dynamically insert dates.' });
    usageList.createEl('li', { text: 'Date formatting can be done using specifiers like %d (day), %m (month), and %Y (year).' });

    // Available Variables
    containerEl.createEl('h3', { text: 'Available Variables:' });
    const variablesList = containerEl.createEl('ul');
    variablesList.createEl('li', { text: 'week_start_date: The start date of the week.' });
    variablesList.createEl('li', { text: 'week_end_date: The end date of the week.' });
    variablesList.createEl('li', { text: 'month_start_date: The start date of the month.' });
    variablesList.createEl('li', { text: 'month_end_date: The end date of the month.' });
    variablesList.createEl('li', { text: 'year_start_date: The start date of the year.' });
    variablesList.createEl('li', { text: 'year_end_date: The end date of the year.' });
    variablesList.createEl('li', { text: 'current_date: The date for which the note is being generated.' });

    // Examples
    containerEl.createEl('h4', { text: 'Examples:' });
    const examplesList = containerEl.createEl('ul');
    examplesList.createEl('li', { text: '{current_date:%Y} will be replaced by the current year (e.g., "2023").' });
    examplesList.createEl('li', { text: '{current_date:%m.%Y} will be replaced by the current month and year (e.g., "08.2023").' });
    
    // Setting for the template folder path
    containerEl.createEl('h3', { text: 'Template Folder Settings:' });
    new import_obsidian.Setting(containerEl)
      .setName("Template Folder Path")
      .setDesc("Relative path to the folder within your Vault containing your templates")
      .addText(text => text
          .setPlaceholder("Enter relative path to your template folder...")
          .setValue(this.plugin.settings.templateFolderPath || "")
          .onChange(async (value) => {
              this.plugin.settings.templateFolderPath = value;
              await this.plugin.saveSettings();
          })
    );

    // Setting to toggle auto creation of missing notes on load
    new import_obsidian.Setting(containerEl)
    .setName("Automatically create missing notes on load")
    .setDesc("If enabled, the plugin will check for missing notes based on your configurations and create them automatically when Obsidian loads.")
    .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoCreateOnLoad || false)
        .onChange(async (value) => {
            this.plugin.settings.autoCreateOnLoad = value;
            await this.plugin.saveSettings();
        })
    );

    // Header for Note Configurations
    containerEl.createEl('h3', { text: 'Note Configurations:' });

    const table = containerEl.createEl('table', { style: 'width: 100%; border-collapse: collapse; margin-bottom: 10px;' });

    // Table headers
    if (this.plugin.settings.noteConfigs.length > 0) {
      const thead = table.createEl('thead');
      const headerRow = thead.createEl('tr');
      ['Note Name', 'Frequency', 'Template Name', 'Destination Path', 'Delete'].forEach(header => {
          headerRow.createEl('th', { text: header, style: 'padding: 5px; border-bottom: 1px solid gray;' });
      });
    }

    // Table body
    const tbody = table.createEl('tbody');
    this.plugin.settings.noteConfigs.forEach((config, index) => {
    const row = tbody.createEl('tr');

    // Note Name Template Input
    const noteNameCell = row.createEl('td');
    const noteNameInput = noteNameCell.createEl('input', { type: 'text', value: config.note_name_template, style: 'width: 100%;' });
    noteNameInput.placeholder = "Enter Note Name...";
    noteNameInput.addEventListener('input', (e) => {
        config.note_name_template = e.target.value;
    });

      // Frequency Dropdown
      const frequencyCell = row.createEl('td');
      const frequencyDropdown = frequencyCell.createEl('select', { style: 'width: 100%;' });
      ['daily', 'weekly', 'monthly', 'yearly'].forEach(freq => {
          const option = frequencyDropdown.createEl('option', { value: freq, text: freq });
          if (freq === config.frequency) {
              option.selected = true;
          }
      });
      frequencyDropdown.addEventListener('change', (e) => {
          config.frequency = e.target.value;
      });

      // Template Name Input
      const templateNameCell = row.createEl('td');
      const templateNameInput = templateNameCell.createEl('input', { type: 'text', value: config.template_name, style: 'width: 100%;' });
      templateNameInput.placeholder = "Enter Template Name...";
      templateNameInput.addEventListener('input', (e) => {
          config.template_name = e.target.value;
      });

      // Base Path Input
      const basePathCell = row.createEl('td');
      const basePathInput = basePathCell.createEl('input', { type: 'text', value: config.base_path, style: 'width: 100%;' });
      basePathInput.placeholder = "Enter Destination Path...";
      basePathInput.addEventListener('input', (e) => {
          config.base_path = e.target.value;
      });

      // Delete Button
      const deleteButtonCell = row.createEl('td');
      const deleteButton = deleteButtonCell.createEl('button', { text: 'Delete', cls: 'delete-config-button' });
      deleteButton.addEventListener('click', () => {
          this.plugin.settings.noteConfigs.splice(index, 1);
          this.display();
      });
      });

    const addButtonContainer = containerEl.createEl('div', { style: 'margin-bottom: 10px;' });
    const addButton = addButtonContainer.createEl('button', { text: 'Add Configuration' });
    addButton.addEventListener('click', () => {
        this.plugin.settings.noteConfigs.push({
            note_name_template: '',
            template_name: '',
            base_path: '',
            frequency: 'daily'
        });
        this.display();
    });

    // Container at the bottom for the save button
    const bottomContainer = containerEl.createEl('div', { style: 'display: flex; justify-content: flex-end; margin-top: 20px;' });

    // Button to save the settings on the far right
    const saveButton = bottomContainer.createEl('button', { text: 'Save Settings' });
    saveButton.addEventListener('click', () => {
        this.plugin.saveSettings();
        new Notice("Settings saved successfully!");
    });
}
}


var AutomaticNotes = class extends import_obsidian.Plugin {

  async createNoteWithConfig(config, targetDate) {
    // Process the base path with expressions
    let basePath = generateNoteName(config.base_path, targetDate);
    const fullBasePath = path.join(this.app.vault.adapter.basePath, basePath);

    let noteFileName = `${generateNoteName(config.note_name_template, targetDate)}.md`;
    console.log(`noteFileName: ${noteFileName}`);
    let noteFilePath = `${basePath}/${noteFileName}`;
    console.log(`noteFilePath: ${noteFilePath}`);
    let templatePath = `templates/${config.template_name}.md`;
    console.log(`templatePath: ${templatePath}`);

    if (!fs.existsSync(fullBasePath)) {
        fs.mkdirSync(fullBasePath, { recursive: true });
    }
    const file = this.app.vault.getAbstractFileByPath(noteFilePath);
    console.log(`file: ${file}`);
    if (!file) {
        try {
            // Construct full paths
            const fullTemplatePath = path.join(this.app.vault.adapter.basePath, templatePath);
            const fullNoteFilePath = path.join(this.app.vault.adapter.basePath, noteFilePath);
            
            // Copy file
            fs.copyFileSync(fullTemplatePath, fullNoteFilePath);
            
            new Notice(`${config.frequency.charAt(0).toUpperCase() + config.frequency.slice(1)} note created: ${noteFileName}`);
        } catch (error) {
            console.error("Error in copying template to note:", error);
            new Notice("Error occurred while copying template to note. Check the console for details.");
        }
    }
  }


  async onload() {

    // Load settings
    await this.loadSettings();

    // If autoCreateOnLoad is enabled, check for missing notes and create them
    if (this.settings.autoCreateOnLoad) {
      this.createNoteWithConfig();
    }

    // Add command for manually invoking `add missing notes`
    this.addCommand({
      id: "add-missing-notes",
      name: "Add missing notes",
      callback: async () => {
          try {
              new Notice("Adding missing notes started");
              const current_date = new Date();
      
              // Loop through the saved note configurations
              for (let config of this.settings.noteConfigs) {
                  await this.createNoteWithConfig(config, current_date);
              }
      
              new Notice("Adding missing notes completed");
          } catch (error) {
              console.error("Error when adding missing notes:", error);
              new Notice("Error occurred when adding missing notes. Check the console for details.");
          }
      }
    });

    this.addSettingTab(new SampleSettingTab(this.app, this));
    this.registerDomEvent(document, "click", (evt) => {
      console.log("click", evt);
    });
    this.registerInterval(window.setInterval(() => console.log("setInterval"), 5 * 60 * 1e3));
  }
//  ------------------ onload()
  onunload() {
    new Notice('Unloading AutomaticNotes!');
  }
//  ------------------ onunload()
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
//  ------------------ loadSettings()
  async saveSettings() {
    await this.saveData(this.settings);
  }
//  ------------------ saveSettings()
};