/**
 * Copyright (C) 2015, 2016 Akela <akela88@bk.ru>
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// Loading

/**
 * @type {Quest}
 */
Game = null;

/**
 * @type {Player}
 */
GlobalPlayer = null;

/**
 * Files
 */
files = null;

quest = []; // todo

/**
 *
 */
var mode;
var encoding;
var debug;
// Object for storing parameters of the manifest.json file
var manifest = {};
// iFiction record file key in the files object
var iFictionFileKey;
// Default settings value
var settings = {
    volume: 50,
    automatically_focus: true,
    close_page_confirmation: true,
    numeric_keys: true,
    alphabetic_keys: true,
    navigation_keys: true,
    announce_description_updates: true,
    announce_choice_button_updates: false,
    announce_description_when_shaking: false
};
var previousAcceleration; // Previous acceleration value from the sensor

$(function() {
    $('#something_wrong').hide();
    $('#infopanel').show();

    $('#additionalstyle').empty();

    /**
     * Get value of get parameter from URL
     */
    function getValParam(name) {
        var query = window.location.search.substring(1);
        var params = query.split('&');
        for (var i = 0; i < params.length; i++) {
            var param = params[i].split('=');
            if (param[0] === name) {
                return decodeURIComponent(param[1]);
            }
        }
        return null;
    }

    /**
     * Load game from URL
     */
    function loadFromURL(url) {
        var fileExtension = url.split('.').pop().toLowerCase();
        mode = $('#urq_mode').val();
        encoding = $('#game_encoding').val();
    
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        
        if (fileExtension === 'qst') {
            var mimeType = {
                'CP1251': 'windows-1251',
                'UTF-8': 'utf-8'
            }[encoding] || encoding;
            
            xhr.overrideMimeType(`text/plain; charset=${mimeType}`);
        } else {
            xhr.responseType = 'arraybuffer';
        }
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                if (xhr.response) {
                    if (fileExtension === 'qst') {
                        start(xhr.response, url);
                    } else if ('zip,qsz'.includes(fileExtension)) {
                        loadZip(xhr.response, url);
                    } else {
                        console.error('Unsupported file format for ', url);
                        loadFromHashFailed();
                    }
                } else {
                    console.error('No data in response for ', url);
                    loadFromHashFailed();
                }
            } else {
                console.error('Request error for ', url);
                loadFromHashFailed();
            }
        };
        
        xhr.onerror = function() {
            console.error('Network error for ', url);
            loadFromHashFailed();
        };
        
        xhr.ontimeout = function() {
            console.error('Request timeout for ', url);
            loadFromHashFailed();
        };
        
        xhr.send();
    }

    /**
     * Load game from hash
     */
    function loadFromHash() {
        $('#loading').show();
        $('#choose-game').hide();

        if (window.location.hash.length > 0) {
            JSZipUtils.getBinaryContent('quests/' + window.location.hash.substr(1) + '.zip', function(err, data) {
                if (err) {
                    $.ajax({
                        url: 'quests/' + window.location.hash.substr(1) + '/quest.qst',
                        dataType: "text"
                    }).done(function(msg) {
                        start(msg, window.location.hash.substr(1));
                    }).fail(function () {
                        loadFromHashFailed();
                    });
                } else {
                    loadZip(data, window.location.hash.substr(1));
                }
            });
        } else {
            loadFromHashFailed();
        }
    }

    /**
     * Change default settings according to get parameters from URL
     */
    var getParamMode = getValParam('mode');
    if (getParamMode && $('#urq_mode option[value="' + getParamMode + '"]').length) $('#urq_mode').val(getParamMode);
    var getParamEncoding = getValParam('encoding');
    if (getParamEncoding && $('#game_encoding option[value="' + getParamEncoding + '"]').length) $('#game_encoding').val(getParamEncoding);
    var getParamLang = getValParam('lang');
    if (getParamLang && $('#lang_select option[value="' + getParamLang + '"]').length) {
        $('#lang_select').val(getParamLang);
        var element = document.getElementById('lang_select');
        var event = new Event('change');
        element.dispatchEvent(event);
    }
    if (getValParam('debug') === '1') {
        debug = true;
        $('#debugging_panel').show();
    }

    /**
     * Check the settings values in the global storage
     * and trigger event handlers of the corresponding checkboxes
     */
    Object.entries(settings).forEach(([key, defaultValue]) => {
        var storedValue  = localStorage.getItem(key);
        if (storedValue !== null) {
            var value = JSON.parse(storedValue);
        } else {
            var value = defaultValue;
        }
        if (typeof value === 'boolean') {
            $('#' + key).prop('checked', value);
        } else {
            $('#' + key).val(value);
        }
        $('#' + key).trigger('change');
    });

    /**
     * If variable urqw_hash is defined then load corresponding game.
     * If not, try to load game by link from get parameter,
     * otherwise from catalog, if there is something in hash
     */
    if (typeof urqw_hash === 'undefined') {
        var getParamUrl = getValParam('url');
        if (getParamUrl) {
            loadFromURL(getParamUrl);
        } else{
            loadFromHash();
        }
    } else {
        window.location.hash = urqw_hash;
        loadFromHash();
    }

    // Assign handlers to filters
    var filterTitleInput = $('#filter_title');
    var clearFilterTitle = $('#clear_filter_title');
    var showButton = $('#show_games');

    filterTitleInput.on('keydown', function(e) {
        if (e.key === 'Enter') {
            showButton.click();
        }
    });

    filterTitleInput.on('input', function() {
        $(this).next('span').toggle(Boolean($(this).val()));
    });

    clearFilterTitle.on('click', function() {
        filterTitleInput.val('').focus();
        $(this).closest('.input-group-btn').hide();
    });

    showButton.on('click', function() {
        loadFromHashFailed();
    });

    // Load game data from ZIP file
    function loadZip(data, gameName) {
        var zip = new JSZip(data);

        files = {};
        var qst = [];

        mode = $('#urq_mode').val();
        encoding = $('#game_encoding').val();

        // The manifest.json file must be read first
        // because its contents determine how other files will be read
        var manifestFile = getMetadataFile(zip, 'manifest.json');
if (manifestFile) {
            if (!parseManifest(manifestFile.asText())) return;
        }

        // iFiction record is read only if IFID is specified in manifest.json
        if (manifest['urqw_game_ifid']) {
            var iFictionFile = getMetadataFile(zip, manifest['urqw_game_ifid'] + '.iFiction');
    if (iFictionFile) {
                if (!parseIFiction(iFictionFile.asText())) return;
                iFictionFileKey = iFictionFile.name;
            }
        }

        // Read other files
        for (var key in zip.files) {
            if (!zip.files[key].dir) {
                var file = zip.file(key);
                var scriptCode;
                if (file.name.split('.').pop().toLowerCase() == 'qst') {
                    if (file.name.substr(0, 1) == '_' || file.name.indexOf('/_') != -1) {
                        qst.unshift(file);
                    } else {
                        qst.push(file);
                    }
                } else if (file.name.split('.').pop().toLowerCase() == 'css') {
                    $('#additionalstyle').append(file.asBinary());
                } else if (file.name.split('.').pop().toLowerCase() == 'js') {
                    if (encoding.toLowerCase() == 'utf-8') {
                        scriptCode = file.asText();
                    } else {
                        scriptCode = win2unicode(file.asBinary())
                    }
                    eval(scriptCode); // todo?
                } else {
                    files[file.name] = URL.createObjectURL(new Blob([(file.asArrayBuffer())], {type: MIME[file.name.split('.').pop()]}));
                }
            }
        }

        if (qst.length > 0) {
            quest = '';

            if (qst[0].name.lastIndexOf('/') != -1) {
                var dir = qst[0].name.substring(0, qst[0].name.lastIndexOf('/') + 1);

                for (var key in files) {
                    var newkey = key.substr(dir.length);
                    files[newkey] = files[key];
                    delete files[key];
                }

                if (iFictionFileKey) {
                    iFictionFileKey = iFictionFileKey.substr(dir.length);
                }
            }

            var questPart;
            for (var i = 0; i < qst.length; i++) {
                if (encoding.toLowerCase() == 'utf-8') {
                    questPart = qst[i].asText();
                } else {
                    questPart = win2unicode(qst[i].asBinary());
                }
                quest = quest + '\r\n' + questPart;
            }

            start(quest, gameName);
        }
    }

    /**
     *
     */
    function loadFromHashFailed() {
        $('#gamelist').empty();
        $.ajax({
            url: 'games.json',
            dataType: "json"
        }).done(function(quests) {
            // $('#open_game_url_form').show();
            var rss = $('#rss');
            if (!rss.is(':visible')) {
                $.ajax({
                    url: 'rss.xml',
                    type: 'HEAD',
                    success: function() {
                        rss.show();

                        // Add link to alternate feed if it doesn't exist yet

                        function getRssUrl() {
                            var currentUrl = window.location.href;
                            var lastSlash = currentUrl.lastIndexOf('/');
                            if (lastSlash !== currentUrl.length - 1) {
                                var filePart = currentUrl.substring(lastSlash + 1);
                                var isHtmlFile = /[^\/]+\.htm[^\/]*$/.test(filePart);
                                if (isHtmlFile) {
                                    var directoryPath = currentUrl.substring(0, lastSlash);
                                } else {
                                    var directoryPath = currentUrl;
                                }
                                return directoryPath + '/rss.xml';
                            }
                            return currentUrl + 'rss.xml';
                        }

                        var rssUrl = getRssUrl();
                        var existingLinks = $('head link[href="' + rssUrl + '"]');
                        if (existingLinks.length === 0) {
                            $('head').append(
                                $('<link>', {
                                    rel: 'alternate',
                                    href: rssUrl,
                                    title: 'UrqW Games',
                                    type: 'application/rss+xml'
                                })
                            );
                        }
                    }
                });
            }
            $('#filters_form').show();

            // Add unique game languages ??to dropdown list of filter
            var filterLangsUnique = [...new Set(quests
                .map(quest => quest.lang.split(';'))
                .flat())];

            var filterLangSelect = $('#filter_lang');
            var filterLang = filterLangSelect.val();
            if (!filterLang) {
                filterLang = 'any';
            }
            filterLangSelect.empty();

            var availableLangs = [
                ...filterLangsUnique.map(lang => [lang, i18next.t('language.' + lang)])
            ];
            var sortedAvailableLangs = availableLangs.sort((a, b) => a[1].localeCompare(b[1]));
            availableLangs = [['any', i18next.t('language.any')], ...sortedAvailableLangs];

            availableLangs.forEach(lang => {
                var option = $('<option>');
                option.val(lang[0]);
                option.text(lang[1]);
                option.attr('data-i18n', 'language.' + lang[0]);
                filterLangSelect.append(option);
            });
            filterLangSelect.val(filterLang);
            
            // Parameters of filtering
            var filterTitle = $('#filter_title').val();
            var filterSort = $('#filter_sort').val();

            // Filtering game list
            var filteredQuests = quests.filter(quest => {
                // Filter by language
                if (filterLang !== 'any' && !quest.lang.split(';').includes(filterLang)) {
                    return false;
                }

                // Filter by title (if regexp is entered)
                if (filterTitle) {
                    try {
                        // Try create regular expression
                        var regexp = new RegExp(filterTitle, 'i'); // Case insensitive
                        if (!regexp.test(quest.title)) {
                            return false;
                        }
                    } catch (error) {
                        // If error occurs while creating regexp, use simple string check
                        if (quest.title.toLowerCase().indexOf(filterTitle.toLowerCase()) === -1) {
                            return false;
                        }
                    }
                }

                return true;
            });

            // Sorting game list
            quests = filteredQuests.sort((a, b) => {
                switch (filterSort) {
                    case 'newest':
                        var dateA = new Date(a.date);
                        var dateB = new Date(b.date);
                        return dateB - dateA; // b - a to sort from largest to smallest
                    case 'oldest':
                        var dateA = new Date(a.date);
                        var dateB = new Date(b.date);
                        return dateA - dateB; // a - b to sort from smallest to largest
                    case 'alphabetically':
                        var titleA = a.title.toLowerCase();
                        var titleB = b.title.toLowerCase();
                        return titleA.localeCompare(titleB, document.documentElement.lang, {
                            numeric: true
                        });
                    default:
                        return 0;
                }
            });

            // Draw game list
            if (quests.length > 0) {
                var date;
                var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                // Since there is no native semantics of list, do it through role attributes
                $('#gamelist').attr('role', 'list');
                for (var i = 0; i < quests.length; i++) {
                    date = new Date(quests[i].date);
                    $('#gamelist').append(
                        '<div class="list-group-item" role="listitem" lang="' + quests[i].lang.split(';')[0] + '">' +
                        '<a href="#" class="gamelink" data-game="' + quests[i].folder + '">' +
                        '<div class="pull-right">' +
                        '<span class="text-muted">' + quests[i].author + '</span>' +
                        '</div>' +
                        '<h4 class="list-group-item-heading">' + quests[i].title + '</h4>' +
                        '<p class="list-group-item-text">' + quests[i].description + '</p><br>' +
                        '<p class="list-group-item-text" lang="' + document.documentElement.lang + '">(' + date.toLocaleDateString(document.documentElement.lang, dateOptions) + ')</p>' +
                        '</a></div>'
                    );
                }
            } else {
                // Remove list role because in this context it is not semantically list
                $('#gamelist').attr('role', null);
                $('#gamelist').append(
                    '<div class="list-group-item">' +
                    '<p class="list-group-item-text" data-i18n="no_games_found">' + i18next.t('no_games_found') + '</p>' +
                    '</a></div>'
                );
            }
        }).fail(function() {
            $('#gamelist').append('<p data-i18n="failed_load_game_list">' + i18next.t('failed_load_game_list') + '</p>')
        });

        $('#loading').hide();
        $('#choose-game').show();
    }

    /**
     * Game choice from list
     */
    $('#gamelist').on('click', '.gamelink', function() {
        window.location.hash = encodeURIComponent($(this).data('game'));
        loadFromHash();

        return false;
    });

    /**
     * Read file when change file-control
     */
    $('#quest').on('change', async function(e) {
        // Live list of selected files to array
        var selectedFiles = Array.from(e.target.files);
        files = {};
        var qst = [];

        if (selectedFiles.length == 1 && selectedFiles[0].name.split('.').pop().toLowerCase() == 'qsz') {
            var fileName = selectedFiles[0].name.split('.').slice(0, -1).join('.');
            var newFile = new File(
                [selectedFiles[0]],
                `${fileName}.zip`,
                    {
                        type: selectedFiles[0].type,
                        lastModified: selectedFiles[0].lastModified
                    }
                );
            selectedFiles[0] = newFile;
        }

        if (selectedFiles.length == 1 && selectedFiles[0].name.split('.').pop().toLowerCase() == 'zip') {
            var reader = new FileReader();
            var zip = selectedFiles[0];

            reader.onload = function() {
                loadZip(reader.result, zip.name);
            };
            reader.readAsBinaryString(zip);

            return;
        }

        mode = $('#urq_mode').val();
        encoding = $('#game_encoding').val();

        // The manifest.json file must be read first
        // because its contents determine how other files will be read
        var manifestFile = selectedFiles.find(file => file.name.toLowerCase() == 'manifest.json');
        if (manifestFile) {
            var manifestContent = await readMetadata(manifestFile);
            if (!parseManifest(manifestContent)) return;
            var index = selectedFiles.indexOf(manifestFile);
            selectedFiles.splice(index, 1);
        }

        // Read other files
        for (var i = 0; i < selectedFiles.length; i++) {
            if (selectedFiles[i].name.split('.').pop().toLowerCase() == 'qst') {
                qst.push(selectedFiles[i]);
            } else if (selectedFiles[i].name.toLowerCase() == 'style.css') {
                readStyle(selectedFiles[i]);
            } else if (selectedFiles[i].name.toLowerCase() == 'script.js') {
                readJs(selectedFiles[i]);
            } else {
                readFile(selectedFiles[i].name, selectedFiles[i]);
                // iFiction record is read only if IFID is specified in manifest.json
                if (manifest['urqw_game_ifid'] && selectedFiles[i].name.toLowerCase() == manifest['urqw_game_ifid'].toLowerCase() + '.ifiction') {
                    var iFictionContent = await readMetadata(selectedFiles[i]);
                    if (!parseIFiction(iFictionContent)) return;
                    iFictionFileKey = selectedFiles[i].name;
            }
        }
        }

        if (qst.length == 0) {
            return;
        }

        var name = qst[0].name;
        quest = [];
        var slices = qst.length;

        while (qst.length > 0) {
            readQst(qst.shift());
        }

        var loadq = setInterval(function() {
            if (slices == quest.length) {
                clearInterval(loadq);
                start(quest.join('\r\n'), name);
            }
        }, 200); // todo
    });

    /**
     * @param JSZip data
     */
    function getMetadataFile(zip, fileName) {
        fileName = fileName.toLowerCase();
var fileArray = [];
        for (var [name, file] of Object.entries(zip.files)) {
            if (!file.dir) {
                // Metadata of UrqW is file in root or in directory with one level of nesting
                var pathParts = file.name.split('/');
                if (pathParts.length <= 2 && pathParts.pop().toLowerCase() == fileName) {
                fileArray.push(file);
                }
            }
        }
        var metadataFile = false;
        if (fileArray.length == 1) {
            metadataFile = fileArray[0];
        } else if (fileArray.length > 1) {
            // In stupid situation of several files with the same name,
            // choose file from root or first one in alphabet
            metadataFile = fileArray.find(file => file.name.toLowerCase() == fileName);
            if (!metadataFile) {
                fileArray.sort((a, b) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                metadataFile = fileArray[0];
            }
        }
        return metadataFile;
    }

    /**
     * @param file
     */
    function readMetadata(file) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * @param (String)
     */
    function parseManifest(json) {
        try {
            var jsonObj = JSON.parse(json);
            if (jsonObj === null || jsonObj.manifest_version !== 1) {
                throw new Error('Invalid manifest version');
            }

            // Validate and save parameters from manifest.json to an object if they are set
            if (jsonObj.urqw_title) {
                manifest['urqw_title'] = jsonObj.urqw_title;
            }
            if (jsonObj.urqw_game_ifid) {
                manifest['urqw_game_ifid'] = jsonObj.urqw_game_ifid;
            }
            if (jsonObj.urqw_game_lang) {
                manifest['urqw_game_lang'] = jsonObj.urqw_game_lang;
            }
            if (jsonObj.game_encoding) {
                if (!['UTF-8', 'CP1251'].includes(jsonObj.game_encoding)) {
                    throw new Error('Invalid game encoding');
                }
                manifest['game_encoding'] = jsonObj.game_encoding;
            }
            if (jsonObj.urq_mode) {
                if (!['urqw', 'ripurq', 'dosurq'].includes(jsonObj.urq_mode)) {
                    throw new Error('Invalid URQ mode');
                }
                manifest['urq_mode'] = jsonObj.urq_mode;
            }

            // Override parameters from UI
            if (manifest['urq_mode']) mode = manifest['urq_mode'];
            if (manifest['game_encoding']) encoding = manifest['game_encoding'];

            // Add IFID metadata if it is specified
            if (manifest['urqw_game_ifid']) {
                var metaTag = document.createElement('meta');
                metaTag.setAttribute('prefix', 'ifiction: http://babel.ifarchive.org/protocol/iFiction/');
                metaTag.setAttribute('property', 'ifiction:ifid');
                metaTag.setAttribute('content', manifest['urqw_game_ifid']);
                document.head.appendChild(metaTag);
            }

            return true;
        } catch (error) {
            console.error('Error parsing manifest.json file:', error);
            alert(i18next.t('manifest_unsupported_format'));
            return false;
        }
    }

    /**
     * @param (String)
     */
    function parseIFiction(xml) {
    /**
     * Implemented on the basis of the Treaty of Babel,
     * revision 12 of 16 October 2024
     * https://babel.ifarchive.org/index.html
     * The 'urqw' value of the `<format>` tag is in informal use
     * and has not yet been formally incorporated into the Treaty.
     */
        try {
            // Parse XML
var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xml, 'application/xml');
            // Validate XML
            var errors = xmlDoc.getElementsByTagName('parsererror');
            if (errors.length > 0) {
                throw new Error('iFiction is invalid XML');
            }

            // Function to get tag value by path
            function getValue(path, defaultValue, HTML) {
                // Create an XPath expression
                var xpath = `/*[local-name()='ifindex']/${path.split('/').map(part => `*[local-name()='${part.trim()}']`).join('/')}`;
                // Get an element by XPath
                var element = xmlDoc.evaluate(xpath, xmlDoc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (element) {
                    if (HTML) {
                        var value = element.innerHTML;
                    } else {
                        var value = element.textContent;
                    }
                    value = value.trim();
                    // If the tag is found but empty, return an empty string
                    return value === '' ? '' : value;
                }
                // If the tag is not found, return the default value
                return defaultValue;
            }

            // Processing of mandatory tags

            // The ifid value in the iFiction record must match
            // the urqw_game_ifid value in the manifest.json file
            var ifid = getValue('story/identification/ifid', '');
            if (ifid !== manifest['urqw_game_ifid']) {
                throw new Error('IFIDs in iFiction record and manifest.json file do not match');
            }
            // The format value must be 'urqw'
            var format = getValue('story/identification/format', '');
            if (format !== 'urqw') {
                throw new Error('The value of the form tag is not urqw');
            }
            // The title and author tags must have non-empty values
            var title = getValue('story/bibliographic/title', '');
            var author = getValue('story/bibliographic/author', '');
            if (!title || !author) {
                throw new Error('The title and/or author tag does not contain data');
            }
            // The seriesnumber value (if given) must be a non-negative integer
            var seriesnumber = getValue('story/bibliographic/seriesnumber', '');
            if (seriesnumber && !/^\d+$/.test(seriesnumber)) {
                throw new Error('The seriesnumber value is not a non-negative integer');
            }
            // If seriesnumber is given, then it is required that series is also given
            var series = getValue('story/bibliographic/series', '');
            if (seriesnumber && !series) {
                throw new Error('The seriesnumber is given without the series');
            }

            // Get values ??of remaining optional tags
            var language = getValue('story/bibliographic/language', '');
            var headline = getValue('story/bibliographic/headline', '');
            var firstpublished = getValue('story/bibliographic/firstpublished', '');
            var genre = getValue('story/bibliographic/genre', '');
            // Get the description value along with the HTML content
            var description = getValue('story/bibliographic/description', '', true);
            var url = getValue('story/contacts/url', '');
            var authoremail = getValue('story/contacts/authoremail', '');

            // Metadata for table
            var metadata = {
                title: title,
                headline: headline,
                author_s: author,
                series: series,
                part_number: seriesnumber,
                genre: genre,
                primary_language: language,
                first_published: firstpublished,
                home_page: url,
                contact_email: authoremail
            };

            // Add data to the table in menu
            var metadataTable = $('#metadata_table');
            var tableRows = $();
            Object.keys(metadata).forEach(key => {
                // Empty values ??are not processed
                if (!metadata[key]) return;

                var value;
                switch (key) {
                    case 'part_number':
                        value = metadata[key];
                        break;
                    case 'primary_language':
                        value = language;
                        // Add the language name if it is in the localization resources
                        if (i18next.exists('language.' + language, { lng: i18next.options.fallbackLng })) {
                            value += ` (<span data-i18n="language.${language}">${i18next.t('language.' + language)}</span>)`;
                        }
                        break;
                    case 'first_published':
                        var date = new Date(firstpublished);
                        var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                        value = date.toLocaleDateString(document.documentElement.lang, dateOptions);
                        break;
                    case 'home_page':
                        value = `<a href="${url}" target="_blank">${decodeURIComponent(url)}</a>`;
                        break;
                    case 'contact_email':
                        var emailList = authoremail.split(',').map(email => email.trim());
                        if (emailList.length === 1) {
                            value = `<a href="mailto:${emailList[0]}" target="_blank">${emailList[0]}</a>`;
                        } else {
                            value = `<ul style="list-style-type: none;">
                                ${emailList.map(email => {
                                    return `<li><a href="mailto:${email}" target="_blank">${email}</a></li>`;
                                }).join('')}
                            </ul>`;
                        }
                        break;
                    default:
                        if (language) {
                            value = `<span lang="${language}">${metadata[key]}</span>`;
                        } else {
                            value = metadata[key];
                        }
                }

                var row = $(`
                    <tr>
                        <th data-i18n="${key}">${i18next.t(key)}</th>
                        <td>${value}</td>
                    </tr>
                `);
                tableRows = tableRows.add(row);
            });
            metadataTable.append(tableRows);

            // Add and show description to menu
            if (description) {
                // Remove all HTML tags except for <br/>
                var temp = $('<div>').html(description);
                temp.find('*:not(br)').contents().appendTo(temp);
                temp.find('*:not(br)').remove();
                var sanitizeHTML = temp.html();
                $('#game_description_text').html(sanitizeHTML);
                if (language) {
                    $('#game_description_text').attr('lang', language);
                }
                $('#game_description').show();
            }

            $('#download_ifiction').show();

            return true;
        } catch (error) {
            console.error('Error parsing iFiction record:', error);
            alert(i18next.t('ifiction_unsupported_format'));
            return false;
        }
    }

    /**
     * @param file
     */
    function readQst(file) {
        var reader = new FileReader();
        reader.onload = function() {
            if (file.name.substr(0, 1) == '_') {
                quest.unshift(reader.result);
            } else {
                quest.push(reader.result);
            }
        };

        reader.readAsText(file, encoding);
    }

    /**
     * @param filename
     * @param file
     */
    function readFile(filename, file) {
        var reader = new FileReader();
        reader.onload = function() {
            files[filename] = URL.createObjectURL(new Blob([reader.result], {type: MIME[filename.split('.').pop()]}));
        };

        reader.readAsArrayBuffer(file);
    }

    /**
     * @param file
     */
    function readStyle(file) {
        var style = new FileReader();
        style.onload = function() {
            $('#additionalstyle').append(style.result);
        };

        style.readAsText(file, encoding);
    }

    /**
     * @param file
     */
    function readJs(file) {
        var script = new FileReader();
        script.onload = function() {
            eval(script.result); // todo?
        };

        script.readAsText(file, encoding);
    }

    $('#open_game_url').click(function(e) {
        e.preventDefault();
        var url = $('#game_url').val();
        if (url) loadFromURL(url);
    });

    $('#game_url').keypress(function(e) {
        if (e.which === 13) { // Pressing Enter key in URL input field
            e.preventDefault();
            $('#open_game_url').click();
        }
    });

    /**
     * Start game
     *
     * @param {String} msg (body of quest)
     * @param {String} name (name of game or file)
     */
    function start(msg, name) {
        quest = null;
        window.onbeforeunload = function(e) {
            if (settings['close_page_confirmation']) {
                return 'confirm please';
            }
        };

        var descriptionID = 'textfield';
        window.addEventListener('devicemotion', function(event) {
            if (settings['announce_description_when_shaking'] && $('#' + descriptionID).is(':visible')) {
                var acceleration = event.accelerationIncludingGravity;
                if (!previousAcceleration) {
                    previousAcceleration = acceleration;
                    return;
                }
        
                var deltaX = Math.abs(acceleration.x - previousAcceleration.x);
                var deltaY = Math.abs(acceleration.y - previousAcceleration.y);
                var deltaZ = Math.abs(acceleration.z - previousAcceleration.z);
        
                previousAcceleration = acceleration;
        
                var shakeThreshold = Number($('#shake_sensitivity_threshold').val());
                if (deltaX > shakeThreshold && deltaY > shakeThreshold && deltaZ > shakeThreshold) {
                    var element = document.getElementById(descriptionID);
                    var content = element.innerText.trim();
                    announceForAccessibility(content);
                }
            }
        });

        $('#loading').hide();
        $('#infopanel').hide();
        $('#logo').hide();

        Game = new Quest(msg);
        Game.name = name;

        Game.init();

        GlobalPlayer = new Player();

        Game.sysVarInit();

        GlobalPlayer.Client.crtlInfo = $('#info');
        GlobalPlayer.Client.crtlInput = $('#input');
        GlobalPlayer.Client.crtlButtonField = $('#buttons');
        GlobalPlayer.Client.crtlTextField = $('#textfield');
        GlobalPlayer.Client.crtlInventory = $('#inventory');

        $('#choose-game').hide();
        $('#game').show();

        // Preventing hash changes when clicking on links with data-toggle="collapse"
        // Relevant for section links in the menu
        $('a[data-toggle="collapse"]').click(function(event) {
            event.preventDefault();
            var target = $(this).data('target');
            $(target).collapse('toggle');
        });

        // Add link to copy IFID to menu
        if (manifest['urqw_game_ifid']) {
            var ifidCopyLink = $('<a>', {
                href: '#',
                text: manifest['urqw_game_ifid'],
                class: 'copy-link'
            });

            var cell = $('#ifid_in_menu');
            cell.empty();
            cell.append(ifidCopyLink);

            ifidCopyLink.on('click', function(e) {
                e.preventDefault();
                var message;
                var timeout = 3000;
                try {
                    navigator.clipboard.writeText(manifest['urqw_game_ifid'])
                        .then(() => {
                            message = i18next.t('copied_to_clipboard');
                            $(this).text(message);
                            announceForAccessibility(message);
                        })
                        .catch(() => {
                            message = i18next.t('error_copying_to_clipboard');
                            $(this).text(message);
                            announceForAccessibility(message);
                        })
                        .finally(() => {
                            setTimeout(() => {
                                $(this).text(manifest['urqw_game_ifid']);
                            }, timeout);
                        });
                } catch (error) {
                    message = i18next.t('error_copying_to_clipboard');
                    $(this).text(message);
                    announceForAccessibility(message);
                    setTimeout(() => {
                        $(this).text(manifest['urqw_game_ifid']);
                    }, timeout);
                }
            });
        }

        // Move the interface language selector to the menu
        $('#language_in_infopanel').contents().detach().prependTo('#language_in_settings');

        GlobalPlayer.continue();
    }
});
