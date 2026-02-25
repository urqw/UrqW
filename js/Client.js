/**
 * Copyright (C) 2015, 2016 Akela <akela88@bk.ru>
 * Copyright (C) 2024-2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
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
     * @type {boolean}
     */
    this.firstRender = true;
    
}


/**
 * render
 */
Client.prototype.render = function (data) {
    if (this.firstRender) {
        if (Game.getVar('urq_mode') == 'dosurq') {
            $('#additionalstyle').empty().append('#buttons .button {background-color: #000; color: #AAA;}');
        }

        this.firstRender = false;
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

    this.drawText();
    if (data.status == PLAYER_STATUS_END) {
        this.drawButtons();
        this.drawInventory();
        automaticallyFocusFirstControl(true);
        // Save the game to be able to continue with saving progress
        Game.save('continue');
    } else if (data.status == PLAYER_STATUS_ANYKEY) {
        this.crtlButtonField.hide();
        var span = $('<span>', {
            tabindex: 0,
            text: i18next.t('press_any_key')
        });
        span.attr('data-i18n', 'press_any_key');
        this.crtlInfo.empty();
        this.crtlInfo.append(span);
        this.crtlInfo.show().promise().done(() => {
            if (settings['automatically_focus']) {
                span[0].focus({ preventScroll: true });
            }
        });
    } else if (data.status == PLAYER_STATUS_INPUT) {
        this.crtlButtonField.hide();
        this.crtlInput.removeClass('has-error');
        this.crtlInput.find('input').val('');
        this.crtlInput.show();
        this.crtlInput.find('input').focus();
    } else if (data.status == PLAYER_STATUS_PAUSE) {
        this.drawButtons();
        this.drawInventory();

        var wait = GlobalPlayer.inf;
        setTimeout(function() {
            if (GlobalPlayer.status == PLAYER_STATUS_PAUSE) {
                GlobalPlayer.continue();
            }
        }, wait);
        automaticallyFocusFirstControl(false);
    } else if (data.status == PLAYER_STATUS_QUIT) {
        GlobalPlayer.clsl();
        this.clsb();
        var span = $('<span>', {
            tabindex: 0,
            text: i18next.t('game_over')
        });
        span.attr('data-i18n', 'game_over');
        this.crtlInfo.empty();
        this.crtlInfo.append(span);
        this.crtlInfo.show().promise().done(() => {
            if (settings['automatically_focus']) {
                span[0].focus({ preventScroll: true });
            }
        });
    }

    /*
     * Automatically focus the first control of game screen:
     * link in text, action button, or inventory button
     **/
    function automaticallyFocusFirstControl(force = true) {
        if (!settings['automatically_focus']) {
            return;
        }

        if (!force) {
            var $currentFocus = $(document.activeElement);
            var isFocusInsideAreas = $currentFocus.closest('#textfield, #buttons, .navbar-right').length > 0;
            if (isFocusInsideAreas) {
                return;
            }
        }

        var targetFocus;
        [
            $('#textfield a:visible:first'),
            $('#buttons button:visible:first'),
            $('.navbar-right a:visible:first')
        ].some(function(element) {
            if (element.length) {
                targetFocus = element;
                return true;
            }
        });
        if (targetFocus) {
            targetFocus[0].focus({ preventScroll: true });
        }
    }
};

/**
 * Screen cleaning
 */
Client.prototype.cls = function() {
    this.clst();
    //this.clsl();
    this.clsb();
};

/**
 * Text cleaning
 */
Client.prototype.clst = function() {
    this.crtlTextField.empty();
    this.previousRenderedText = '';
};

/**
 * Links cleaning
 */
Client.prototype.clsl = function() {
    this.drawText();
};

/**
 * Buttons cleaning
 */
Client.prototype.clsb = function() {
    this.crtlButtonField.empty();
    this.previousRenderedButtons = '';
};

/**
 * Draw text
 */
Client.prototype.drawText = function () {
    var me = this;

    // If the text hasn't changed, then don't redraw it
    if (JSON.stringify(GlobalPlayer.text) === me.previousRenderedText) {
        return;
    } else {
        me.previousRenderedText = JSON.stringify(GlobalPlayer.text);
    }

    var scrolled = false;

    this.crtlTextField.empty();

    $.each(GlobalPlayer.text, function(index, text) {
        var content = text[0];
        if (!htmlSupport) {
            // <br> tag can be generated by #/$ construct from URQL code
            // <img> tag can be generated by the image operator from URQL code
            content = getEscapedHtmlWithAllowedTags(content, ['br', 'img']);
        }
        var div = $('<div>').html(content);

        if (div.find('*:not(a, s, b, small, span, q, i, br)').length == 0) {
            div.addClass('text');
        }

        if (text[2] !== 0) {
            div.css('color', text[2]);
        }

        div.find('img').each(function(index) {
            var src = $(this).attr('src');
            if (src && src.indexOf('http://') == -1 && src.indexOf('https://') == -1) {
                src = getGameFileURL(normalizeInternalPath(src));
                $(this).attr('src', src);
            }
            if (settings['images_focusable']) {
                $(this).attr('tabindex', '0');
            }
        });

        div.find('a.button').each(function(index) {
            var action = $(this).attr('data-action');
            if (GlobalPlayer.links[action] == null) {
                $(this).contents().unwrap();
            }
        });

        if (text.rendered == undefined) {
//                div.css('opacity', 0.5);
        }

        me.crtlTextField.append(div);

        if (text[1]) {
            /**
             * Due to the specifics of non-standard layout of text output,
             * when all lines are displayed as divs with inline display
             * and separate empty divs for line breaks, screen readers
             * present the entire text without line breaks.
             * Assigning the "paragraph" role  to the div that performs
             * the line break function provides a workaround for solving
             * this problem without making more significant changes.
             * In the future, it is advisable to redesign the entire
             * text layout based on standard paragraphs.
            */
            me.crtlTextField.append('<div role="paragraph" class="clearfix">');
        }

        if (text.rendered == undefined) {
            if (scrolled == false) {
                scrolled = true;
                $('html, body').animate({scrollTop: div.offset().top}, 500);
            }

//                div.animate({opacity:1}, 800);
        }

        GlobalPlayer.text[index].rendered = true;
    });
};

/**
 * Draw buttons
 */
Client.prototype.drawButtons = function () {
    var me = this;

    // If the buttons hasn't changed, then don't redraw them
    if (JSON.stringify(GlobalPlayer.buttons) === me.previousRenderedButtons) {
        return;
    } else {
        me.previousRenderedButtons = JSON.stringify(GlobalPlayer.buttons);
    }

    this.crtlButtonField.empty();

    $.each(GlobalPlayer.buttons, function(index, button) {
        if (button) {
            var description = button.desc;
            if (!htmlSupport) {
                // <br> tag can be generated by #/$ construct from URQL code
                description = getEscapedHtmlWithAllowedTags(description, ['br']);
            }
            if (settings['numeric_keys']) {
                description = '<b>' + (index + 1) + ':</b> ' + description;
            }
            var buttonCtrl = $('<button class="list-group-item button">').attr('data-action', button.id).html(description);

            me.crtlButtonField.append(buttonCtrl);
        }
    });
};

/**
 * Draw inventory
 */
Client.prototype.drawInventory = function () {
    var me = this;

    // If the inventory hasn't changed, then don't redraw it
    if (JSON.stringify(Game.items) === me.previousRenderedInventory) {
        return;
    } else {
        me.previousRenderedInventory = JSON.stringify(Game.items);
    }

    this.crtlInventory.empty();
    this.crtlInventory.append(this.drawItem('inv', 1));

    // Update list of items
    $.each(Game.items, function(itemName, quantity) {
        me.crtlInventory.append(me.drawItem(itemName, quantity));
    });
    
    if (this.crtlInventory.find('> li').length == 0) {
        // For empty element set UrqW UI language, not game language
        var lang = document.getElementsByTagName('HTML')[0].getAttribute('lang');
        this.crtlInventory.append('<li lang=' + lang + '><a href="#" class="item_use" aria-disabled="true">' + i18next.t('empty') + '</a></li>');
    }
};

/**
 * @param {String} itemName
 * @param {int} quantity
 *
 * @return {Jquery|String}
 */
Client.prototype.drawItem = function (itemName, quantity) {
    var actions = [];

    $.each(Game.useLabels, function(index, value) {
        if ((itemName.toLowerCase() + '_' == index.substr(4, itemName.length + 1).toLowerCase())
            || (itemName.toLowerCase() == index.substr(4).toLowerCase())
        ) {
            var actionName = index.substr(itemName.length + 5);

            actions.push([actionName, index]);
        }
    });

    var displayName = Game.getVar('display_use_' + itemName);
    var itemDisplayName;
    if (displayName) {
        itemDisplayName = displayName;
    } else {
        itemDisplayName = itemName.replace(/_/g, ' ');
    }
    if (!htmlSupport) {
        // <br> tag can be generated by #/$ construct from URQL code
        itemDisplayName = getEscapedHtmlWithAllowedTags(itemDisplayName, ['br']);
    }

    // Some items and actions need to be inserted with language markup,
    // for this the following two variables are needed
    var lang = document.getElementsByTagName('HTML')[0].getAttribute('lang');
    var isExamineItem = false;

    if (actions.length == 0 && itemName != 'inv' || (Game.getVar('hide_use_' + itemName) > 0)) {
        if (quantity > 1) {
            itemDisplayName = itemDisplayName + ' (' + quantity + ')';
        }

        return '<li><a href="#" class="item_use" aria-disabled="true">' + itemDisplayName + '</a></li>';
    } if (actions.length == 1 && itemName != 'inv' && actions[0][0] == '') {
        if (quantity > 1) {
            itemDisplayName = itemDisplayName + ' (' + quantity + ')';
        }

        var a = $('<a href="#" class="item_use">').attr('data-label', actions[0][1]).html(itemDisplayName);
        a.html('<span class="glyphicon glyphicon-cog" aria-hidden="true"></span> ' + a.html());

        return $('<li>').append(a);
    } else if (actions.length > 0)  {
        if (itemName == 'inv') {
            itemDisplayName = '<span lang="' + lang + '">' + i18next.t('inventory') + '</span>';
        } else {
            if (quantity > 1) {
                itemDisplayName = itemDisplayName + ' (' + quantity + ')';
            }
        }

        var li = $('<li>').addClass('dropdown-submenu');
        var liLink = $('<a href="#" class="item_use">');
        liLink.attr('aria-haspopup', 'menu');
        liLink.html(itemDisplayName);
        li.append(liLink);
var ul = $('<ul role="menu" class="dropdown-menu">');
        var li2 = $('<li role="presentation" class="menu-item">');

        var li2link;
        for (var i = 0; i < actions.length; i++) {
            if (actions[i][0] == '') {
                actions[i][0] = '<span lang="' + lang + '">' + i18next.t('examine') + '</span>';
                isExamineItem = true;
            }

            if (Game.getVar('hide_use_' + itemName + '_' + actions[i][0]) == 0) {
                displayName = Game.getVar('display_use_' + itemName + '_' + actions[i][0]);
                var actionDisplayName;
                if (displayName) {
                    actionDisplayName = displayName;
                } else {
                    actionDisplayName = actions[i][0].replace(/_/g, ' ');
                }
                if (!htmlSupport && !isExamineItem) {
                    // <br> tag can be generated by #/$ construct from URQL code
                    actionDisplayName = getEscapedHtmlWithAllowedTags(actionDisplayName, ['br']);
                }
                isExamineItem = false;
                
li2link = $('<a role="menuitem" href="#" class="item_use">');
                li2link.attr('data-label', actions[i][1]);
                li2link.html(actionDisplayName);
                li2.append(li2link);
            }
        }

        ul.append(li2);
        li.append(ul);

        return li;
    }
};

/**
 * Convert text and command into <a> tag
 * @param {String} text
 * @param {int} action
 */
Client.prototype.convertToLink = function(text, action) {
    return '<a data-action="' + action + '" class="button" href="#">' + text + '</a>';
};

/**
 * Convert text of form <a ...>text</a> to text
 * @param text
 */
Client.prototype.disableLink = function(text) {
    var a = $(text);
    if (a.hasClass('button') || a.hasClass('dropdown-toggle')) {
        return a.text();
    } else {
        return text;
    }
};
