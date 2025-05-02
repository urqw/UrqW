/**
 * Copyright (C) 2015, 2016, 2018 Akela <akela88@bk.ru>
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// User control of quest (events)

var volume = 1;

$(function() {
    var buttonField = $('#buttons');
    var textfield = $('#textfield');
    var inventory = $('#inventory');
    var returnToGame = $('#return_to_game');

    /**
     * Click on save
     */
    $('#save').on('click', function() {
        if (GlobalPlayer.lock) return false;

        $('#game').hide();

        $('#saveslots').find('.list-group').empty();

        for(var i = 1; i <= 10; i++) {
            var li = $('<li class="list-group-item">');
            var btn = $('<button class="button text-center savebtn" data-slot="' + i + '">');
            var lsname = localStorage.getItem(Game.name + '_' + i + '_name');
            var menu;

            if (lsname === null) {
                btn.text(i18next.t('empty_save_slot'));
                menu = null;
            } else {
                btn.text(lsname);
                menu = saveActionCreate(i);
            }
            li.append(btn);
            if (menu) li.append(menu);
            $('#saveslots').find('.list-group').append(li);
        }

        $('#saveslots').find('.savebtn').on('click', function() {
            Game.save($(this).data('slot'));
            returnToGame.click();
        });

        $('#saveslots').find('.saveaction_rename').on('click', function() {
            saveactionRename.call(this, 'save');
        });

        $('#saveslots').find('.saveaction_download').on('click', function() {
            saveactionDownload.call(this);
        });

        $('#saveslots').find('.saveaction_clear').on('click', function() {
            saveactionClear.call(this, 'save');
        });

        $('#saveslots').find('.saveaction_launch').on('click', function() {
            saveactionLaunch.call(this);
        });

        $('#save_upload_form').hide();
        $('#saveslots').show();
        returnToGame.focus();

        return false;
    });

    function saveActionCreate(slot) {
        return $('<div class="dropdown btn-group pull-right">' +
            '<button type="button" class="btn btn-default btn-sm dropdown-toggle" data-slot="' + slot + '" data-toggle="dropdown" aria-label="' + i18next.t('menu') + '" aria-expanded="false">' +
            '<span class="caret" aria-hidden="true"></span>' +
            '</button>' +
            '<ul class="dropdown-menu" role="menu">' +
            '<li class="dropdown-item" role="menuitem"><a href="#" class="saveaction_rename" data-slot="' + slot + '">' + i18next.t('rename') + '</a></li>' +
            '<li class="dropdown-item" role="menuitem"><a href="#" class="saveaction_download" data-slot="' + slot + '">' + i18next.t('download') + '</a></li>' +
            '<li class="dropdown-item" role="menuitem"><a href="#" class="saveaction_clear" data-slot="' + slot + '">' + i18next.t('clear') + '</a></li>' +
            '<li class="dropdown-item" role="menuitem"><a href="#" class="saveaction_launch" data-slot="' + slot + '">' + i18next.t('launch') + '</a></li>' +
            '</ul>' +
            '</div>');
    }

    function saveactionRename(id) {
        var slot = $(this).data('slot').toString();
        var currentName = localStorage.getItem(Game.name + '_' + slot + '_name');
        var input = prompt(i18next.t('enter_save_slot_name'), currentName);
        var newName = String(input).trim();
        if (input !== null && newName !== '') {
            newName = newName.length > 77 ? newName.slice(0, 77) + '...' : newName;
            localStorage.setItem(Game.name + '_' + slot + '_name', newName);
            $('#' + id).trigger('click');
        }
        $('button.savebtn[data-slot="' + slot + '"]').focus();
    }

    function saveactionDownload() {
        var slot = $(this).data('slot').toString();
        var name = localStorage.getItem(Game.name + '_' + slot + '_name');
        var data = localStorage.getItem(Game.name + '_' + slot.toString() + '_data');
        data = unicode2base(data);

        if (!data) {
            return;
        }

        var invalidChars = {
            '\\': '_',
            '/': '_',
            ':': '-',
            '*': '_',
            '?': '.',
            '"': '',
            '<': '{',
            '>': '}',
            '|': ';'
        };
        var fileName = (Game.name + ' - ' + name).split('').map(char => invalidChars[char] || char).join('');

        var blob = new Blob([data], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = fileName + '.qsv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        $('button[data-slot="' + slot + '"][data-toggle="dropdown"]').focus();
    }

    function saveactionClear(id) {
        var slot = $(this).data('slot').toString();
        if (confirm(i18next.t('clear_confirm'))) {
            localStorage.removeItem(Game.name + '_' + slot + '_name');
            localStorage.removeItem(Game.name + '_' + slot.toString() + '_data');
            $('#' + id).trigger('click');
        } else {
            $('button[data-slot="' + slot + '"][data-toggle="dropdown"]').focus();
        }
    }

    function saveactionLaunch() {
        var slot = $(this).data('slot').toString();
        var data = JSON.parse(localStorage.getItem(Game.name + '_' + slot + '_data'));
        loadGameFromData.call(this, data);
    }

    $('#load').on('click', function() {
        $('#game').hide();

        $('#saveslots').find('.list-group').empty();

        var li = $('<li class="list-group-item list-group-item-warning">');
        var btn = $('<button class="button text-center savebtn" data-slot="fast">');
        var lsname = localStorage.getItem(Game.name + '_fast_name');
        var menu;

        if (lsname != null) {
            btn.text(lsname);
            li.append(btn);
            menu = saveActionCreate('fast');
            li.append(menu);
            $('#saveslots').find('.list-group').append(li);
        }

        for(var i = 1; i <= 10; i++) {
            li = $('<li class="list-group-item">');
            btn = $('<button class="button text-center savebtn" data-slot="' + i + '">');
            lsname = localStorage.getItem(Game.name + '_' + i + '_name');

            if (lsname === null) {
                btn.text(i18next.t('empty_save_slot')).prop('disabled', true);
                menu = null;
            } else {
                btn.text(lsname);
                menu = saveActionCreate(i);
            }
            li.append(btn);
            if (menu) li.append(menu);
            $('#saveslots').find('.list-group').append(li);
        }

        $('#saveslots').find('.savebtn').on('click', function() {
            saveactionLaunch.call(this);
        });

        $('#saveslots').find('.saveaction_rename').on('click', function() {
            saveactionRename.call(this, 'load');
        });

        $('#saveslots').find('.saveaction_download').on('click', function() {
            saveactionDownload.call(this);
        });

        $('#saveslots').find('.saveaction_clear').on('click', function() {
            saveactionClear.call(this, 'load');
        });

        $('#saveslots').find('.saveaction_launch').on('click', function() {
            saveactionLaunch.call(this);
        });

        // TODO: not a very elegant implementation, but for now handler is assigned every time
        $('#save_upload').off('change');
        $('#save_upload').on('change', function(e) {
            var file = e.target.files[0];
            if (!file) return;

            var reader = new FileReader();

            reader.onload = function(e) {
                data = e.target.result;
                data = base2unicode(data);
                try {
                    var dataObject = JSON.parse(data);
                    loadGameFromData.call(this, dataObject);
                } catch(error) {
                    alert(i18next.t('save_file_unsupported_format'));
                }
            }.bind(this);

            reader.readAsText(file, 'UTF-8');

            $('#save_upload').val('');
        });

        $('#save_upload_form').show();
        $('#saveslots').show();
        returnToGame.focus();

        return false;
    });

    function loadGameFromData(data) {
        textfield.empty();
        buttonField.empty();
        $('#info').hide();
        $('#input').hide();

        Game.locked = true;

        GlobalPlayer = new Player();

        if (mode) GlobalPlayer.setVar('urq_mode', mode);

        GlobalPlayer.Client.crtlInfo = $('#info');
        GlobalPlayer.Client.crtlInput = $('#input');
        GlobalPlayer.Client.crtlButtonField = $('#buttons');
        GlobalPlayer.Client.crtlTextField = $('#textfield');
        GlobalPlayer.Client.crtlInventory = $('#inventory');

        Game.load(data);

        GlobalPlayer.goto(Game.realCurrentLoc, 'return');

        if (GlobalPlayer.status != PLAYER_STATUS_NEXT) {
            GlobalPlayer.fin();
        } else {
            GlobalPlayer.text = [];
            GlobalPlayer.buttons = [];
            GlobalPlayer.continue();
        }

        returnToGame.click();

        Game.locked = false;

        // If additional actions are performed when assigning values to variables,
        // they must be repeated when loading a saved game
        GlobalPlayer.setVar('urqw_game_lang', Game.getVar('urqw_game_lang'));
        var urqwTitleValue = Game.vars['urqw_title'];
        if (urqwTitleValue) {
            document.title = urqwTitleValue;
        }
    }

    $('#mute').on('click', function () {
        var span = $(this).find('span.glyphicon');

        if (volume == 1) {
            $(this).attr('aria-label', i18next.t('mute_sound'));
            volume = 2;
            gameMusic.volume = 0.5;
            span.removeClass('glyphicon-volume-up');
            span.addClass('glyphicon-volume-down');
        } else if (volume == 2) {
            $(this).attr('aria-label', i18next.t('restore_volume'));
            volume = 3;
            gameMusic.volume = 0;
            span.removeClass('glyphicon-volume-down');
            span.addClass('glyphicon-volume-off');
        } else if (volume == 3) {
            $(this).attr('aria-label', i18next.t('mute_half_volume'));
            volume = 1;
            gameMusic.volume = 1;
            span.removeClass('glyphicon-volume-off');
            span.addClass('glyphicon-volume-up');
        }

        return false;
    });

    $('#restart').on('click', function () {
        if (confirm(i18next.t('restart_game_confirm'))) {
//            GlobalPlayer.status = PLAYER_STATUS_END;
            $('#info').hide();
            $('#input').hide();

            textfield.empty();
            buttonField.empty();

            Game.init();

            GlobalPlayer = new Player();

            Game.sysVarInit();

            GlobalPlayer.Client.crtlInfo = $('#info');
            GlobalPlayer.Client.crtlInput = $('#input');
            GlobalPlayer.Client.crtlButtonField = $('#buttons');
            GlobalPlayer.Client.crtlTextField = $('#textfield');
            GlobalPlayer.Client.crtlInventory = $('#inventory');

            GlobalPlayer.continue();
        }

        return false;
    });

    /**
     * Click on save slot
     */
    returnToGame.on('click', function() {
        $('#saveslots').hide();
        $('#game').show();
        $('#load').focus();
    });

    /**
     * Click on btn
     */
    buttonField.on('click', '.button', function() {
        GlobalPlayer.action($(this).data('action'), false);
    });

    textfield.on('click', 'a.button', function() {
        GlobalPlayer.action($(this).data('action'), true);
    });

    /**
     * Using items from inventory
     */
    inventory.on('click', '.item_use', function() {
        if (GlobalPlayer.lock) return false;

        var label = $(this).data('label');

        if (label !== undefined) {
            GlobalPlayer.useAction(label);
        }

        return false;
    });

    /**
     * Keystroke tracking
     */
    $(document).keydown(function(e){
        if (GlobalPlayer == null) {
            return;
        }

        if (GlobalPlayer.status == PLAYER_STATUS_ANYKEY) {
            $('#info').hide();
            buttonField.show();
            GlobalPlayer.anykeyAction(e.keyCode);
        }
    });

    /**
     * Mouse click tracking
     */
    $(document).on('click', '#textfield, #info', function(e){
        if (GlobalPlayer.status == PLAYER_STATUS_ANYKEY) {
            $('#info').hide();
            buttonField.show();
            GlobalPlayer.anykeyAction(e.keyCode);
        }
    });

    /**
     * Pressing Enter key in input field
     */
    $('#input').find('input').keypress(function(e){
        if (GlobalPlayer.status == PLAYER_STATUS_INPUT && e.keyCode == 13) {
            $('#input_enter').click();
        }
    });

    /**
     * Click on OK button of input field
     */
    $('#input_enter').on('click', function() {
        if (GlobalPlayer.status == PLAYER_STATUS_INPUT) {
            var input = $('#input');
            if (input.find('input').val() != '') {
                input.hide();
                buttonField.show();

                GlobalPlayer.inputAction(input.find('input').val());
            } else {
                input.addClass('has-error');
            }
        }
    });

});