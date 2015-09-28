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
                start(msg);
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
        window.location.hash = $(this).data('game');
        loadFromHash();

        return false;
    });

    /**
     * Read file when change file-control
     */
    $('#quest').on('change', function(e) {
        var file = e.target.files[0];

        if (!file) {
            return;
        }

        // read file to global variable and start quest
        var reader = new FileReader();
        reader.onload = function() {
            start(reader.result);
        };
        reader.readAsText(file, 'CP1251');
    });

    /**
     * Запуск
     *
     * @param {String} msg
     */
    function start(msg) {
        $('#loading').hide();

        Game = new Quest(msg);
        Game.init();

        GlobalPlayer = new Player;

        $('#choose-game').hide();
        $('#game').show();

        GlobalPlayer.play();
    }
});
