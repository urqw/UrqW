/**
 * @author narmiel
 *
 * Управление квеста пользователем (события)
 */
$(function() {
    var buttonField = $('#buttons');
    var textfield = $('#textfield');
    var inventory = $('#inventory');

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
                Game.setVar(GlobalPlayer.inf, e.keyCode);
            }

            $('#info').hide();
            GlobalPlayer.play();
        }
    });

    /**
     * Нажатие на btn
     */
    buttonField.on('click', '.button', function() {
        if (GlobalPlayer.lock) return;

        textfield.empty();
        buttonField.empty();

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
                GlobalPlayer.proc_position.push(Game.getLabel(label));
                GlobalPlayer.flow++;
                GlobalPlayer.flowStack[GlobalPlayer.flow] = [];
                GlobalPlayer.to(common_label);
            }
        } else {
            GlobalPlayer.to(label, true);
        }

        Game.previousLoc = Game.currentLoc;
        Game.currentLoc = label;

        GlobalPlayer.play();
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

                //todo нехорошо так делать
                Game.setVar(GlobalPlayer.inf, input.find('input').val());

                GlobalPlayer.play();
            } else {
                input.addClass('has-error');
            }
        }
    });

    /**
     * Использование предметов
     */
    inventory.on('click', '.item_use', function() {
        if (GlobalPlayer.lock) return;

        var loc = $(this).data('loc');

        if (loc !== undefined) {
            textfield.empty();
            buttonField.empty();

            GlobalPlayer.proc_position.push(Game.getLabel(Game.currentLoc));
            GlobalPlayer.flow++;
            GlobalPlayer.flowStack[GlobalPlayer.flow] = [];
            Game.position = loc;

            GlobalPlayer.play();
        }

        return false;
    });
});