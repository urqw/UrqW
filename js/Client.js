/**
 * @author narmiel
 */

/**
 * @constructor
 */
function Client() {
    /**
     * @type {*|jQuery|HTMLElement}
     */
    this.crtlInfo;

    /**
     * @type {*|jQuery|HTMLElement}
     */
    this.crtlInput;

    /**
     * @type {*|jQuery|HTMLElement}
     */
    this.crtlButtonField;

    /**
     * @type {*|jQuery|HTMLElement}
     */
    this.crtlTextField;

    /**
     * @type {*|jQuery|HTMLElement}
     */
    this.crtlInventory;

    /**
     * @type {Client}
     */
    var me = this;

    var noRendered = true;
    /**
     * render
     */
    this.render = function (data) {
        me.drawText();
        if (data.status == PLAYER_STATUS_END) {
            if (noRendered) {
                GlobalPlayer.buttons.unshift({
                    label: '#load$',
                    desc: 'Загрузить игру'
                });

                noRendered = false;
            }
            
            me.drawButtons();
            me.drawInventory();
        } else if (data.status == PLAYER_STATUS_ANYKEY) {
            this.crtlInfo.text('[нажмите любую клавишу]');
            this.crtlInfo.show();
        } else if (data.status == PLAYER_STATUS_INPUT) {
            this.crtlInput.removeClass('has-error');
            this.crtlInput.find('input').val('');
            this.crtlInput.show();
            this.crtlInput.find('input').focus();
        } else if (data.status == PLAYER_STATUS_PAUSE) {
            me.drawButtons();
            me.drawInventory();

            var wait = GlobalPlayer.inf;
            setTimeout(function() {
                if (GlobalPlayer.status == PLAYER_STATUS_PAUSE) {
                    GlobalPlayer.continue();
                }
            }, wait);
        } else if (data.status == PLAYER_STATUS_QUIT) {
            this.crtlInfo.text('[игра закончена]');
            this.crtlInfo.show();
        }
    };

    /**
     * очистка экрана
     */
    this.cls = function() {
        this.crtlTextField.empty();
        this.crtlButtonField.empty();
    };

    /**
     * Нарисовать текст
     */
    this.drawText = function () {
        $.each(GlobalPlayer.text, function(index, text) {
            var div = $('<div>').html(text[0]);

            if (div.find('*').length == 0) {
                div.addClass('text');
            }

            div.find('img').each(function(index) {
                if (files === null) {
                    $(this).attr('src', 'quests/' + Game.name + '/' + $(this).attr('src'));
                } else {
                    $(this).attr('src', files[$(this).attr('src')]);
                }
            });

            me.crtlTextField.append(div);

            if (text[1]) {
                me.crtlTextField.append('<div class="clearfix">');
            }

        });

        GlobalPlayer.text = [];
    };

    /**
     * Нарисовать кнопки
     */
    this.drawButtons = function () {
        $.each(GlobalPlayer.buttons, function(index, button) {
            var buttonCtrl = $('<button class="list-group-item button" data-label="' + button.label + '">').text(button.desc);

            if (button.label == '#load$') {
                buttonCtrl.addClass('list-group-item-warning');
            }

            me.crtlButtonField.append(buttonCtrl);
        });

        GlobalPlayer.buttons = [];
    };

    /**
     * Нарисовать инвентарь
     */
    this.drawInventory = function () {
        this.crtlInventory.empty();
        this.crtlInventory.append(me.drawItem('inv', 1));

        // обновляем список предметов
        $.each(Game.items, function(itemName, quantity) {
            me.crtlInventory.append(me.drawItem(itemName, quantity));
        });

        if (this.crtlInventory.find('> li').length == 0) {
            this.crtlInventory.append('<li><a href="#" class="item_use">(Пусто)</a></li>');
        }
    };

    /**
     * @param {String} itemName
     * @param {int} quantity
     */
    this.drawItem = function (itemName, quantity) {

        var actions = [];

        $.each(Game.useLabels, function(index, value) {
            if (itemName.toLowerCase() == index.substr(4, itemName.length).toLowerCase()) {
                var actionName = index.substr(itemName.length + 5);

                if (actionName == '') {
                    actionName = 'Осмотреть';
                }

                actions.push([actionName, index]);
            }
        });

        if (actions.length == 0 && itemName != 'inv') {
            if (quantity > 1) {
                itemName = itemName + ' (' + quantity + ')';
            }

            return '<li><a href="#" class="item_use">' + itemName + '</a></li>';
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
            var li2 = $('<li class="menu-item">');

            for (var i = 0; i < actions.length; i++) {
                li2.append($('<a href="#" class="item_use">').attr('data-label', actions[i][1]).text(actions[i][0]));
            }

            ul.append(li2);
            li.append(ul);

            return li;
        }
    };
}