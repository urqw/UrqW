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
     * Нажатие на btn
     */
    buttonField.on('click', '.button', function() {
        if (GlobalPlayer.lock) return false;

        var label = $(this).data('label');

        if (label != null) {
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
                Game.setVar(GlobalPlayer.inf, e.keyCode);
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

                //todo нехорошо так делать
                Game.setVar(GlobalPlayer.inf, input.find('input').val());

                GlobalPlayer.continue();
            } else {
                input.addClass('has-error');
            }
        }
    });

});