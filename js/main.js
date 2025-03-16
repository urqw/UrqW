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
var manifest_urqw_title;
var manifest_urqw_game_lang;
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

        for (var key in zip.files) {
            if (!zip.files[key].dir) {
                var file = zip.file(key);
                if (file.name.split('.').pop().toLowerCase() == 'qst') {
                    if (file.name.substr(0, 1) == '_' || file.name.indexOf('/_') != -1) {
                        qst.unshift(file);
                    } else {
                        qst.push(file);
                    }
                } else if (file.name.split('.').pop().toLowerCase() == 'css') {
                    $('#additionalstyle').find('style').append(file.asBinary());
                } else if (file.name.split('.').pop().toLowerCase() == 'js') {
                    eval(win2unicode(file.asBinary())); // todo?
                } else if (file.name.split('.').pop().toLowerCase() == 'json') {
                    parseManifest(file.asText());
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

            for (var i = 0; i < qst.length; i++) {
                quest = quest + '\r\n' + win2unicode(qst[i].asBinary());
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
                    '<p class="list-group-item-text">' + quests[i].description + '</p>' +
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
    $('#quest').on('change', function(e) {
        files = {};
        var qst = [];

        if (e.target.files.length == 1 && e.target.files[0].name.split('.').pop().toLowerCase() == 'zip') {
            var reader = new FileReader();
            var zip = e.target.files[0];

            reader.onload = function() {
                mode = $('#urq_mode').val();
                loadZip(reader.result, zip.name);
            };
            reader.readAsBinaryString(zip, 'CP1251');

            return;
        }

        for (var i = 0; i < e.target.files.length; i++) {
            if (e.target.files[i].name.split('.').pop().toLowerCase() == 'qst') {
                qst.push(e.target.files[i]);
            } else if (e.target.files[i].name.toLowerCase() == 'style.css') {
                readStyle(e.target.files[i]);
            } else if (e.target.files[i].name.toLowerCase() == 'script.js') {
                readJs(e.target.files[i]);
            } else if (e.target.files[i].name.toLowerCase() == 'manifest.json') {
                readManifest(e.target.files[i]);
            } else {
                readFile(e.target.files[i].name, e.target.files[i]);
            }
        }

        if (qst.length == 0) {
            return;
        }

        var name = qst[0].name;
        mode = $('#urq_mode').val();
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
    function readQst(file) {
        var reader = new FileReader();
        reader.onload = function() {
            if (file.name.substr(0, 1) == '_') {
                quest.unshift(reader.result);
            } else {
                quest.push(reader.result);
            }
        };

        reader.readAsText(file, 'CP1251');
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

        style.readAsText(file, 'CP1251');
    }

    /**
     * @param file
     */
    function readJs(file) {
        var script = new FileReader();
        script.onload = function() {
            eval(script.result); // todo?
        };

        script.readAsText(file, 'CP1251');
    }

    /**
     * @param file
     */
    function readManifest(file) {
        var manifest = new FileReader();
        manifest.onload = function() {
            parseManifest(manifest.result);
        };

        manifest.readAsText(file, 'utf-8');
    }

    /**
     * @param (String)
     */
    function parseManifest(json) {
        var jsonObj = JSON.parse(json);
        manifest_urqw_title = jsonObj.urqw_title;
        manifest_urqw_game_lang = jsonObj.urqw_game_lang;
        manifest_urq_mode = jsonObj.urq_mode;
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
