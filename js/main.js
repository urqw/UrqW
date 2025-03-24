/**
 * Copyright (C) 2015, 2016 Akela <akela88@bk.ru>
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

$(document).ready(function() {
    addVersionOnPage();
});

function addVersionOnPage() {
    document.title = document.title + ' ' + urqw_version;

    var versionElements = document.getElementsByClassName('urqw_version');
    for(var i = 0; i < versionElements.length; i++) {
        versionElements[i].innerHTML = urqw_version;
    }
}

// Загрузка

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
     * Загрузить из хеша
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
     * Попробуем загрузить квест, если в хеше что-то есть
     */
    loadFromHash();

    function loadZip(data, name) {
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

            start(quest, name);
        }
    }

    /**
     *
     */
    function loadFromHashFailed() {
        $.ajax({
            url: 'games.json',
            dataType: "json"
        }).done(function(quests) {
            var date;
            var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
            for (var i = 0; i < quests.length; i++) {
                date = new Date(quests[i].date);
                $('.gamelist').append(
                    '<a href="#" class="list-group-item gamelink" data-game="' + quests[i].folder + '">' +
                    '<div class="pull-right">' +
                    '<span class="text-muted">' + quests[i].author + '</span>' +
                    '</div>' +
                    '<h4 class="list-group-item-heading">' + quests[i].title + '</h4>' +
                    '<p class="list-group-item-text">' + quests[i].description + '</p><br>' +
                    '<p class="list-group-item-text">(' + date.toLocaleDateString(undefined, dateOptions) + ')</p>' +
                    '</a>'
                );
            }
        }).fail(function() {
            $('.gamelist').append('<p><span role="alert">Не удалось загрузить список квестов.</span> Скорее всего, у вас браузер на основе Chromium (Chrome, Яндекс Браузер, Opera и др.), и вы запустили UrqW локально. Безопасность Chromium запрещает обращаться к каким бы то ни было локальным файлам и считывать их автоматически. Это исправляется, если запустить Chrome с флагом "--allow-file-access-from-files". В вебе такой проблемы ни у кого не будет, речь только о локальной работе. Вы всё ещё можете выбрать файлы игры вручную из папки quests и поиграть.</p>')
        });

        $('#loading').hide();
        $('#choose-game').show();
    }

    /**
     * Выбор игры из списка
     */
    $('.gamelist').on('click', '.gamelink', function() {
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
            alert('Игра имеет файл manifest.json в неподдерживаемом формате.');
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
            metaTag.setAttribute('prefix', 'ifiction: https://babel.ifarchive.org/protocol/iFiction/');
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

    /**
     * Запуск
     *
     * @param {String} msg тело квеста
     * @param {String} name имя игры или файла
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
