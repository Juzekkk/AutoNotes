## Auto Note Creation Plugin for Obsidian

### Description

The `AutoNotes` plugin for Obsidian streamlines the process of creating notes automatically based on user-defined configurations. You can define your note name templates, associate them with existing templates, and let the plugin generate the notes for you. This is particularly useful for creating regular notes like daily, weekly, or monthly summaries.

### Features

- **Dynamic Note Naming**: Customize your note names with dynamic expressions, allowing for greater flexibility and organization.
- **Advanced Date Formatting**: Seamlessly integrate various date formats into your note names and paths, ensuring your notes are always timely.
- **Associative Templates**: Link your configurations with existing templates, ensuring that every new note follows a consistent structure.
- **Automated Note Generation**: Set it and forget it! Let the plugin handle the note generation based on your predefined configurations.

### How to Use

1. **Set Up Note Configuration**: Define the parameters for your note configuration to determine how notes will be generated.
2. **Dynamic Date Expressions**: Use expressions like `{current_date:%m.%Y}` to add dates dynamically to your note names and paths.
3. **Date Formatting with Specifiers**: Customize your dates with specifiers like `%d` for day, `%m` for month, and `%Y` for the year.

### Expressions and Specifiers

#### Date Specifiers:

- **%A**: Day of the week (1 represents Monday, 7 represents Sunday)
- **%d**: Day of the month (01-31)
- **%m**: Month (01-12)
- **%Y**: 4-digit year (e.g., 2023)
- **%y**: 2-digit year (e.g., 23 for 2023)
- **%H**: Hour of the day in 24-hour format (00-23)
- **%M**: Minute of the hour (00-59)
- **%S**: Second of the minute (00-59)

#### Advanced Expressions:

- **%E{...}**: Execute JavaScript code within the `{...}` brackets to evaluate complex expressions. This is extremely powerful as it allows for dynamic calculations and custom logic to be embedded right within the naming templates.

#### Available Variables for Expressions:

- **week_start_date**: Start date of the current week.
- **week_end_date**: End date of the current week.
- **month_start_date**: Start date of the current month.
- **month_end_date**: End date of the current month.
- **year_start_date**: Start date of the current year.
- **year_end_date**: End date of the current year.
- **current_date**: Date for which the note is being generated.

### Examples

- **%A.%m.%Y**: Represents the day of the week followed by the month and year, e.g., 1.08.2023 for 1st August 2023.
- **%H:%M:%S**: Represents the time in HH:MM:SS format, e.g., 14:30:45 for 2:30:45 PM.
- **%E{const date = new Date(); return date.getFullYear();}**: Evaluates the JavaScript code within the `%E{...}` brackets to return the current year.

### Contributions

For any bug reports, updates, or contributions, please refer to the main repository. We appreciate any feedback or enhancements to make this plugin even more powerful for the Obsidian community.

## License

This plugin is licensed under the MIT License. See `LICENSE` in the repository for more information.
