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
        lock = true;

        var textField = $('#textfield');
        var buttonField = $('#buttons');

        textField.empty();
        buttonField.empty();

        var P = new Parser();

        responce = P.parse(Game);

        if (responce.status == P.STATUS_END) {
            $.each(responce.text, function (index, value) {
                textField.append($('<div>').addClass('text').text(value[0] + ' '));

                if (value[0]) {
                    textField.append('<div class="clearfix">');
                }
            });

            $.each(responce.buttons, function (index, value) {
                var button = $('<button class="list-group-item button" data-label="' + value.label + '">').text(value.desc);
                buttonField.append(button);
            });

            var inventory =  $('#inventory');

            inventory.empty();
            var have_items = false;

            // обновляем список предметов
            $.each(Game.items, function(index, value) {
                inventory.append('<li><a href="#">' + index + ' (' + value + ')</a></li>');
                have_items = true;
            });

            if (!have_items) {
                $('#inventory').append('<li><a href="#">(Пусто)</a></li>');
            }

            lock = false;
        } else if (responce.status == P.STATUS_ANYKEY) {
            $.each(responce.text, function (index, value) {
                textField.append($('<div>').addClass('text').text(value[0] + ' '));

                if (value[0]) {
                    textField.append('<div class="clearfix">');
                }
            });

            $('#anykey').show();
        }
    }

    $('body').on('click', '.button', function() {
        if (lock) return;

        Game.to($(this).data('label'));

        play();
    });
});
