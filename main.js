const { Plugin, Notice, Modal } = require("obsidian");
const fs = require("fs");
const path = require("path");

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var main_exports = {};
__export(main_exports, {
  default: () => AutomaticNotes,
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// Default settings for the plugin
const DEFAULT_SETTINGS = {
  templateFolderPath: "templates",
  noteConfigs: [],
};

var AutomaticNotes = class extends import_obsidian.Plugin {
  // Load the plugin settings from storage or use default values
  async loadSettings() {
    this.settings = await this.loadDataSafe(DEFAULT_SETTINGS);
  }

  // Helper function to load data with error handling
  async loadDataSafe(defaultSettings) {
    try {
      return Object.assign({}, defaultSettings, await this.loadData());
    } catch (error) {
      this.handleError("loading plugin settings", error);
      return defaultSettings;
    }
  }

  // Save the current plugin settings to storage
  async saveSettings() {
    try {
      await this.saveData(this.settings);
      new Notice("Settings saved successfully!");
    } catch (error) {
      this.handleError("saving plugin settings", error);
    }
  }

  // General error handler
  handleError(action, error) {
    console.error(`Error during ${action}:`, error);
    new Notice(
      `Error occurred while ${action}. Check the console for details.`
    );
  }

  // This method handles the initial loading of the plugin
  async onload() {
    await this.initialLoad();
    this.registerCommands();
  }

  async initialLoad() {
    try {
      await this.loadSettings();
      if (this.settings.autoCreateOnLoad) {
        const current_date = new Date();
        for (let config of this.settings.noteConfigs) {
          await this.createNoteWithConfig(config, current_date);
        }
      }
    } catch (error) {
      this.handleError("the initial loading process", error);
    }
  }

  registerCommands() {
    try {
      this.addCommand({
        id: "add-missing-notes",
        name: "Add missing notes",
        callback: this.addMissingNotes.bind(this),
      });

      this.addSettingTab(new AutoNoteSettingTab(this.app, this));
      this.registerClickEvent();
      this.registerTimeInterval();
    } catch (error) {
      this.handleError("command registration or event handling", error);
    }
  }

  async addMissingNotes() {
    try {
      const current_date = new Date();
      for (let config of this.settings.noteConfigs) {
        await this.createNoteWithConfig(config, current_date);
      }
    } catch (error) {
      this.handleError("adding missing notes", error);
    }
  }

  registerClickEvent() {
    this.registerDomEvent(document, "click", (evt) => {
      console.log("click", evt);
    });
  }

  registerTimeInterval() {
    this.registerInterval(
      window.setInterval(() => console.log("setInterval"), 5 * 60 * 1e3)
    );
  }

  async createNoteWithConfig(config, targetDate) {
    try {
      let basePath = generateNoteName(config.base_path, targetDate);
      const fullBasePath = path.join(this.app.vault.adapter.basePath, basePath);

      let noteFileName = `${generateNoteName(
        config.note_name_template,
        targetDate
      )}.md`;
      let noteFilePath = `${basePath}/${noteFileName}`;
      let templatePath = `templates/${config.template_name}.md`;

      if (!fs.existsSync(fullBasePath)) {
        fs.mkdirSync(fullBasePath, { recursive: true });
      }
      const file = this.app.vault.getAbstractFileByPath(noteFilePath);
      if (!file) {
        this.copyTemplateToNoteFile(templatePath, noteFilePath);
        new Notice(
          `${
            config.frequency.charAt(0).toUpperCase() + config.frequency.slice(1)
          } note created: ${noteFileName}`
        );
      }
    } catch (error) {
      this.handleError("creating a note with config", error);
    }
  }

  copyTemplateToNoteFile(templatePath, noteFilePath) {
    const fullTemplatePath = path.join(
      this.app.vault.adapter.basePath,
      templatePath
    );
    const fullNoteFilePath = path.join(
      this.app.vault.adapter.basePath,
      noteFilePath
    );
    fs.copyFileSync(fullTemplatePath, fullNoteFilePath);
  }
};

class AutoNoteSettingTab extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  // Primary methods
  display() {
    const { containerEl } = this;
    containerEl.empty();

    this.createPluginDescription(containerEl);
    this.createUsageInstructions(containerEl);
    this.createSpecifierInstructions(containerEl);
    this.createAvailableVariables(containerEl);
    this.createSpecifierExamples(containerEl);
    this.createTemplateFolderSetting(containerEl);
    this.createAutoCreateSetting(containerEl);
    this.createNoteConfigTable(containerEl);
    this.createNewConfigurationButton(containerEl);
    this.createSaveSettingsButton(containerEl);
  }

  unload() {
    try {
      super.unload();
      this.plugin.saveSettings();
    } catch (error) {
      console.error("Error during the unload process:", error);
      new Notice("Error occurred while unloading the settings.");
    }
  }

  // Settings creation methods
  createPluginDescription(containerEl) {
    containerEl.createEl("h1", { text: "Auto Note Creation Plugin" });
    containerEl.createEl("p", {
      text: "This plugin helps automate the creation of notes based on your predefined configurations. Define your note name templates, associate them with templates, and let the plugin handle note creation for you.",
    });
  }

  createUsageInstructions(containerEl) {
    containerEl.createEl("h3", { text: "How to Use:" });
    this.createList(
      containerEl,
      [
        "Define a Note Configuration by setting its parameters.",
        "Use expressions like {current_date:%m.%Y} in your note names and paths to dynamically insert dates.",
        "Date formatting can be done using specifiers like %d (day), %m (month), and %Y (year).",
      ],
      "ol"
    );
  }

  createSpecifierInstructions(containerEl) {
    containerEl.createEl("h3", { text: "Specifier Information:" });
    const specifiers = [
      "%w:    Day of the week (1 represents Monday, 7 represents Sunday)",
      "%Aen:  English name for the day of the week (e.g., Monday)",
      "%Apl:  Polish name for the day of the week (e.g., Poniedziałek)",
      "%Ben:  English name for the month (e.g., January)",
      "%Bpl:  Polish name for the month (e.g., Styczeń)",
      "%d:    Day of the month (01-31)",
      "%m:    Month (01-12)",
      "%Y:    4-digit year (e.g., 2023)",
      "%y:    2-digit year (e.g., 23 for 2023)",
      "%H:    Hour of the day in 24-hour format (00-23)",
      "%M:    Minute of the hour (00-59)",
      "%S:    Second of the minute (00-59)",
    ];

    this.createList(containerEl, specifiers);
  }

  createAvailableVariables(containerEl) {
    containerEl.createEl("h3", { text: "Available Variables:" });
    this.createList(containerEl, [
      "week_start_date:   The start date of the week.",
      "week_end_date:     The end date of the week.",
      "month_start_date:  The start date of the month.",
      "month_end_date:    The end date of the month.",
      "year_start_date:   The start date of the year.",
      "year_end_date:     The end date of the year.",
      "current_date:      The date for which the note is being generated.",
    ]);
  }

  createSpecifierExamples(containerEl) {
    containerEl.createEl("h3", { text: "Specifier Examples:" });
    const examples = [
      "%A.%m.%Y: Day of the week followed by month and year (e.g., 1.08.2023 for 1st August 2023)",
      "%H:%M:%S: Time in HH:MM:SS format (e.g., 14:30:45 for 2:30:45 PM)",
      "%d/%m/%y: Date in DD/MM/YY format (e.g., 01/08/23 for 1st August 2023)",
    ];
    this.createList(containerEl, examples);
  }

  createTemplateFolderSetting(containerEl) {
    containerEl.createEl("h3", { text: "Template Folder Settings:" });
    new import_obsidian.Setting(containerEl)
      .setName("Template Folder Path")
      .setDesc(
        "Relative path to the folder within your Vault containing your templates"
      )
      .addText((text) =>
        text
          .setPlaceholder("Enter relative path to your template folder...")
          .setValue(this.plugin.settings.templateFolderPath || "")
          .onChange(async (value) => {
            this.plugin.settings.templateFolderPath = value;
            await this.plugin.saveSettings();
          })
      );
  }

  createAutoCreateSetting(containerEl) {
    new import_obsidian.Setting(containerEl)
      .setName("Automatically create missing notes on load")
      .setDesc(
        "If enabled, the plugin will check for missing notes based on your configurations and create them automatically when Obsidian loads."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoCreateOnLoad || false)
          .onChange(async (value) => {
            this.plugin.settings.autoCreateOnLoad = value;
            await this.plugin.saveSettings();
          })
      );
  }

  createNoteConfigTable(containerEl) {
    containerEl.createEl("h3", { text: "Note Configurations:" });
    const table = this.createTable(containerEl);
    this.populateNoteConfigTable(table);
  }

  createNewConfigurationButton(containerEl) {
    const addButtonContainer = containerEl.createEl("div", {
      style: "margin-bottom: 10px;",
    });
    const addButton = addButtonContainer.createEl("button", {
      text: "Add Configuration",
    });
    addButton.addEventListener("click", () => {
      this.plugin.settings.noteConfigs.push({
        note_name_template: "",
        template_name: "",
        base_path: "",
        frequency: "daily",
      });
      this.display();
    });
  }

  createSaveSettingsButton(containerEl) {
    const bottomContainer = containerEl.createEl("div");
    bottomContainer.setAttr(
      "style",
      "display: flex; justify-content: flex-end; margin-top: 20px;"
    );
    const saveButton = bottomContainer.createEl("button", {
      text: "Save Settings",
      cls: "mod-cta",
    });
    saveButton.addEventListener("click", () => {
      this.plugin.saveSettings();
    });
  }

  // Helper methods
  createList(containerEl, items, type = "ul") {
    const list = containerEl.createEl(type);
    for (const [key, value] of Object.entries(items)) {
      const text =
        typeof key === "number" || typeof value !== "object"
          ? value
          : `${key} - ${value}`;
      list.createEl("li", { text: text });
    }
  }

  createTable(containerEl) {
    return containerEl.createEl("table", {
      style: "width: 100%; border-collapse: collapse; margin-bottom: 10px;",
    });
  }

  populateNoteConfigTable(table) {
    // Table headers
    if (this.plugin.settings.noteConfigs.length > 0) {
      const thead = table.createEl("thead");
      const headerRow = thead.createEl("tr");
      [
        "Note Name",
        "Frequency",
        "Template Name",
        "Destination Path",
        "Delete",
      ].forEach((header) => {
        headerRow.createEl("th", {
          text: header,
          style: "padding: 5px; border-bottom: 1px solid gray;",
        });
      });
    }

    // Table body
    const tbody = table.createEl("tbody");
    this.plugin.settings.noteConfigs.forEach((config, index) => {
      const row = tbody.createEl("tr");

      const createInputWithModal = (cellValue, updateFunc) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = cellValue;
        input.style.width = "100%";
        input.addEventListener("click", () => {
          new TextInputModal(this.plugin.app, input.value, (newValue) => {
            input.value = newValue;
            updateFunc({ target: input });
          }).open();
        });
        return input;
      };

      // Note Name Template Input
      const noteNameCell = row.createEl("td");
      noteNameCell.appendChild(
        createInputWithModal(config.note_name_template, (e) => {
          config.note_name_template = e.target.value;
        })
      );

      // Frequency Dropdown
      const frequencyCell = row.createEl("td");
      const frequencyDropdown = frequencyCell.createEl("select", {
        style: "width: 100%;",
      });
      ["daily", "weekly", "monthly", "yearly"].forEach((freq) => {
        const option = frequencyDropdown.createEl("option", {
          value: freq,
          text: freq,
        });
        if (freq === config.frequency) {
          option.selected = true;
        }
      });
      frequencyDropdown.addEventListener("change", (e) => {
        config.frequency = e.target.value;
      });

      // Template Name Input
      const templateNameCell = row.createEl("td");
      templateNameCell.appendChild(
        createInputWithModal(config.template_name, (e) => {
          config.template_name = e.target.value;
        })
      );

      // Base Path Input
      const basePathCell = row.createEl("td");
      basePathCell.appendChild(
        createInputWithModal(config.base_path, (e) => {
          config.base_path = e.target.value;
        })
      );

      // Delete Button
      const deleteButtonCell = row.createEl("td");
      const deleteButton = deleteButtonCell.createEl("button", {
        text: "Delete",
        cls: "delete-config-button",
      });
      deleteButton.addEventListener("click", () => {
        this.plugin.settings.noteConfigs.splice(index, 1);
        this.display();
      });
    });
  }
}

class NoteConfig {
  constructor(
    note_name_template,
    template_name,
    base_path,
    frequency,
    subfolder = null
  ) {
    this.note_name_template = note_name_template;
    this.template_name = template_name;
    this.base_path = base_path;
    this.frequency = frequency;
    this.subfolder = subfolder;
  }
}

class TextInputModal extends Modal {
  constructor(app, currentValue, onSave) {
    super(app);
    this.currentValue = currentValue;
    this.onSave = onSave;
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.empty(); // Clear any existing content in the modal.

    contentEl.createEl("h2", { text: "Edit Configuration" });

    const textArea = contentEl.createEl("textarea");
    textArea.value = this.currentValue;
    textArea.setAttr(
      "style",
      "width: 100%; height: 50vh; resize: none; padding: 1em; box-sizing: border-box;"
    );

    // Handle modal click outside to save and close
    this.modalEl.addEventListener("click", (e) => {
      if (e.target === this.modalEl) {
        this.onSave(textArea.value);
        this.close();
      }
    });
  }

  onClose() {
    // Save the content when the modal is closed
    this.onSave(this.contentEl.querySelector("textarea").value);
  }
}

// Generates a note name based on a template and target date.
function generateNoteName(template, targetDate) {
  const variables = {
    week_start_date: calculateWeekDates(targetDate).start_date,
    week_end_date: calculateWeekDates(targetDate).end_date,
    month_start_date: calculateMonthDates(targetDate).start_date,
    month_end_date: calculateMonthDates(targetDate).end_date,
    year_start_date: calculateYearDates(targetDate).start_date,
    year_end_date: calculateYearDates(targetDate).end_date,
    current_date: targetDate,
  };

  template = template.replace(/%E{([^}]+)}/g, (_, code) => {
    try {
      return eval(code);
    } catch (error) {
      console.error("Error evaluating expression:", error);
      return _;
    }
  });

  return template.replace(
    /{([a-zA-Z_]+(?:_[a-z]{2})?):([^}]+)}/g,
    (_, expr, format) => {
      if (variables.hasOwnProperty(expr)) {
        return formatDate(variables[expr], format);
      } else {
        console.error(`Expression ${expr} not found in variables`);
        return _;
      }
    }
  );
}

// Formats a date according to the provided format.
function formatDate(date, format) {
  format = format.replace(/%E{([^}]+)}/g, (_, code) => {
    try {
      const fn = new Function("variables", "return (" + code + ")");
      return fn(variables);
    } catch (error) {
      console.error("Error evaluating expression:", error);
      return _;
    }
  });

  const monthNamesEn = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthNamesPl = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
  ];
  const weekdayNamesEn = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekdayNamesPl = [
    "Niedziela",
    "Poniedziałek",
    "Wtorek",
    "Środa",
    "Czwartek",
    "Piątek",
    "Sobota",
  ];

  const replacements = {
    "%Aen": weekdayNamesEn[date.getDay()],
    "%Apl": weekdayNamesPl[date.getDay() === 0 ? 6 : date.getDay()],
    "%Ben": monthNamesEn[date.getMonth()],
    "%Bpl": monthNamesPl[date.getMonth()],
    "%w": date.getDay() === 0 ? "7" : date.getDay().toString(),
    "%d": padZero(date.getDate()),
    "%m": padZero(date.getMonth() + 1),
    "%Y": date.getFullYear(),
    "%y": date.getFullYear().toString().slice(-2),
    "%H": padZero(date.getHours()),
    "%M": padZero(date.getMinutes()),
    "%S": padZero(date.getSeconds()),
  };

  for (const [specifier, replacement] of Object.entries(replacements)) {
    format = format.split(specifier).join(replacement);
  }

  return format;
}

// Pads single-digit numbers with a leading zero.
function padZero(number) {
  return number.toString().length === 1 ? "0" + number : number.toString();
}

// Calculates the start and end dates of the week for a given date.
function calculateWeekDates(date) {
  const dayOfWeek = date.getDay() || 7;
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - dayOfWeek + 1);
  const endOfWeek = new Date(date);
  endOfWeek.setDate(date.getDate() + 7 - dayOfWeek);

  return { start_date: startOfWeek, end_date: endOfWeek };
}

// Calculates the start and end dates of the month for a given date.
function calculateMonthDates(date) {
  const start_date = new Date(date.getFullYear(), date.getMonth(), 1);
  const end_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start_date, end_date };
}

// Calculates the start and end dates of the year for a given date.
function calculateYearDates(date) {
  const start_date = new Date(date.getFullYear(), 0, 1);
  const end_date = new Date(date.getFullYear(), 11, 31);
  return { start_date, end_date };
}
