/**
 * Copyright (C) 2015, 2016 Akela <akela88@bk.ru>
 * Copyright (C) 2024, 2025 Nikita Tseykovets <tseikovets@rambler.ru>
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
        // Automatically focus the first control of game screen:
        // link in text, action button, or inventory button
        if (settings['automatically_focus']) {
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
                targetFocus.focus();
            }
        }
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
                span.focus();
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
    } else if (data.status == PLAYER_STATUS_QUIT) {
        var span = $('<span>', {
            tabindex: 0,
            text: i18next.t('game_over')
        });
        span.attr('data-i18n', 'game_over');
        this.crtlInfo.empty();
        this.crtlInfo.append(span);
        this.crtlInfo.show().promise().done(() => {
            if (settings['automatically_focus']) {
                span.focus();
            }
        });
    }
};

/**
 * Screen cleaning
 */
Client.prototype.cls = function() {
    this.clst();
    this.clsb();
};

/**
 * Text cleaning
 */
Client.prototype.clst = function() {
    this.crtlTextField.empty();
};

/**
 * Buttons cleaning
 */
Client.prototype.clsb = function() {
    this.crtlButtonField.empty();
};

/**
 * Draw text
 */
Client.prototype.drawText = function () {
    var me = this;
    var scrolled = false;

    this.crtlTextField.empty();

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
    this.crtlButtonField.empty();

    $.each(GlobalPlayer.buttons, function(index, button) {
        if (button) {
            var description = button.desc;
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
    this.crtlInventory.empty();
    this.crtlInventory.append(this.drawItem('inv', 1));

    // Update list of items
    $.each(Game.items, function(itemName, quantity) {
        me.crtlInventory.append(me.drawItem(itemName, quantity));
    });
    
    if (this.crtlInventory.find('> li').length == 0) {
        // For empty element set UrqW UI language, not game language
        var lang = document.getElementsByTagName('HTML')[0].getAttribute('lang');
        this.crtlInventory.append('<li lang=' + lang + '><a href="#" class="item_use">' + i18next.t('empty') + '</a></li>');
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

    itemName = itemName.replace(/_/g, ' ');

    // Some items and actions need to be inserted with language markup,
    // for this the following two variables are needed
    var htmlContent = false;
    var lang = document.getElementsByTagName('HTML')[0].getAttribute('lang');

    if (actions.length == 0 && itemName != 'inv' || (Game.getVar('hide_use_' + itemName) > 0)) {
        if (quantity > 1) {
            itemName = itemName + ' (' + quantity + ')';
        }

        return '<li><a href="#" class="item_use">' + itemName + '</a></li>';
    } if (actions.length == 1 && itemName != 'inv' && actions[0][0] == '') {
        if (quantity > 1) {
            itemName = itemName + ' (' + quantity + ')';
        }

        var a = $('<a href="#" class="item_use">').attr('data-label', actions[0][1]).text(itemName);
        a.html('<span class="glyphicon glyphicon-cog" aria-hidden="true"></span> ' + a.text());

        return $('<li>').append(a);
    } else if (actions.length > 0)  {
        if (itemName == 'inv') {
            htmlContent = true;
            itemName = '<span lang="' + lang + '">' + i18next.t('inventory') + '</span>';
        } else {
            if (quantity > 1) {
                itemName = itemName + ' (' + quantity + ')';
            }
        }

        var li = $('<li>').addClass('dropdown-submenu');
        var liLink = $('<a href="#" class="item_use">');
        liLink.attr('aria-haspopup', 'listbox');
        if (htmlContent) {
            liLink.html(itemName);
            htmlContent = false;
        } else {
            liLink.text(itemName);
        }
        li.append(liLink);
        /**
         * To improve accessibility, the semantics are modified here using WAI-ARIA.
         * The original layout consists of a list, a single list item,
         * and links within the list item. For assistive technologies,
         * each link is made a list item (see comments on specific lines of code).
         * In the future, everything can be brought to a single layout
         * if the graphic design is adapted.
         */
        // A11Y modification: Remove list semantics using the presentation role
var ul = $('<ul role="presentation" class="dropdown-menu">');
        // A11Y modification: Redefine the list item semantics as a list using the list role
        var li2 = $('<li role="list" class="menu-item">');

        var li2link;
        for (var i = 0; i < actions.length; i++) {
            if (actions[i][0] == '') {
                htmlContent = true;
                actions[i][0] = '<span lang="' + lang + '">' + i18next.t('examine') + '</span>';
            }

            if (Game.getVar('hide_use_' + itemName + '_' + actions[i][0]) == 0) {
                li2link = $('<a href="#" class="item_use">');
                li2link.attr('data-label', actions[i][1]);
                if (htmlContent) {
                    li2link.html(actions[i][0]);
                    htmlContent = false;
                } else {
                    li2link.text(actions[i][0]);
                }
                // A11Y modification: Place links in elements with the list item role
                li2link = $('<span role="listitem">').append(li2link);
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
    return "<a data-action='" + action + "' class='button' href='#'>" + text + "</a>";
};

/**
 * Convert text of form <a ...>text</a> to text
 * @param text
 */
Client.prototype.disableLink = function(text) {
    var a = $(text);
    if (a.hasClass('button')) {
        return a.text();
    } else {
        return text;
    }
};
