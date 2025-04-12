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

            if (lsname === null) {
                btn.text(i18next.t('empty_save_slot'));
            } else {
                btn.text(lsname);
            }
            li.append(btn);
            $('#saveslots').find('.list-group').append(li);
        }

        $('#saveslots').find('.savebtn').on('click', function() {
            Game.save($(this).data('slot'));
            returnToGame.click();
        });

        $('#saveslots').show();
        returnToGame.focus();

        return false;
    });

    $('#load').on('click', function() {
        $('#game').hide();

        $('#saveslots').find('.list-group').empty();

        var li = $('<li class="list-group-item list-group-item-warning">');
        var btn = $('<button class="button text-center savebtn" data-slot="fast">');
        var lsname = localStorage.getItem(Game.name + '_fast_name');

        if (lsname != null) {
            btn.text(lsname);
            li.append(btn);
            $('#saveslots').find('.list-group').append(li);
        }

        for(var i = 1; i <= 10; i++) {
            li = $('<li class="list-group-item">');
            btn = $('<button class="button text-center savebtn" data-slot="' + i + '">');
            lsname = localStorage.getItem(Game.name + '_' + i + '_name');

            if (lsname === null) {
                btn.text(i18next.t('empty_save_slot')).prop('disabled', true);
            } else {
                btn.text(lsname);
            }
            li.append(btn);
            $('#saveslots').find('.list-group').append(li);
        }

        $('#saveslots').find('.savebtn').on('click', function() {
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

            Game.load($(this).data('slot'));

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
        });

        $('#saveslots').show();
        returnToGame.focus();

        return false;
    });

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