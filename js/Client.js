/**
 * @author narmiel
 */

/**
 * @constructor
 */
function Client() {
    /**
     * @type {Client}
     */
    var me = this;

    /**
     * play the game
     */
    me.play = function () {
        lock = true;

        GlobalParser.parse(Game);

        me.drawText();
        if (GlobalParser.status == GlobalParser.STATUS_END) {
            me.drawButtons();
            me.drawInventory();
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
                    me.play();
                }
                $('#info').text('[пауза ' + wait + ' ]');
            }, 50);
        } else if (GlobalParser.status == GlobalParser.STATUS_QUIT) {
            $('#info').text('[игра закончена]');
            $('#info').show();
        }
    };

    /**
     * Нарисовать текст
     */
    me.drawText = function () {
        var textField = $('#textfield');

        while (GlobalParser.text.length > 0) {
            var text = GlobalParser.text.shift();

            textField.append($('<div>').addClass('text').text(text[0] + ' '));

            if (text[1]) {
                textField.append('<div class="clearfix">');
            }
        }
    };

    /**
     * Нарисовать кнопки
     */
    me.drawButtons = function () {
        var buttonField = $('#buttons');

        while (GlobalParser.buttons.length > 0) {
            var button = GlobalParser.buttons.shift();
            if (Game.getLabel(button.label) === false) {
                buttonField.append($('<button class="list-group-item disabled">').text(button.desc + ' // phantom'));
            } else {
                buttonField.append($('<button class="list-group-item button" data-label="' + button.label + '">').text(button.desc));
            }
        }
    };

    /**
     * Нарисовать инвентарь
     */
    me.drawInventory = function () {
        var inventory =  $('#inventory');

        inventory.empty();
        inventory.append(me.drawItem('inv', 1));

        // обновляем список предметов
        $.each(Game.items, function(itemName, quantity) {
            inventory.append(me.drawItem(itemName, quantity));
        });

        if (inventory.find('> li').length == 0) {
            inventory.append('<li><a href="#" class="item_use">(Пусто)</a></li>');
        }
    };

    /**
     * @param {String} itemName
     * @param {int} quantity
     */
    me.drawItem = function (itemName, quantity) {

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
            } else {
                if (quantity > 1) {
                    itemName = itemName + ' (' + quantity + ')';
                }
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
    };
}