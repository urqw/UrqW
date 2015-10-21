/**
 * @author narmiel
 *
 * Загрузка
 */

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

/**
 * 
 */
var mode;

$(function() {
    $('#something_wrong').hide();
    $('#infopanel').show();

    /**
     * Загрузить из хеша
     */
    function loadFromHash() {
        $('#loading').show();
        $('#choose-game').hide();

        if (window.location.hash.length > 0) {
            $.ajax({
                url: 'quests/' + window.location.hash.substr(1) + '/quest.qst',
                dataType: "text"
            }).done(function(msg) {
                $.ajax({
                    url: 'quests/' + window.location.hash.substr(1) + '/style.css',
                    dataType: "text"
                }).complete(function(style) {
                    if (style.status == 200) {
                        $('#additionalstyle').find('style').empty();
                        $('#additionalstyle').find('style').append(style.responseText);
                    }
                    start(msg, window.location.hash.substr(1));
                });
            }).fail(function () {
                $('#loading').hide();
                $('#choose-game').show();
            });
        } else {
            $.ajax({
                url: 'games.json',
                dataType: "json"
            }).done(function(quests) {
                for (var i = 0; i < quests.length; i++) {
                    $('.gamelist').append(
                        '<a href="#" class="list-group-item gamelink" data-game="' + quests[i].folder + '">' +
                        '<div class="pull-right">' +
                        '<span class="text-muted">' + quests[i].author + '</span>' +
                        '</div>' +
                        '<h4 class="list-group-item-heading">' + quests[i].title + '</h4>' +
                        '<p class="list-group-item-text">' + quests[i].description + '</p>' +
                        '</a>'
                    );
                }
            });

            $('#loading').hide();
            $('#choose-game').show();
        }
    }

    /**
     * Попробуем загрузить квест если в хеше что-то есть
     */
    loadFromHash();

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
        var qst = null;

        for (var i =0; i < e.target.files.length; i++) {
            if (qst == null && e.target.files[i].name.split('.').pop() == 'qst') {
                qst = e.target.files[i];
            } else if (e.target.files[i].name == 'style.css') {
                readStyle(e.target.files[i]);
            } else {
                readFile(e.target.files[i].name, e.target.files[i]);
            }
        }

        if (!qst) {
            return;
        }

        // read file to global variable and start quest
        var reader = new FileReader();
        reader.onload = function() {
            mode = $('#urq_mode').val();
            setTimeout(function() {
                start(reader.result, qst.name);
            }, 200); // todo
        };
        reader.readAsText(qst, 'CP1251');
    });

    /**
     * @param filename
     * @param file
     */
    function readFile(filename, file) {
        var reader = new FileReader();
        reader.onload = function() {
            files[filename] = reader.result;
        };
        reader.readAsDataURL(file);
    }

    /**
     * @param file
     */
    function readStyle(file) {
        var style = new FileReader();
        style.onload = function() {
            $('#additionalstyle').find('style').empty();
            $('#additionalstyle').find('style').append(style.result);
        };

        style.readAsText(file, 'CP1251');
    }

    /**
     * Запуск
     *
     * @param {String} msg тело квеста
     * @param {String} name имя игры или файла
     */
    function start(msg, name) {
        window.onbeforeunload = function(e) {
            return 'confirm please';
        };
        
        $('#loading').hide();
        $('#infopanel').hide();
        $('#logo').hide();

        Game = new Quest(msg);
        Game.name = name;

        Game.init();

        GlobalPlayer = new Player;
        
        if (mode) GlobalPlayer.setVar('urq_mode', mode);

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
