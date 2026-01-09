# UrqW: Web-Based Interactive Fiction Engine

UrqW is an open source engine for text-based games and interactive fiction, available free of charge.

It is also a URQL interpreter that supports compatibility modes with the URQL dialects of RipURQ 1.4, URQ_DOS 1.35 and AkURQ 1.28.

URQL, a domain-specific language from the URQ family of text-based game engines, is designed primarily for creating choice-based interactive fiction.
URQ engines have been in existence since 2000 and are easy to learn for non-technical authors.
UrqW implements the URQL interpreter with additional features based on web technologies.

## Briefly about UrqW

* UrqW is not an online interpreter. It can be downloaded and run from a USB flash drive without an internet connection.
* Users can host UrqW on their website, add any games to the catalog, and share a link that allows anyone to play online.
* When the user runs UrqW (even in the online version), no data is sent to external servers. Loading and playback processes occur locally within the browser. The browser stores all saves locally as well.
* UrqW supports internationalization of the user interface and game content. It features differentiated language markup corresponding to the interface and game content language. Users can leverage translation features in modern browsers to play games in languages they don’t know well or don’t know at all.
* UrqW supports URQL integration with JavaScript and plugins that can virtually limitlessly expand the engine’s capabilities or modify its appearance.
* UrqW offers a high level of accessibility support, including extended keyboard controls and interface adaptation for screen readers with additional settings.

## Links

* [UrqW Online instance incorporating latest changes](https://urqw.github.io/UrqW/)
* [UrqW documentation incorporating latest changes](https://urqw.github.io/UrqW/docs/index.html)
* [List of all changes](https://urqw.github.io/UrqW/CHANGELOG.html)
* [UrqW game template](https://github.com/urqw/game_template)
* [Latest formal release of UrqW](https://github.com/urqw/UrqW/releases/latest) (hasn’t been updated for a long time)

## Heading towards the new release

Version 1.1 is in development with significant fixes and improvements (see [CHANGELOG.md](CHANGELOG.md)).

Key tasks on the way to the new release:

* Stabilization of functionality (in testing)
* Preparing new documentation (in development)
* Adding new user interface localizations (at any time as ready)

However, the master branch always contains a stable enough version to be usable.

## How to Help the Project

* Create [issues](https://github.com/urqw/UrqW/issues) describing the defects found.
* Submit pull requests with fixes, new UI localizations or document translation, and new games to the catalog (see [CONTRIBUTING.md](CONTRIBUTING.md)).
* Just create good games for UrqW!

## Project Automation Tools

For details on how to contribute to the project, see the [CONTRIBUTING.md](CONTRIBUTING.md) file.

The following project automation tools have been implemented:

* Install all required dependencies:
	```
	npm install
	```
* General check of completeness of all localizations (display the percentage of translated strings):
	```
	npm run check-locale
	```
* Detailed check of completeness of a specific localization (display the identifiers of untranslated strings), e.g. for Russian:
	```
	npm run check-locale ru
	```
* Validate the /games.json file:
	```
	npm run valid-json
	```
* Package all games from the /games directory:
	```
	npm run pack-games
	```
* Package a specific game from the /games directory:
	```
	npm run pack-games %game_name%
	```
	or with wildcards:
	```
	npm run pack-games %part_game_name%*
	```
* Generate RSS feed for new games in the catalog (the /rss.xml file):
	```
	npm run gen-rss
	```
* Generate report on third-party component licenses (the /third-party_components.txt file):
	```
	npm run gen-license-report
	```
* Generate documentation in HTML format (convert files from the /md directory to the /docs directory):
	```
	npm run gen-docs
	```
* Generate a sitemap for search engines (the /sitemap.xml file):
	```
	npm run gen-sitemap
	```
* Package a release build of UrqW (just the engine and documentation, without games and development artifacts):
	```
	npm run pack-release
	```
* Build UrqW for production environments with the games catalog (sequential execution of valid-json, pack-games, gen-rss, gen-license-report, gen-docs, and gen-sitemap scripts):
	```
	npm run build
	```
* Build UrqW for release without the games catalog (sequential execution of gen-license-report, gen-docs, and pack-release scripts):
	```
	npm run release
	```
