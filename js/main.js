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

$(function() {
    $('#something_wrong').hide();

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
                start(msg, window.location.hash.substr(1));
            }).fail(function () {
                $('#loading').hide();
                $('#choose-game').show();
            });
        } else {
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
    $('.gamelink').on('click', function() {
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
            } else {
                files[e.target.files[i].name] = e.target.files[i];

//                objectURL = window.URL.createObjectURL(e.target.files[i]);
            }
        }

        if (!qst) {
            return;
        }

        // read file to global variable and start quest
        var reader = new FileReader();
        reader.onload = function() {
            start(reader.result, qst.name);
        };
        reader.readAsText(qst, 'CP1251');
    });

    /**
     * Запуск
     *
     * @param {String} msg тело квеста
     * @param {String} name имя игры или файла
     */
    function start(msg, name) {
        $('#loading').hide();

        Game = new Quest(msg);
        Game.name = name;

        Game.init();

        GlobalPlayer = new Player;

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
