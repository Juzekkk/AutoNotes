# AutomaticNotes Plugin for Obsidian

The `AutoNotes` plugin for Obsidian streamlines the process of creating notes automatically based on user-defined configurations. You can define your note name templates, associate them with existing templates, and let the plugin generate the notes for you. This is particularly useful for creating regular notes like daily, weekly, or monthly summaries.

## Features

- Define note name templates with dynamic date expressions.
- Associate note name templates with existing templates in your vault.
- Automatically create notes on Obsidian load based on the plugin's configurations.
- Specify the frequency (daily, weekly, monthly, yearly) for each note configuration.
- Manually invoke the note creation process using a command within Obsidian.

## Installation

1. Navigate to the Community plugins in Obsidian.
2. Search for "AutoNotes".
3. Install the plugin.

## How to Use

1. Navigate to the plugin settings.
2. Define your Note Configuration by setting its parameters.
3. Use expressions like `{current_date:%m.%Y}` in your note names and paths to dynamically insert dates.
4. Date formatting can be done using specifiers like `%d` (day), `%m` (month), and `%Y` (year).

### Available Variables for Templates:

- `week_start_date`: The start date of the week.
- `week_end_date`: The end date of the week.
- `month_start_date`: The start date of the month.
- `month_end_date`: The end date of the month.
- `year_start_date`: The start date of the year.
- `year_end_date`: The end date of the year.
- `current_date`: The date for which the note is being generated.

### Examples:

- `{current_date:%Y}` will be replaced by the current year (e.g., "2023").
- `{current_date:%m.%Y}` will be replaced by the current month and year (e.g., "08.2023").

## Settings

- **Template Folder Path**: Specify the relative path to the folder within your Vault containing your templates.
- **Automatically create missing notes on load**: Toggle this setting to enable or disable the automatic creation of missing notes based on your configurations when Obsidian loads.
- **Note Configurations**: Define multiple note configurations specifying the note name template, frequency, template name, and destination path.

## Support

If you encounter any issues or have feature requests, please open an issue on GitHub.

## License

This plugin is licensed under the MIT License. See `LICENSE` in the repository for more information.
