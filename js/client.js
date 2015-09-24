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

                GlobalParser = new Parser();

                play();
            }).fail(function () {
                $('#loading').hide();
                $('#choose-game').show();
            });
        } else {
            $('#loading').hide();
            $('#choose-game').show();
        }
    }

    if (window.location.hash.length > 0) {
        loadFromHash();
    } else {
        $('#loading').hide();
        $('#choose-game').show();
    }

    $('.gamelink').on('click', function() {
        window.location.hash = $(this).data('game');
        loadFromHash();
        return false;
    });

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

        var label = $(this).data('label');

        // common todo рефакторить
        var common_label;
        if (Game.getVar('common') !== 0) {
            common_label = 'common_' + Game.getVar('common');
        } else {
            common_label = 'common';
        }

        if (Game.labels[common_label] != undefined) {
            if (Game.getLabel(label) !== false) {
                GlobalParser.proc_position.push(Game.getLabel(label));
                GlobalParser.flow++;
                GlobalParser.flowStack[GlobalParser.flow] = [];
                Game.to(common_label);
            }
        } else {
            Game.to(label, true);
        }

        Game.previousLoc = Game.currentLoc;
        Game.currentLoc = label;

        play();
    });

    $(document).keypress(function(e){
        if (GlobalParser.status == GlobalParser.STATUS_ANYKEY) {

            if (GlobalParser.inf.length > 0) {
                Game.setVar(GlobalParser.inf, e.keyCode);
            }

            $('#info').hide();
            play();
        } else if (GlobalParser.status == GlobalParser.STATUS_END) {
            if (e.keyCode == 13) {
                $('#buttons').find('button').each(function(index) {
                    if ($(this).hasClass('active')) {
                        $(this).click();
                    }
                });
            }

            if (e.keyCode == 38 || e.keyCode == 40) {


                var buttonField = $('#buttons');
                var active = 0;
                buttonField.find('button').each(function(index) {
                    if ($(this).hasClass('active')) {
                        active = index;
                    }
                });
            }

            var toActive;

            if (e.keyCode == 38) {
                toActive = active - 1;
                if (toActive < 0) toActive = buttonField.find('button').length - 1;

                buttonField.find('button').each(function(index) {
                    if (index == toActive) {
                        $(this).addClass('active');
                    } else {
                        $(this).removeClass('active');
                    }
                });
            } else if (e.keyCode == 40) {
                toActive = active + 1;
                if (toActive > buttonField.find('button').length - 1) toActive = 0;

                buttonField.find('button').each(function(index) {
                    if (index == toActive) {
                        $(this).addClass('active');
                    } else {
                        $(this).removeClass('active');
                    }
                });
            }
        }
    });

    $('#input').find('input').keypress(function(e){
        if (GlobalParser.status == GlobalParser.STATUS_INPUT && e.keyCode == 13) {
            $('#input_enter').click();
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
            $('#input').find('input').focus();
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
            if (Game.getLabel(button.label) === false) {
                buttonField.append($('<button class="list-group-item disabled">').text(button.desc + ' // phantom'));
            } else {
                buttonField.append($('<button class="list-group-item button" data-label="' + button.label + '">').text(button.desc));
            }
        }
    }

    function drawInventory() {
        var inventory =  $('#inventory');

        inventory.empty();
        inventory.append(drawItem('inv', 1));

        // обновляем список предметов
        $.each(Game.items, function(itemName, quantity) {
            inventory.append(drawItem(itemName, quantity));
        });

        if (inventory.find('> li').length == 0) {
            inventory.append('<li><a href="#" class="item_use">(Пусто)</a></li>');
        }
    }

    /**
     * @param {String} itemName
     * @param {int} quantity
     */
    function drawItem(itemName, quantity) {

        var actions = [];

        $.each(Game.useLabels, function(index, value) {
            if (itemName.toLowerCase() == index.substr(4, itemName.length).toLowerCase()) {
                var actionName = index.substr(itemName.length + 5);

                if (actionName == '') {
                    actionName = 'Осмотреть';
                }

                actions.push([actionName, value]);
            }
        });

        if (actions.length == 0 && itemName != 'inv') {
            return '<li><a href="#" class="item_use">' + itemName + ' (' + quantity + ')</a></li>';
        } else if (actions.length > 0)  {

            if (itemName == 'inv') {
                itemName = 'Инвентарь';
            }

            var li = $('<li>').addClass('dropdown-submenu').append($('<a href="#" class="item_use">').text(itemName));
            var ul = $('<ul class="dropdown-menu">');
            var li2 = $('<li class="menu-item">')

            for (var i = 0; i < actions.length; i++) {
                li2.append($('<a href="#" class="item_use" data-loc="' + actions[i][1] + '">').text(actions[i][0]));
            }

            ul.append(li2);
            li.append(ul);

            return li;
        }
    }

    $('body').on('click', '.item_use', function() {
        if (lock) return;

        var loc = $(this).data('loc');

        if (loc !== undefined) {

            $('#textfield').empty();
            $('#buttons').empty();

            GlobalParser.proc_position.push(Game.getLabel(Game.currentLoc));
            GlobalParser.flow++;
            GlobalParser.flowStack[GlobalParser.flow] = [];
            Game.position = loc;

            play();
        }

        return false;
    });
});
