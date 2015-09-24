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
 * @type {boolean}
 */
lock = true;

/**
 * @type {Parser}
 */
GlobalParser = null;

/**
 * @type {Client}
 */
GlobalClient = null;


$(function() {
    /**
     * Инициализация
     */
    GlobalClient = new Client();
    GlobalParser = new Parser();

    /**
     * Загрузить из хеша
     */
    function loadFromHash() {
        $('#loading').show();
        $('#choose-game').hide();

        if (window.location.hash.length > 0) {
            $.ajax({
                url: 'quests/' + window.location.hash.substr(1) + '/quest.qst',
                dataType: "text",
                contentType: "text/plain; charset=windows-1251"
            }).done(function(msg) {
                $('#loading').hide();

                Game = new Quest(msg);
                Game.init();

                $('#choose-game').hide();
                $('#game').show();

                GlobalClient.play();
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
    if (window.location.hash.length > 0) {
        loadFromHash();
    } else {
        $('#loading').hide();
        $('#choose-game').show();
    }

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
            Game = new Quest(reader.result);
            Game.init();

            $('#choose-game').hide();
            $('#game').show();

            GlobalClient.play();
        };
        reader.readAsText(file, 'CP1251');
    });
});
