# Contributing to UrqW Project

## Preparing the Workspace

You will need development tools like [Git](https://git-scm.com/) and [Node.js with npm](https://nodejs.org/).

1. Fork the repository.
2. Clone your fork: \
	`git clone %url_repo%` \
	or with submodules, if you plan to work with games in the catalog, supported plugins, and build the project for deployment in production environments: \
	`git clone --recurse-submodules %url_repo%`
3. Install project dependencies: \
	`npm install`
4. Build the project (if needed): \
	`npm run build`

## Making Changes

1. Create a new branch.
2. Make changes considering the following:
	* Document changes in the [/CHANGELOG.md](CHANGELOG.md) file in the section of the version with the "in development" status. If the changes are minor technical updates or already covered by an existing list item, they may not need documentation. If they closely resemble an existing item, you can rewrite it with a generalized description of the changes.
	* If the changes affect functionality that is already documented in the previous implementation or is a significant change that needs documentation, make appropriate edits or additions to the [/README.md](README.md) file and/or documentation in the /md directory.
3. Commit your changes.
4. Create a pull request.

## Adding or Updating a Game

The recommended way to add games to the catalog and maintain them is to connect their repositories as Git submodules in the main UrqW repository.

Follow the process as for making any other change (see "Making Changes").

Adding a new game:

1. Prepare the external repository of the game according to the following requirements:
	* The game repository must contain a manifest.json file in the correct format and must include the IFID, located either in the root directory or in a directory with a maximum of one level of nesting. It is best to place it in the same directory where the main .qst file is located. The easiest way to generate a manifest.json file and the IFID is by using the corresponding script from the [UrqW Game Template](https://github.com/urqw/game_template).
	* The game repository must contain an iFiction record file with the game's metadata in the correct format, located either in the root directory or in a directory with a maximum of one level of nesting. It is best to place it in the same directory where the main .qst file is located. The easiest way to generate an iFiction record file is by using the corresponding script from the [UrqW Game Template](https://github.com/urqw/game_template).
	* The game repository must contain at least 1 .qst file with game code.
	* The game repository can contain other files necessary for the game package.
	* It is recommended to place all game data in a separate /urqw directory located in the root of the repository. In this case, only this directory will be archived for the catalog, not the entire repository. The [UrqW Game Template](https://github.com/urqw/game_template) already contains an optimal repository structure.
	* It is highly desirable that the game repository does not contain files and directories with non-ASCII characters in their names.
2. Add the external repository of the game as a Git submodule to the /games directory of the main UrqW repository: \
	`git submodule add %url_game_repo% games/%game_name%` \
	The game directory name (%game_name%) should be formatted in snake_case: ASCII characters in lowercase, separated by underscores if necessary. \
	An alternative option is to add the game submodule to the /quests directory. This way, it won't be packaged, and its resources will be loaded asynchronously on demand during gameplay. This may be preferable for games with large game assets, as it will allow them to launch faster. However, in this case, all game code must be contained in a single main.qst file. For more information, see the UrqW documentation.
3. Add information about the new game to the /games.json file in the main UrqW repository.
4. Validate the edited /games.json file by running the command: \
	`npm run valid-json`
5. Complete the changes to the main UrqW repository according to the general process (see "Making Changes").

Updating an already added game:

1. Update the connected game submodule: \
	`git submodule update --remote games/%game_name%` \
	or
	`git submodule update --recursive --remote games/%game_name%` \
	if the game repository contains submodules.
2. Complete the changes to the main UrqW repository according to the general process (see "Making Changes").

## Adding or Updating a Localization

UrqW supports internationalization of the user interface. You can either add a new localization or update an existing one.

Follow the process as for making any other change (see "Making Changes").

All files must be opened and saved in UTF-8 encoding without BOM.

Adding a new localization:

1. Determine the target language code according to the ISO 639 standard. For example, the Russian language code is "ru". For more details, see [Declaring language in HTML, Choosing language values)](https://www.w3.org/International/questions/qa-html-language-declarations.en#langvalues).
2. In the /locale directory, create a copy of the en.js file and rename it according to the target language code, for example, ru.js for Russian. Instead of en.js, you can use another existing localization, but there is a risk of copying an incomplete translation or someone else's translation errors, while en.js is the main localization file.
3. Open the new localization file and edit its contents:
	* Rename the translation string object according to the target language code, for example, `var ru` for Russian.
	* Translate all values of keys into the target language.
4. Open the /index.html file and connect the new localization file in the `<head>` container next to the other localizations.
5. Open the /js/i18n.js file and edit its contents:
	* Add information about the new localization as an object within the availableLangs object, for example, for Russian:
	```javascript
	    ru: {
	        name: "Russian (русский)",
	        translation: ru
	    }
	```
	* Use the target language code as the name of the target language object and the value of the translation key.
	* It is advisable to specify the target language name in English as the value of the name key, and then in brackets in the target language itself.
6. Complete the changes to the main UrqW repository according to the general process (see "Making Changes").

Updating an existing localization:

1. Identify strings missing from the localization for the target language using the check-locale script, for example, for Russian: \
	`npm run check-locale ru`
2. In the /locale directory, open the file with the localization for the target language, for example, ru.js for Russian.
3. Open the /locale/en.js file with the main English localization. Instead of en.js, you can use another existing localization, but there is a risk of copying an incomplete translation or someone else's translation errors, while en.js is the main localization file.
4. Compare the contents of these files and bring the contents of the target language localization file in line with the contents of the main localization file. It is recommended to keep the same string order as in the main localization file.
5. Complete the changes to the main UrqW repository according to the general process (see "Making Changes").

## Development with Internationalization in Mind

UrqW is developed with internationalization/localization in mind. This means that any text displayed in the user interface must be retrieved from translation resources in the source code. HTML elements containing text must also be mapped to translation resources.

Translation resources are located in the /locale directory. The default language is English (en).

Here are some examples of working with translation resources:

* Get a string from translation resources in JavaScript code:
	```javascript
	var translatedString = i18next.t('string_id');
	```
* Associate the contents of an HTML tag with a translation resource:
	```html
	<button data-i18n="string_id">Default contents</button>
	```
* Associate the value of an HTML tag attribute with a translation resource:
	```html
	<button title="Default value" data-i18n="[title]string_id"></button>
	```
* Associate the values ??of multiple attributes and the contents of an HTML tag with translation resources:
	```html
	<button
	    title="Default value" aria-label="Default value"
	    data-i18n="[title]title_id;[aria-label]aria_label_id;contents_id">
	    Default contents</button>
	````

If any data in the user interface is displayed based on language settings, such as date and time, the display format should be associated with the active UrqW interface language, which can be obtained from the lang attribute of the `<html>` tag:

```javascript
var date = new Date();
var lang = document.documentElement.lang;
var formattedDate = date.toLocaleDateString(lang);
```

## Preparing a New Version

1. Make reasonable and realistic efforts to update localizations and documentation in all supported languages. Translators and their contact information are usually listed at the beginning of the source files.
	* Do a general check of all localizations by running the command: \
		`npm run check-locale`
	* Try to ensure 100% translation for all localizations before releasing.
2. Update and synchronize the UrqW version in the following project files:
	* In the urqw_version variable in the /index.html file.
	* In the version parameter in the /package.json file.
	* In the /package-lock.json file, automatically updating it after editing package.json with the `npm install` command.
3. Edit the [/CHANGELOG.md](CHANGELOG.md) file:
	* If this is the start of development for a new version, a new section should be created in the Changelog with the number of the version being prepared and the status "in development", for example, "Version 1.0 (in development)".
	* If this is a release preparation, the Changelog should have a section with the version number and release date instead of the "in development" status, for example, "Version 1.0 (from 2017-01-20)".
4. Perform other necessary actions.
