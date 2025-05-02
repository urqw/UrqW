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
var manifest_urqw_title;
var manifest_game_encoding;
var manifest_urqw_game_lang;
var manifest_urqw_game_ifid;
var manifest_urq_mode;

$(function() {
    $('#something_wrong').hide();
    $('#infopanel').show();

    $('#additionalstyle').find('style').empty();

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

    /**
     * Try to load game by link from get parameter,
     * otherwise from catalog, if there is something in hash
     */
    var getParamUrl = getValParam('url');
    if (getParamUrl) {
        loadFromURL(getParamUrl);
    } else{
        loadFromHash();
    }

    // Assign handlers to filters
    var filtersContainer = $('#filters');
    var showButton = $('#show_games');

    filtersContainer.on('keyup', function(e) {
        if (e.key === 'Enter') {
            showButton.click();
        }
    });

    showButton.on('click', function() {
        loadFromHashFailed();
    });

    function loadZip(data, gameName) {
        var zip = new JSZip(data);

        files = {};
        var qst = [];

        mode = $('#urq_mode').val();
        encoding = $('#game_encoding').val();

        // The manifest.json file must be read first
        // because its contents determine how other files will be read
        var manifestArray = [];
        for (var [name, file] of Object.entries(zip.files)) {
            if (!file.dir) {
                // Manifest of UrqW is file in root or in directory with one level of nesting
                var pathParts = file.name.split('/');
                if (pathParts.length <= 2 && pathParts.pop().toLowerCase() == 'manifest.json') {
                manifestArray.push(file);
                }
            }
        }
        var manifestFile;
        if (manifestArray.length == 1) {
            manifestFile = manifestArray[0];
        } else if (manifestArray.length > 1) {
            // In stupid situation of several manifests,
            // choose file from root or first one in alphabet
            manifestFile = manifestArray.find(file => file.name.toLowerCase() == 'manifest.json');
            if (!manifestFile) {
                manifestArray.sort((a, b) => {
                    if (a.name < b.name) return -1;
                    if (a.name > b.name) return 1;
                    return 0;
                });
                manifestFile = manifestArray[0];
            }
        }
        if (manifestFile) {
            if (!parseManifest(manifestFile.asText())) return;
        }

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
                    $('#additionalstyle').find('style').append(file.asBinary());
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
            var date;
            var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };

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
                    var regexp = new RegExp(filterTitle, 'i'); // Case insensitive
                    if (!regexp.test(quest.title)) {
                        return false;
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
                        return titleA.localeCompare(titleB);
                    default:
                        return 0;
                }
            });

            // Draw game list
            for (var i = 0; i < quests.length; i++) {
                date = new Date(quests[i].date);
                // Since there is no native semantics of list, do it through role attributes
                $('#gamelist').attr('role', 'list');
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
            var manifestJson = await readManifest(manifestFile);
            if (!parseManifest(manifestJson)) return;
            var index = selectedFiles.indexOf(manifestFile);
            selectedFiles.splice(index, 1);
        }
        for (var i = 0; i < selectedFiles.length; i++) {
            if (selectedFiles[i].name.split('.').pop().toLowerCase() == 'qst') {
                qst.push(selectedFiles[i]);
            } else if (selectedFiles[i].name.toLowerCase() == 'style.css') {
                readStyle(selectedFiles[i]);
            } else if (selectedFiles[i].name.toLowerCase() == 'script.js') {
                readJs(selectedFiles[i]);
            } else {
                readFile(selectedFiles[i].name, e.target.files[i]);
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
     * @param file
     */
    function readManifest(file) {
    return new Promise((resolve, reject) => {
            var manifest = new FileReader();
            manifest.onload = () => resolve(manifest.result);
            manifest.onerror = reject;
            manifest.readAsText(file, 'UTF-8');
        });
    }

    /**
     * @param (String)
     */
    function parseManifest(json) {
        var jsonObj;
        try {
            jsonObj = JSON.parse(json);
        } catch (e) {
            jsonObj = null;
        }
        if (jsonObj === null || jsonObj.manifest_version !== 1) {
            alert(i18next.t('manifest_unsupported_format'));
            return false;
        }

        manifest_urqw_title = jsonObj.urqw_title;
        manifest_game_encoding = jsonObj.game_encoding;
        manifest_urqw_game_lang = jsonObj.urqw_game_lang;
        manifest_urqw_game_ifid = jsonObj.urqw_game_ifid;
        manifest_urq_mode = jsonObj.urq_mode;

        // Override parameters from UI
        if (manifest_urq_mode) mode = manifest_urq_mode;
        if (manifest_game_encoding) encoding = manifest_game_encoding;

        // Add IFID metadata if it is specified
        if (manifest_urqw_game_ifid) {
            var metaTag = document.createElement('meta');
            metaTag.setAttribute('prefix', 'ifiction: http://babel.ifarchive.org/protocol/iFiction/');
            metaTag.setAttribute('property', 'ifiction:ifid');
            metaTag.setAttribute('content', manifest_urqw_game_ifid);
            document.head.appendChild(metaTag);
        }

        return true;
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
            $('#additionalstyle').find('style').append(style.result);
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
            return 'confirm please';
        };

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

        GlobalPlayer.continue();
    }
});
