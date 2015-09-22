/**
 * @author narmiel
 */

/**
 * @type {Quest}
 */
Game = null;
lock = true;

$(function() {

    /**
     * read file when change file-control
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

            play();
        };
        reader.readAsText(file, 'CP1251');
    });

    /**
     * start the game
     */
    function play() {
        var textField = $('#textfield');
        var buttonField = $('#buttons');

        textField.empty();
        buttonField.empty();

        var P = new Parser();

        responce = P.parse(Game);

        $.each(responce.text, function (index, value) {
            textField.text(textField.text() + value);
        });

        $.each(responce.buttons, function (index, value) {
            var button = $('<button class="button" data-label="' + value.label + '">').text(value.desc);
            buttonField.append(button);
        });

        lock = false;
    }

    $('body').on('click', '.button', function() {
        if (lock) return;

        Game.to($(this).data('label'));

        play();
    });
});
