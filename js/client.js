/**
 * @author narmiel
 */

/**
 * @type {Quest}
 */
Game = null;
lock = true;
GlobalParser = null;

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

            GlobalParser = new Parser();

            play();
        };
        reader.readAsText(file, 'CP1251');
    });

    $('body').on('click', '.button', function() {
        if (lock) return;

        $('#textfield').empty();
        $('#buttons').empty();

        Game.to($(this).data('label'));

        play();
    });

    $(document).keypress(function(){
        if (GlobalParser.status == GlobalParser.STATUS_ANYKEY) {
            $('#anykey').hide();
            play();
        }
    });

    /**
     * start the game
     */
    function play() {
        lock = true;

        GlobalParser.parse(Game);

        if (GlobalParser.status == GlobalParser.STATUS_END) {
            drawText();
            drawButtons();
            drawInventory();

            lock = false;
        } else if (GlobalParser.status == GlobalParser.STATUS_ANYKEY) {
            drawText();

            $('#anykey').show();
        }
    }

    function drawText() {
        var textField = $('#textfield');

        while (GlobalParser.text.length > 0) {
            var text = GlobalParser.text.shift();

            textField.append($('<div>').addClass('text').text(text[0] + ' '));

            if (text[1]) {
                textField.append('<div class="clearfix">');
            }
        }
    }

    function drawButtons() {
        var buttonField = $('#buttons');

        while (GlobalParser.buttons.length > 0) {
            var button = GlobalParser.buttons.shift();
            buttonField.append($('<button class="list-group-item button" data-label="' + button.label + '">').text(button.desc));
        }
    }

    function drawInventory() {
        var inventory =  $('#inventory');

        inventory.empty();
        var have_items = false;

        // обновляем список предметов
        $.each(Game.items, function(index, value) {
            inventory.append('<li><a href="#">' + index + ' (' + value + ')</a></li>');
            have_items = true;
        });

        if (!have_items) {
            inventory.append('<li><a href="#">(Пусто)</a></li>');
        }
    }
});
