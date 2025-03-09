/**
 * Copyright (C) 2015, 2016, 2018 Akela <akela88@bk.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// Управление квеста пользователем (события)

var volume = 1;

$(function() {
    var buttonField = $('#buttons');
    var textfield = $('#textfield');
    var inventory = $('#inventory');
    var returnToGame = $('#return_to_game');

    /**
     * Нажатие на сохранение
     */
    $('#save').on('click', function() {
        if (GlobalPlayer.lock) return false;

        $('#game').hide();

        $('#saveslots').find('.list-group').empty();

        for(var i = 1; i <= 10; i++) {
            var btn = $('<button class="list-group-item button text-center savebtn" data-slot="' + i + '">');
            var lsname = localStorage.getItem(Game.name + '_' + i + '_name');

            if (lsname === null) {
                btn.text('(Пустой слот сохранения)');
            } else {
                btn.text(lsname);
            }
            $('#saveslots').find('.list-group').append(btn);
        }

        $('#saveslots').find('.savebtn').on('click', function() {
            Game.save($(this).data('slot'));
            returnToGame.click();
        });

        $('#saveslots').show();

        return false;
    });

    $('#load').on('click', function() {
        $('#game').hide();

        $('#saveslots').find('.list-group').empty();

        var btn = $('<button class="list-group-item list-group-item-warning button text-center savebtn" data-slot="fast">');
        var lsname = localStorage.getItem(Game.name + '_fast_name');

        if (lsname != null) {
            btn.text(lsname);
            $('#saveslots').find('.list-group').append(btn);
        }

        for(var i = 1; i <= 10; i++) {
            btn = $('<button class="list-group-item button text-center savebtn" data-slot="' + i + '">');
            lsname = localStorage.getItem(Game.name + '_' + i + '_name');

            if (lsname === null) {
                btn.text('(Пустой слот сохранения)').prop('disabled', true);
            } else {
                btn.text(lsname);
            }
            $('#saveslots').find('.list-group').append(btn);
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
        });

        $('#saveslots').show();

        return false;
    });

    $('#mute').on('click', function () {
        var span = $(this).find('span.glyphicon');

        if (volume == 1) {
            $(this).attr('aria-label', 'Выключить звук');
            volume = 2;
            gameMusic.volume = 0.5;
            span.removeClass('glyphicon-volume-up');
            span.addClass('glyphicon-volume-down');
        } else if (volume == 2) {
            $(this).attr('aria-label', 'Вернуть громкость 100%');
            volume = 3;
            gameMusic.volume = 0;
            span.removeClass('glyphicon-volume-down');
            span.addClass('glyphicon-volume-off');
        } else if (volume == 3) {
            $(this).attr('aria-label', 'Убавить звук');
            volume = 1;
            gameMusic.volume = 1;
            span.removeClass('glyphicon-volume-off');
            span.addClass('glyphicon-volume-up');
        }

        return false;
    });

    $('#restart').on('click', function () {
        if (confirm('Перезапустить игру?')) {
//            GlobalPlayer.status = PLAYER_STATUS_END;
            $('#info').hide();
            $('#input').hide();

            textfield.empty();
            buttonField.empty();

            Game.init();

            GlobalPlayer = new Player();

            if (mode) GlobalPlayer.setVar('urq_mode', mode);

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
     * Нажатие на сохранение
     */
    returnToGame.on('click', function() {
        $('#saveslots').hide();
        $('#game').show();
    });

    /**
     * Нажатие на btn
     */
    buttonField.on('click', '.button', function() {
        GlobalPlayer.action($(this).data('action'), false);
    });

    textfield.on('click', 'a.button', function() {
        GlobalPlayer.action($(this).data('action'), true);
    });

    /**
     * Использование предметов
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
     * Отлов нажатия клавиш
     */
    $(document).keydown(function(e){
        if (GlobalPlayer == null) {
            return;
        }

        if (GlobalPlayer.status == PLAYER_STATUS_END) {
            if (e.keyCode == 38 || e.keyCode == 40) {
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

    $(document).keydown(function(e){
        if (GlobalPlayer == null) {
            return;
        }

        if (GlobalPlayer.status == PLAYER_STATUS_END) {
            if (e.keyCode == 13) {
                buttonField.find('button').each(function(index) {
                    if ($(this).hasClass('active')) {
                        $(this).click();
                    }
                });
            }
        }

        if (GlobalPlayer.status == PLAYER_STATUS_ANYKEY) {
            $('#info').hide();
            buttonField.show();
            GlobalPlayer.anykeyAction(e.keyCode);
        }
    });

    /**
     * Клики мышкой
     */
    $(document).on('click', '#textfield, #info', function(e){
        if (GlobalPlayer.status == PLAYER_STATUS_ANYKEY) {
            $('#info').hide();
            buttonField.show();
            GlobalPlayer.anykeyAction(e.keyCode);
        }
    });

    /**
     * Инпут ввод (интер)
     */
    $('#input').find('input').keypress(function(e){
        if (GlobalPlayer.status == PLAYER_STATUS_INPUT && e.keyCode == 13) {
            $('#input_enter').click();
        }
    });

    /**
     * Инпут ввод (кнопка)
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