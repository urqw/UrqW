/**
 * @author narmiel
 *
 * Управление квеста пользователем (события)
 */
$(function() {

    /**
     * Отлов нажатия клавиш
     */
    $(document).keypress(function(e){
        if (GlobalParser.status == GlobalParser.STATUS_ANYKEY) {

            if (GlobalParser.inf.length > 0) {
                Game.setVar(GlobalParser.inf, e.keyCode);
            }

            $('#info').hide();
            GlobalClient.play();
        } else if (GlobalParser.status == GlobalParser.STATUS_END) {
            if (e.keyCode == 13) {
                $('#buttons').find('button').each(function(index) {
                    if ($(this).hasClass('active')) {
                        $(this).click();
                    }
                });
            }

            if (e.keyCode == 38 || e.keyCode == 40) {


                var buttonField = $('#buttons');
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

    /**
     * Нажатие на btn
     */
    $('body').on('click', '.button', function() {
        if (lock) return;

        $('#textfield').empty();
        $('#buttons').empty();

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
                GlobalParser.proc_position.push(Game.getLabel(label));
                GlobalParser.flow++;
                GlobalParser.flowStack[GlobalParser.flow] = [];
                Game.to(common_label);
            }
        } else {
            Game.to(label, true);
        }

        Game.previousLoc = Game.currentLoc;
        Game.currentLoc = label;

        GlobalClient.play();
    });

    /**
     * Инпут ввод (интер)
     */
    $('#input').find('input').keypress(function(e){
        if (GlobalParser.status == GlobalParser.STATUS_INPUT && e.keyCode == 13) {
            $('#input_enter').click();
        }
    });

    /**
     * Инпут ввод (кнопка)
     */
    $('#input_enter').on('click', function() {
        if (GlobalParser.status == GlobalParser.STATUS_INPUT) {
            var input = $('#input');
            if (input.find('input').val() != '') {
                input.hide();

                //todo нехорошо так делать
                Game.setVar(GlobalParser.inf, input.find('input').val());

                GlobalClient.play();
            } else {
                input.addClass('has-error');
            }
        }
    });

    /**
     * Использование предметов
     */
    $('body').on('click', '.item_use', function() {
        if (lock) return;

        var loc = $(this).data('loc');

        if (loc !== undefined) {

            $('#textfield').empty();
            $('#buttons').empty();

            GlobalParser.proc_position.push(Game.getLabel(Game.currentLoc));
            GlobalParser.flow++;
            GlobalParser.flowStack[GlobalParser.flow] = [];
            Game.position = loc;

            GlobalClient.play();
        }

        return false;
    });
});