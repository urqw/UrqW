# Changelog for UrqW

(Changes to the game catalog is not recorded in this document.)

## Version 1.1 (in development)

* URQL interpreter:
	+ Added: UTF-8 encoding support for games and plugins.
	+ Added: Ability to add a drop-down menu with a list of actions to links in the text and hide individual menu items depending on the values ??of special variables with the `hide_` prefix.
	+ Added: Ability to execute JavaScript code from URQL code and retrieve its result using the javascript system variable.
	+ Added: System variables:
		- date - get the current date (only when urq_mode specific rules are absent).
		- file_content - get the contents of a file from a game package as text by its internal path.
		- file_url - get the relative URL of a file from a game package by its internal path.
		- image_caption - set or get the visible caption for an image.
		- instr_leave_spc - set or get the space handling mode for the instr operator.
		- last_btn_caption - get the name of the last activated choice button or link in the text.
		- location - get the name of the current location, regardless of the method of transition to this location (only for compatibility mode with akURQ).
		- quest_path - always has a value of an empty string (only for compatibility mode with akURQ).
		- time - get the current time.
		- urq_type - always has a value 1 (only for compatibility mode with akURQ).
		- urqw_game_ifid - get the game's IFID (or an empty string if it lacks one).
		- urqw_game_lang - set or get the game content language.
		- urqw_title - set or get the UrqW page title.
		- urqw_version - get the UrqW version.
	+ Added: The clst operator to clear the screen of text.
	+ Added: The clsl operator to clear links from the text.
	+ Added: The varkill operator (a direct counterpart of the perkill operator).
	+ Added: Ability to set arbitrary names for inventory items, for inventory item usage options, and for drop-down menu items of links in text instead of names based on variable and labels names (special variables with the `display_` prefix are used).
	+ Added: Support for custom alternative text descriptions for images added using either the image system variable or the image operator.
	+ Added: Ignore whitespace characters at the beginning of any lines.
	+ Added: Automatic normalization of internal file paths: reverse soliduses (backslashes are replaced with soliduses (slashes), and all soliduses at the beginning of the path are removed.
	+ Added: Compatibility mode with AkURQ.
	+ Added: Automatic HTML escaping (enabled by default in compatibility modes with RipURQ and URQ_DOS).
	+ Changed: The clsb operator now only removes buttons, but does not clear text from links.
	+ Changed: Initializing a variable using the instr operator without assigning a value initializes the variable with a value of the empty string rather than being ignored.
	+ Changed: When assigning a string value to a variable using the instr operator, leading and trailing whitespace characters in the value string are removed. You can restore the previous behavior of preserving spaces using the instr_leave_spc system variable.
	+ Fixed: If an inventory item has an underscore character in its name (e.g., `inventory_item`), it has a use label without specifying an action (e.g., `use_inventory_item`), and the hide action variable has a positive value (e.g., `hide_use_inventory_item = 1`), then clicking on the item's link in the inventory panel will still trigger the action.
	+ Fixed: If there is a space before the equal sign when assigning a value to the image or the music system variables, the construct is mistakenly interpreted as executing the operators of the same name with an incorrect file path.
	+ Fixed: The not operator immediately after the left parenthesis is processed incorrectly.
	+ Fixed: Incorrect processing of the tokens_delim variable.
	+ Fixed: Incorrect processing of the goto operator in compatibility mode with URQ_DOS.
* Game player:
	+ Added: Customizable internationalization support and interface translations into English, Armenian, Belarusian, Esperanto, Interslavic (Latin), Russian, and Ukrainian.
	+ Added: Game encoding configuration when opening from the main page.
	+ Added: Ability to rename and clear save slots via the additional actions menu, as well as download and upload saves as files.
	+ Added: Customizable game loading with automatic progress saving between sessions.
	+ Added: Customizable warning about possible errors when loading a save for a different version of the game.
	+ Added: Date field in the game catalog.
	+ Added: Ability to filter games in the catalog by language and title, and sort by date and alphabetically.
	+ Added: Menu with additional information and settings in the toolbar.
	+ Added: RSS feed for new games in the catalog.
	+ Added: Games added to the catalog have separate URLs for identification and indexing by search engines.
	+ Added: Meta tag with canonical URL (separate URLs for the main page with a game catalog and for each game launched by identifier).
	+ Added: Ability to set a game to load on any opening of index.html.
	+ Added: Ability to set player settings using GET parameters:
		- Identifier of a game to launch - id (value: identifier).
		- Interface language - lang (value: localization code).
		- URQ mode - mode (value: "urqw", "ripurq", "dosurq" or "akurq").
		- Game encoding - encoding (value: "UTF-8" or "CP1251").
		- URL for game opening - url (value: URL string).
		- Display of the game debugging section in the menu - debug with value "1".
	+ Added: Support for the manifest.json file in the game package, which is used to define player parameters and game metadata, as well as initial values for some system variables.
	+ Added: Support for the iFiction record from the Treaty of Babel in the game package, which is used to store extended game metadata in a unified format.
	+ Added: Automatic focusing of controls when working with dialog boxes (menu, save and load game).
	+ Added: Volume level setting for game sounds.
	+ Added: Assigning an empty string value to the music variable stops the audio file from playing in a loop.
	+ Added: The music and game sounds that are playing are remembered when the game is saved, and they resume from the same point when loading from the save.”
	+ Added: Customizable automatic focusing the first control on the game screen, as well as inscription about waiting for pressing any key and game over notification.
	+ Added: Ability to configure a request to confirm page closure.
	+ Added: Disabled  hotkeys for activating choice buttons, quick actions, and cluster navigation through interface areas (see help in menu).
	+ Added: Numbering of choice buttons when hotkeys are enabled.
	+ Added: Ability to collapse and expand sections on the main page.
	+ Added: Display detailed information about UrqW on the main page.
	+ Added: Display of UrqW version in the player interface.
	+ Added: Titles for save and load game dialog boxes.
	+ Added: Support for opening .qsz format games.
	+ Changed: Inventory item usage options are displayed when the item receives system focus, not just when the mouse is hovering over it.
	+ Changed: Inventory item usage options generated from use labels names are displayed with spaces instead of underscores.
	+ Changed: When the game over through the quit operator, links and buttons are deleted instead of just stopping response to user actions.
	+ Changed: When launching a game by identifier, preference is given to the game identifier from the id get parameter (support for launching a game by fragment identifier (hash) is retained, but only if the id GET parameter is absent).
	+ Changed: When loading a game from an archive, files named style.css and script.js are read and loaded as plugins (as documented), rather than all .css and .js files (as was actually the case).
	+ Changed: When launching a game by identifier from a folder, the player searches for the urqw/main.qst file and, if not found, then main.qst, instead of the quest.qst file. The directory where main.qst is located is considered the game directory.
	+ Changed: When launching a game by identifier from a folder, the manifest.json and iFiction record files, and plugin files (style.css and script.js) are loaded and processed first, and only then the main.qst game file.
	+ Changed: A new sound played using the play operator stops the previous one (the original behavior of RipURQ, URQ_DOS (WCL), and AkURQ), rather than playing in parallel.
	+ Changed: Game sounds initiated via the play operator at zero volume begin playing at zero volume instead of being ignored.
	+ Changed: Keypress tracking by key code instead of character code.
	+ Changed: Minor adjustment to informative window indentation.
	+ Fixed: Links disappear from the text when loading a saved game.
	+ Fixed: Text output containing line breaks is always displayed as a block element.
	+ Fixed: Paragraphs containing text output with block elements do not have left padding.
	+ Fixed: Music and game sounds do not stop playing when restarting or loading from a save.
	+ Fixed: When the music operator is executed  again with the same audio file, the file is not played again.
	+ Removed: Separate UrqW cursor for choosing and activating buttons (caused issues with simultaneous activation of two controls and was replaced with cluster navigation based on standard system focus).
	+ Accessibility improvements:
		- Added: Text labels for controls of the toolbar.
		- Added: Text label for inventory button in XS-sized interface.
		- Added: Text prefix to visually highlighted autosave slot
		- Added: Customizable announcement description updates using assistive technology.
		- Added: Customizable announcement choice button updates using assistive technology.
		- Added: Customizable announcement description using assistive technology when pressing a hotkey (see help in menu).
		- Added: Customizable announcement description using assistive technology when shaking device.
		- Added: Customizable images focusability using the keyboard.
		- Added: Inventory panel links that do not perform any actions have the aria-disabled attribute, which indicates that there is no associated action but does not suppress the element focusability.
		- Added: Designation  for assistive technologies whether an inventory item has a drop-down menu.
		- Changed: Each link in the drop-down menu of an inventory item has the role of a menu item.
		- Changed: Text labels for player graphic icons.
		- Fixed: Links in game text are not focusable with keyboard, and do not have link role.
		- Fixed: Incorrect paragraph representation in game text for screen readers.
		- Fixed: The inventory button in XS-sized interface does not change its semantic state (collapsed/expanded) after the first activation.
* Documentation:
	+ Added: Preparation of new documentation in Russian and English has begun.
	+ Added: The guide for contributors (see the CONTRIBUTING.md file in the repository).
	+ Changed: Updating the main Russian-language documentation.
* Development and maintenance infrastructure:
	+ Added: Automate the build and deployment of UrqW with a game catalog via GitHub Actions on GitHub Pages when changes are made to master.
	+ Added: check-locale script to check completeness of localization.
	+ Added: valid-json script to validate the games.json file.
	+ Added: pack-games script to package games from the games directory for the catalog.
	+ Added: gen-rss script to generate RSS feed for new games in the catalog.
	+ Added: gen-license-report script to generate report on third-party component licenses.
	+ Added: gen-docs script to generate documentation in HTML format.
	+ Added: pack-release script to package a release build of UrqW.
	+ Added: `npm run build` command to build UrqW for production environments with the games catalog.
	+ Added: `npm run release` command to build UrqW for release without the games catalog.
	+ Changed: All games in the catalog are added as submodules from separate repositories and repackaged with manifest.json and iFiction record files.
	+ Changed: Supported plugins with usage examples (functional tests) are added as submodules from separate repositories and placed in the quests directory as game packages.
	+ Changed: Tests to ensure the engine is working correctly have been moved to the quests/tests directory.

## Version 1.0 (from 2017-01-20)

* The first stable release.

## 2015-10-12

* The first publicly presented working version.

## 2015-09-21

* Start of development (first commit).
