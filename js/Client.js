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

    /**
     * @type {boolean}
     */
    var fistRender = true;
    
    /**
     * render
     */
    this.render = function (data) {
        if (fistRender) {
            if (Game.getVar('urq_mode') == 'dosurq') {
                $('#additionalstyle').find('style').empty().append('#buttons .button {background-color: #000; color: #AAA;}');
            }
            
            fistRender = false;
        }
        
        var backColor = null;
        if (isNaN(Game.getVar('style_backcolor'))) {
            backColor = Game.getVar('style_backcolor');
        } else if (Game.getVar('style_textcolor') > 0) {
            var red = (Game.getVar('style_backcolor') >> 16) & 0xFF;
            var green = (Game.getVar('style_backcolor') >> 8) & 0xFF;
            var blue = Game.getVar('style_backcolor') & 0xFF;

            backColor = 'rgb(' + blue + ', ' + green  + ', ' + red + ')';
        }

        $('body').css('background-color', backColor);
        
        me.drawText();
        if (data.status == PLAYER_STATUS_END) {
            me.drawButtons();
            me.drawInventory();
        } else if (data.status == PLAYER_STATUS_ANYKEY) {
            this.crtlButtonField.hide();
            this.crtlInfo.text('[нажмите любую клавишу]');
            this.crtlInfo.show();
        } else if (data.status == PLAYER_STATUS_INPUT) {
            this.crtlButtonField.hide();
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
        this.clst();
        this.clsb();
    };

    /**
     * очистка текста
     */
    this.clst = function() {
        this.crtlTextField.empty();
    };

    /**
     * очистка кнопок
     */
    this.clsb = function() {
        this.crtlButtonField.empty();
    };

    /**
     * Нарисовать текст
     */
    this.drawText = function () {
        me.crtlTextField.empty();
        
        $.each(GlobalPlayer.text, function(index, text) {
            var div = $('<div>').html(text[0]);

            if (div.find('*:not(a, s, b, small, span, q, i)').length == 0) {
                div.addClass('text');
            }
            
            if (text[2] !== 0) {
                div.css('color', text[2]);
            }

            div.find('img').each(function(index) {
                var src = $(this).attr('src');
                if (src && src.indexOf('http://') == -1 && src.indexOf('https://') == -1) {
                    if (files === null) {
                        $(this).attr('src', 'quests/' + Game.name + '/' + src);
                    } else {
                        $(this).attr('src', files[src]); // todo
                    }
                }
            });

            div.find('a.button').each(function(index) {
                var action = $(this).attr('data-action');
                if (GlobalPlayer.links[action] == null) {
                    $(this).contents().unwrap();
                }
            });

            me.crtlTextField.append(div);

            if (text[1]) {
                me.crtlTextField.append('<div class="clearfix">');
            }
        });
    };

    /**
     * Нарисовать кнопки
     */
    this.drawButtons = function () {
        me.crtlButtonField.empty();
        
        $.each(GlobalPlayer.buttons, function(index, button) {
            if (button) {
                var buttonCtrl = $('<button class="list-group-item button">').attr('data-action', button.id).html(button.desc);

                me.crtlButtonField.append(buttonCtrl);
            }
        });
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
     * 
     * @return {Jquery|String}
     */
    this.drawItem = function (itemName, quantity) {

        var actions = [];

        $.each(Game.useLabels, function(index, value) {
            if ((itemName.toLowerCase() + '_' == index.substr(4, itemName.length + 1).toLowerCase())
            || (itemName.toLowerCase() == index.substr(4).toLowerCase())
            ) {
                var actionName = index.substr(itemName.length + 5);

                actions.push([actionName, index]);
            } 
        });

        itemName = itemName.replace(/_/g, '');

        if (actions.length == 0 && itemName != 'inv') {
            if (quantity > 1) {
                itemName = itemName + ' (' + quantity + ')';
            }

            return '<li><a href="#" class="item_use">' + itemName + '</a></li>';
        } if (actions.length == 1 && itemName != 'inv' && actions[0][0] == '') {
            if (quantity > 1) {
                itemName = itemName + ' (' + quantity + ')';
            }
            
            var a = $('<a href="#" class="item_use">').attr('data-label', actions[0][1]).text(itemName);
            a.html('<span class="glyphicon glyphicon-cog"></span> ' + a.text());
            
            return $('<li>').append(a);
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
                if (actions[i][0] == '') {
                    actions[i][0] = 'Осмотреть';
                }
                
                li2.append($('<a href="#" class="item_use">').attr('data-label', actions[i][1]).text(actions[i][0]));
            }

            ul.append(li2);
            li.append(ul);

            return li;
        }
    };

    /**
     * превратить текст и комманду в <a> тег
     * @param {String} text
     * @param {int} action
     */
    this.convertToLink = function(text, action) {
        return "<a data-action='" + action + "' class='button'>" + text + "</a>";
    };

    /**
     * преврать текст вида <a ...>текст</a> в текст
     * @param text 
     */
    this.disableLink = function(text) {
        var a = $(text);
        if (a.hasClass('button')) {
            return a.text();
        } else {
            return text;
        }
    }
}