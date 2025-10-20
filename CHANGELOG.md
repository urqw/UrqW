# Changelog for UrqW

(Adding games to the catalog is not recorded in this document.)

## Version 1.1 (in development)

* URQL interpreter:
	+ Added: UTF-8 encoding support for games and plugins.
	+ Added: Ability to add a drop-down menu with a list of actions to links in the text and hide individual menu items depending on the values ??of special variables.
	+ Added: Ability to execute JavaScript code from URQL code and retrieve its result using the javascript system variable.
	+ Added: Ability to read any file from the game package and get its contents as text using the fileread system variable.
	+ Added: System variables image_caption, time, date (only when urq_mode specific rules are absent), urqw_title, urqw_game_ifid, urqw_game_lang, urqw_version.
	+ Added: The clst operator to clear the screen of text.
	+ Added: The varkill operator (a direct counterpart of the perkill operator).
	+ Added: Support for custom alternative text descriptions for images added using either the image system variable or the image operator.
	+ Added: Ignore whitespace at the beginning of any lines.
	+ Added: Compatibility mode with AkURQ.
	+ Added: Automatic HTML escaping in compatibility modes with RipURQ and URQ_DOS.
	+ Fixed: If an inventory item has an underscore character in its name (e.g., `inventory_item`), it has a use label without specifying an action (e.g., `use_inventory_item`), and the hide action variable has a positive value (e.g., `hide_use_inventory_item = 1`), then clicking on the item's link in the inventory panel will still trigger the action.
	+ Fixed: Processing of the tokens_delim variable.
	+ Fixed: Processing of the goto operator in compatibility mode with URQ-DOS.
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
	+ Added: Ability to set a game to load on any opening of index.html.
	+ Added: Ability to set player settings using GET requests:
		- Interface language - lang
		- URQ mode - mode
		- Game encoding - encoding
		- URL for game opening - url
		- Display of the game debugging section in the menu - debug with value 1
	+ Added: Support for the manifest.json file in the game package, which is used to define player parameters and game metadata, as well as initial values for some system variables.
	+ Added: Support for the iFiction record from the Treaty of Babel in the game package, which is used to store extended game metadata in a unified format.
	+ Added: Automatic focusing of controls when working with dialog boxes (menu, save and load game).
	+ Added: Volume level setting for game sounds.
	+ Added: Customizable automatic focusing the first control on the game screen, as well as inscription about waiting for pressing any key and game over notification.
	+ Added: Ability to configure a request to confirm page closure.
	+ Added: Disabled  hotkeys for activating choice buttons, quick actions, and cluster navigation through interface areas (see help in menu).
	+ Added: Numbering of choice buttons when hotkeys are enabled.
	+ Added: Display of UrqW version in the player interface.
	+ Added: Titles for save and load game dialog boxes.
	+ Added: Support for opening .qsz format games.
	+ Changed: Inventory item usage options are displayed when the item receives system focus, not just when the mouse is hovering over it.
	+ Changed: Keypress tracking by key code instead of character code.
	+ Changed: Minor adjustment to informative window indentation.
	+ Fixed: Links disappear from the text when loading a saved game.
	+ Fixed: Text output containing line breaks is always displayed as a block element.
	+ Fixed: Paragraphs containing text output with block elements do not have left padding.
	+ Removed: Separate UrqW cursor for choosing and activating buttons (caused issues with simultaneous activation of two controls and was replaced with cluster navigation based on standard system focus).
	+ Accessibility improvements:
		- Added: Text labels for controls of the toolbar.
		- Added: Text label for inventory button in XS-sized interface.
		- Added: Text prefix to visually highlighted autosave slot
		- Added: Customizable announcement description updates using assistive technology.
		- Added: Customizable announcement choice button updates using assistive technology.
		- Added: Customizable announcement description using assistive technology when pressing a hotkey (see help in menu).
		- Added: Customizable announcement description using assistive technology when shaking device (see help in menu).
		- Added: Designation  for assistive technologies whether an inventory item has a drop-down list.
		- Changed: Each link in the drop-down menu of an inventory item has the role of a list item.
		- Changed: Text labels for player graphic icons.
		- Fixed: Links in game text are not focusable with keyboard, and do not have link role.
		- Fixed: Incorrect paragraph representation in game text for screen readers.
* Documentation:
	+ Added: Preparation of new documentation in Russian and English has begun.
	+ Changed: Updating the main Russian-language documentation.
* Development and maintenance infrastructure:
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

## Version 1.0 (from 2017-01-20)

* The first stable release.

## 2015-10-12

* The first publicly presented working version.

## 2015-09-21

* Start of development (first commit).
