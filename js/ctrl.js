/**
 * @author narmiel
 *
 * Управление квеста пользователем (события)
 */
$(function() {
    var buttonField = $('#buttons');
    var textfield = $('#textfield');
    var inventory = $('#inventory');
    var save = $('#save');
    var returnToGame = $('#return_to_game');

    /**
     * Нажатие на сохранение
     */
    save.on('click', function() {
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
    });

    /**
     * Нажатие на сохранение
     */
    returnToGame.on('click', function() {
        if (GlobalPlayer.lock) return false;

        $('#saveslots').hide();
        $('#game').show();
    });

    /**
     * Нажатие на btn
     */
    buttonField.on('click', '.button', function() {
        if (GlobalPlayer.lock) return false;

        var label = $(this).data('label');

        if (label == '#load$') {
            $('#game').hide();

            $('#saveslots').find('.list-group').empty();

            for(var i = 1; i <= 10; i++) {
                var btn = $('<button class="list-group-item button text-center savebtn" data-slot="' + i + '">');
                var lsname = localStorage.getItem(Game.name + '_' + i + '_name');

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
                GlobalPlayer.text = [];
                GlobalPlayer.buttons = [];

                Game.load($(this).data('slot'));
                Game.locked = true;
                GlobalPlayer.goto(Game.realCurrentLoc, 'return');

                returnToGame.click();

                GlobalPlayer.continue();
                Game.locked = false;
            });

            $('#saveslots').show();
        } else if (label != null) {
            textfield.empty();
            buttonField.empty();

            GlobalPlayer.btnAction(label);
        }
    });

    /**
     * Использование предметов
     */
    inventory.on('click', '.item_use', function() {
        if (GlobalPlayer.lock) return false;

        var label = $(this).data('label');

        if (label !== undefined) {
            textfield.empty();
            buttonField.empty();

            GlobalPlayer.useAction(label);
        }

        return false;
    });

    /**
     * Отлов нажатия клавиш
     */
    $(document).keydown(function(e){
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

    $(document).keypress(function(e){
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
            if (GlobalPlayer.inf.length > 0) {
                GlobalPlayer.setVar(GlobalPlayer.inf, e.keyCode);
            }

            $('#info').hide();
            GlobalPlayer.continue();
        }
    });

    /**
     * Клики мышкой
     */
    $(document).on('click', function(e){
        if (GlobalPlayer.status == PLAYER_STATUS_ANYKEY) {
            if (GlobalPlayer.inf.length > 0) {
                GlobalPlayer.setVar(GlobalPlayer.inf, e.keyCode);
            }

            $('#info').hide();
            GlobalPlayer.continue();
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

                GlobalPlayer.setVar(GlobalPlayer.inf, input.find('input').val());

                GlobalPlayer.continue();
            } else {
                input.addClass('has-error');
            }
        }
    });

});