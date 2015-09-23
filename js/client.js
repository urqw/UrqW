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

    if (window.location.hash.length > 0) {
        $.ajax({
            url: 'quests/' + window.location.hash.substr(1) + '/quest.qst',
            dataType: "text",
            contentType: "text/plain; charset=windows-1251",
            success: function() {

            }
        }).success(function(msg) {
            Game = new Quest(msg);
            Game.init();

            $('#choose-game').hide();
            $('#game').show();

            GlobalParser = new Parser();

            play();
        });
    }

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
            $('#info').hide();
            play();
        }
    });

    $('#input_enter').on('click', function() {
        if (GlobalParser.status == GlobalParser.STATUS_INPUT) {
            var input = $('#input');
            if (input.find('input').val() != '') {
                input.hide();

                //todo нехорошо так делать
                Game.setVar(GlobalParser.inf, input.find('input').val());

                play();
            } else {
                input.addClass('has-error');
            }
        }
    });

    /**
     * start the game
     */
    function play() {
        lock = true;

        GlobalParser.parse(Game);

        drawText();
        if (GlobalParser.status == GlobalParser.STATUS_END) {
            drawButtons();
            drawInventory();
            lock = false;
        } else if (GlobalParser.status == GlobalParser.STATUS_ANYKEY) {
            $('#info').text('[нажмите любую клавишу]');
            $('#info').show();
        } else if (GlobalParser.status == GlobalParser.STATUS_INPUT) {
            $('#input').removeClass('has-error');
            $('#input').find('input').val('');
            $('#input').show();
        } else if (GlobalParser.status == GlobalParser.STATUS_PAUSE) {
            var wait = GlobalParser.inf;
            $('#info').show();

            var interval = setInterval(function() {
                wait = wait - 50;
                if (wait <= 0) {
                    clearInterval(interval);
                    $('#info').hide();
                    play();
                }
                refreshTimer();
            }, 50);

            function refreshTimer() {
                $('#info').text('[пауза ' + wait + ' ]');
            }

        } else if (GlobalParser.status == GlobalParser.STATUS_QUIT) {
            $('#info').text('[игра закончена]');
            $('#info').show();
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
