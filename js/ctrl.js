/**
 * @author narmiel
 *
 * Управление квеста пользователем (события)
 */

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
        
        return false;
    });
    
    $('#mute').on('click', function () {
        var span = $(this).find('span');
        
        if (volume == 1) {
            volume = 2;
            gameMusic.volume = 0.5;
            span.removeClass('glyphicon-volume-up');
            span.addClass('glyphicon-volume-down');
        } else if (volume == 2) {
            volume = 3;
            gameMusic.volume = 0;
            span.removeClass('glyphicon-volume-down');
            span.addClass('glyphicon-volume-off');
        } else if (volume == 3) {
            volume = 1;
            gameMusic.volume = 1;
            span.removeClass('glyphicon-volume-off');
            span.addClass('glyphicon-volume-up');
        }
        
        return false;
    });

    $('#restart').on('click', function () {
        if (confirm('Перезапустить игру?')) {
            $('#info').hide();
            $('#input').hide();
            
            textfield.empty();
            buttonField.empty();
            GlobalPlayer.text = [];
            GlobalPlayer.buttons = [];
            
            if (mode) GlobalPlayer.setVar('urq_mode', mode);

            Game.init();
            GlobalPlayer.continue();
        }

        return false;
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

        var command = $(this).data('command');

        var label = Game.getLabel(GlobalPlayer.Parser.openTags(command.toString()));

        if (label) {
            GlobalPlayer.btnAction(label.name);
        } else {
            GlobalPlayer.xbtnAction(command);
        }
    });

    textfield.on('click', 'a.button', function() {
        if (GlobalPlayer.lock) return false;

        var command = $(this).data('command');

        var label = Game.getLabel(GlobalPlayer.Parser.openTags(command.toString()));

        if (label) {
            GlobalPlayer.btnAction(label.name);
        } else {
            GlobalPlayer.xbtnAction(command);
        }
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
            $('#info').hide();
            GlobalPlayer.anykeyAction(e.charCode);
        }
    });

    /**
     * Клики мышкой
     */
    $(document).on('click', '#textfield, #info', function(e){
        if (GlobalPlayer.status == PLAYER_STATUS_ANYKEY) {
            $('#info').hide();
            GlobalPlayer.anykeyAction(e.charCode);
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
                
                GlobalPlayer.inputAction(input.find('input').val());
            } else {
                input.addClass('has-error');
            }
        }
    });
    
});