# Changelog for UrqW

(Adding games to the catalog is not recorded in this document.)

## Version 1.1 (in development)

* URQL interpreter:
	+ Added: UTF-8 encoding support for games and plugins.
	+ Added: Ability to execute JavaScript code from URQL code and retrieve its result using the javascript system variable.
	+ Added: System variables time, date (only when urq_mode specific rules are absent), urqw_title, urqw_game_ifid, urqw_game_lang, urqw_version.
	+ Added: The backslash character (`\`) as a line continuation character to break single-line URQL instructions into multiple physical lines in the source code.
	+ Added: Support for custom text descriptions for images added using either the image system variable or the image operator.
	+ Fixed: Processing of the tokens_delim variable.
	+ Fixed: Processing of the goto operator in compatibility mode with URQ-DOS.
* Game player:
	+ Added: Customizable internationalization support and interface translations into English, Armenian, Belarusian, Russian, and Ukrainian.
	+ Added: Game encoding configuration when opening from the main page.
	+ Added: Ability to rename and clear save slots via the additional actions menu, as well as download and upload saves as files.
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
	+ Added: Support for the manifest.json file in the game package, used to define player parameters and game metadata, as well as initial values for some system variables.
	+ Added: Automatic focusing of controls when working with dialog boxes (menu, save and load game).
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
	+ Removed: Separate UrqW cursor for choosing and activating buttons (caused issues with simultaneous activation of two controls and was replaced with cluster navigation based on standard system focus).
	+ Accessibility improvements:
		- Added: Text labels for controls of the toolbar.
		- Added: Text label for inventory button in XS-sized interface.
		- Added: Text prefix to visually highlighted autosave slot
		- Added: Customizable announcement description updates using assistive technology.
		- Added: Customizable announcement choice button updates using assistive technology.
		- Added: Customizable announcement description using assistive technology when pressing a hotkey (see help in menu).
		- Added: Customizable announcement description using assistive technology when shaking device (see help in menu).
		- Changed: Text labels for player graphic icons.
		- Fixed: Links in game text are focusable and activatable with keyboard, and have link role.
		- Fixed: Proper paragraph representation in game text for screen readers.
* Documentation:
	+ Added: Preparation of new documentation in Russian and English has begun.
	+ Changed: Updating the main Russian-language documentation.
* Development and maintenance infrastructure:
	+ Added: valid-json script to validate the games.json file.
	+ Added: pack-games script to package games from the games directory for the catalog.
	+ Added: gen-rss script to generate RSS feed for new games in the catalog.
	+ Added: gen-license-report script to generate report on third-party component licenses.
	+ Added: gen-docs script to generate documentation in HTML format.
	+ Added: pack-release script to package a release build of UrqW.
	+ Added: `npm run build` command to build UrqW for production environments with the games catalog.
	+ Added: `npm run release` command to build UrqW for release without the games catalog.
	+ Changed: All games in the catalog are added as submodules from separate repositories and repackaged with manifest.json file.

## Version 1.0 (from 2017-01-20)

* The first stable release.

## 2015-10-12

* The first publicly presented working version.

## 2015-09-21

* Start of development (first commit).
