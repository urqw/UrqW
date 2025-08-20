/**
 * Copyright (C) 2015, 2016, 2018 Akela <akela88@bk.ru>
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// User control of quest (events)

var volumeMultiplier = 1;

$(function() {
    var buttonField = $('#buttons');
    var textfield = $('#textfield');
    var inventory = $('#inventory');
    var returnToGame = $('#return_to_game');
    var closeMenu = $('#close_menu');
    var volumeSlider = $('#volume');
    var decreaseVolume = $('#decrease_volume');
    var increaseVolume = $('#increase_volume');

    /**
     * Click on save
     */
    $('#save').on('click', function() {
        if (GlobalPlayer.lock) return false;

        $('#game').hide();

        $('#saveslots').find('.list-group').empty();

        for(var i = 1; i <= 10; i++) {
            var li = $('<li class="list-group-item">');
            var btn = $('<button class="button text-center savebtn savebtn-user" data-slot="' + i + '">');
            var lsname = localStorage.getItem(Game.name + '_' + i + '_name');
            var description;
            var menu;

            if (lsname === null) {
                description = i18next.t('empty_save_slot');
                menu = null;
            } else {
                description = lsname;
                menu = saveActionCreate(i);
            }
            if (settings['numeric_keys']) {
                description = i + ': ' + description;
            }
            btn.text(description);
            li.append(btn);
            if (menu) li.append(menu);
            $('#saveslots').find('.list-group').append(li);
        }

        $('#saveslots').find('.savebtn').on('click', function() {
            var slot = $(this).data('slot');
            var lsname = localStorage.getItem(Game.name + '_' + slot + '_name');
            if (lsname !== null && !confirm(i18next.t('overwrite_confirm'))) {
                return;
            }
            Game.save(slot);
            returnToGame.click();
        });

        $('#saveslots').find('.saveaction_rename').on('click', function() {
            saveactionRename.call(this, 'save');
            return false;
        });

        $('#saveslots').find('.saveaction_download').on('click', function() {
            saveactionDownload.call(this);
            return false;
        });

        $('#saveslots').find('.saveaction_clear').on('click', function() {
            saveactionClear.call(this, 'save');
            return false;
        });

        $('#saveslots').find('.saveaction_launch').on('click', function() {
            saveactionLaunch.call(this);
            return false;
        });

        $('#save_upload_form').hide();
        $('#saveslots_heading').text(i18next.t('save_game'));
        $('#saveslots').show();
        returnToGame.focus();

        return false;
    });

    function saveActionCreate(slot) {
        var accesskey = '';
        if (typeof slot === 'number' && slot >= 1 && slot <= 10) {
            var key = slot.toString();
            if (key === '10') key = '0';
            accesskey = `accesskey="${key}"`;
        }
        return $('<div class="dropdown btn-group pull-right">' +
            '<button type="button" class="btn btn-default btn-sm dropdown-toggle" data-slot="' + slot + '" data-toggle="dropdown" ' + accesskey + ' aria-label="' + i18next.t('menu') + '" aria-expanded="false">' +
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
            btn.text(i18next.t('autosave') + ' ' + lsname);
            li.append(btn);
            menu = saveActionCreate('fast');
            li.append(menu);
            $('#saveslots').find('.list-group').append(li);
        }

        for(var i = 1; i <= 10; i++) {
            li = $('<li class="list-group-item">');
            btn = $('<button class="button text-center savebtn savebtn-user" data-slot="' + i + '">');
            lsname = localStorage.getItem(Game.name + '_' + i + '_name');

            if (lsname === null) {
                btn.text(i18next.t('empty_save_slot')).prop('disabled', true);
                menu = null;
            } else {
                var description = lsname;
                if (settings['numeric_keys']) {
                    description = i + ': ' + description;
                }
                btn.text(description);
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
            return false;
        });

        $('#saveslots').find('.saveaction_download').on('click', function() {
            saveactionDownload.call(this);
            return false;
        });

        $('#saveslots').find('.saveaction_clear').on('click', function() {
            saveactionClear.call(this, 'load');
            return false;
        });

        $('#saveslots').find('.saveaction_launch').on('click', function() {
            saveactionLaunch.call(this);
            return false;
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
        $('#saveslots_heading').text(i18next.t('load_game'));
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
        var urqwGameLangValue = Game.vars['urqw_game_lang'];
        if (urqwGameLangValue) {
            GlobalPlayer.setVar('urqw_game_lang', urqwGameLangValue);
        }
        var urqwTitleValue = Game.vars['urqw_title'];
        if (urqwTitleValue) {
            GlobalPlayer.setVar('urqw_title', urqwTitleValue);
        }
    }

    $('#mute').on('click', function () {
        var span = $(this).find('span.glyphicon');
        var dataI18n = '[title]volume_control;[aria-label]';
        var labelID;

        switch (volumeMultiplier) {
            case 1:
                labelID = 'mute_sound';
                volumeMultiplier = 0.5;
                gameMusic.volume = Number(settings['volume'])/100*volumeMultiplier;
                span.removeClass('glyphicon-volume-up');
                span.addClass('glyphicon-volume-down');
                break;
            case 0.5:
                labelID = 'restore_normal_volume';
    volumeMultiplier = 0;
                gameMusic.volume = 0;
                span.removeClass('glyphicon-volume-down');
                span.addClass('glyphicon-volume-off');
                break;
            case 0:
                labelID = 'mute_half_volume';
                volumeMultiplier = 1;
                gameMusic.volume = Number(settings['volume'])/100;
                span.removeClass('glyphicon-volume-off');
                span.addClass('glyphicon-volume-up');
                break;
        }

        $(this).attr('aria-label', i18next.t(labelID));
        $(this).attr('data-i18n', dataI18n + labelID);

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
     * Click on menu
     */
    $('#menu').on('click', function() {
        $('#game').hide();

        // Refresh  information in the Debugging section
        if (debug) {
            var keys, tableRows;

            // Variables
            var variableTable = $('#variable_table');
            variableTable.empty()
            keys = Object.keys(Game.vars);
            tableRows = $();
            keys.reverse().forEach(key => {
                var value = Game.vars[key];
                var type = typeof value;
                var row = $(`
                    <tr>
                        <th>${key}</th>
                        <td>${value}</td>
                        <td>${type}</td>
                    </tr>
                `);
                tableRows = tableRows.add(row);
            });
            variableTable.append(tableRows);

            // Items
            var itemTable = $('#item_table');
            itemTable.empty()
            keys = Object.keys(Game.items);
            tableRows = $();
            keys.reverse().forEach(key => {
                var quantity = Game.items[key];
                var row = $(`
                    <tr>
                        <th>${key}</th>
                        <td>${quantity}</td>
                    </tr>
                `);
                tableRows = tableRows.add(row);
            });
            itemTable.append(tableRows);

            // Other
            $('#status_in_menu').text(GlobalPlayer.status);
            $('#position_in_menu').text(Game.position);
            $('#real_current_loc_in_menu').text(Game.realCurrentLoc);
        }

        // Refresh  information in the About the Game section
        var gameLangVal = Game.vars['urqw_game_lang'];
        var gameLangDesc;
        if (gameLangVal) {
            gameLangDesc = gameLangVal;
            if (i18next.exists('language.' + gameLangVal, { lng: i18next.options.fallbackLng })) {
                gameLangDesc += (' (<span data-i18n="language.' + gameLangVal + '">' + i18next.t('language.' + gameLangVal) + '</span>)');
            }
        } else {
            gameLangDesc = i18next.t('undefined');
        }

        var cell = $('#game_language_in_menu');
        cell.empty();
        cell.html(gameLangDesc);

        $('#menu_panel').show();
        closeMenu.focus();

        return false;
    });

    /**
     * Click on close menu
     */
    closeMenu.on('click', function() {
        $('#menu_panel').hide();
        $('#game').show();
        $('#menu').focus();
    });

    /**
     * Volume controls in settings
     */

    volumeSlider.on('change', function() {
        var currentValue = parseInt($(this).val(), 10);
        gameMusic.volume = currentValue/100*volumeMultiplier;
        var name = 'volume';
        settings[name] = currentValue;
        localStorage.setItem(name, JSON.stringify(currentValue));
        volumeSlider.attr('aria-valuenow', currentValue);
        volumeSlider.attr('aria-valuetext', `${currentValue}%`);

        // Managing the state of the volume slider change buttons
        var isDecreaseVolumeDisabled = decreaseVolume.prop('disabled');
        var isIncreaseVolumeDisabled = increaseVolume.prop('disabled');
        var newDecreaseVolumeDisabled = false;
        var newIncreaseVolumeDisabled = false;
        switch (currentValue) {
            case 0:
                newDecreaseVolumeDisabled = true;
                newIncreaseVolumeDisabled = false;
                break;
            case 100:
                newDecreaseVolumeDisabled = false;
                newIncreaseVolumeDisabled = true;
                break;
            default:
                newDecreaseVolumeDisabled = false;
                newIncreaseVolumeDisabled = false;
        }
        if (isDecreaseVolumeDisabled !== newDecreaseVolumeDisabled) {
            decreaseVolume.prop('disabled', newDecreaseVolumeDisabled);
        }
        if (isIncreaseVolumeDisabled !== newIncreaseVolumeDisabled) {
            increaseVolume.prop('disabled', newIncreaseVolumeDisabled);
        }
    });

    decreaseVolume.on('click', () => changeVolume(-10));
    increaseVolume.on('click', () => changeVolume(10));

    function changeVolume(step) {
        var currentValue = parseInt(volumeSlider.val(), 10);
        var newValue = Math.max(Math.min(currentValue + step, 100), 0);
        volumeSlider.val(newValue);
        volumeSlider.trigger('change');
    }

    /**
     * Changing checkbox states in settings
     */

    $('#automatically_focus').on('change', function() {
        var name = 'automatically_focus';
        var isChecked = $(this).prop('checked');
        settings[name] = isChecked;
        localStorage.setItem(name, JSON.stringify(isChecked));
    });

    $('#close_page_confirmation').on('change', function() {
        var name = 'close_page_confirmation';
        var isChecked = $(this).prop('checked');
        settings[name] = isChecked;
        localStorage.setItem(name, JSON.stringify(isChecked));
    });

    $('#numeric_keys').on('change', function() {
        var name = 'numeric_keys';
        var isChecked = $(this).prop('checked');
        settings[name] = isChecked;
        localStorage.setItem(name, JSON.stringify(isChecked));
        var rows = $('.' + name + '_row');
        if (isChecked) {
            rows.show();
        } else {
            rows.hide();
        }
    });

    $('#alphabetic_keys').on('change', function() {
        var name = 'alphabetic_keys';
        var isChecked = $(this).prop('checked');
        settings[name] = isChecked;
        localStorage.setItem(name, JSON.stringify(isChecked));
        var rows = $('.' + name + '_row');
        if (isChecked) {
            rows.show();
        } else {
            rows.hide();
        }
    });

    $('#navigation_keys').on('change', function() {
        var name = 'navigation_keys';
        var isChecked = $(this).prop('checked');
        settings[name] = isChecked;
        localStorage.setItem(name, JSON.stringify(isChecked));
        var rows = $('.' + name + '_row');
        if (isChecked) {
            rows.show();
        } else {
            rows.hide();
        }
    });

    $('#announce_description_updates').on('change', function() {
        var name = 'announce_description_updates';
        var isChecked = $(this).prop('checked');
        settings[name] = isChecked;
        localStorage.setItem(name, JSON.stringify(isChecked));
        if (isChecked) {
            textfield.attr('aria-live', 'polite');
        } else {
            textfield.attr('aria-live', 'off');
        }
    });

    $('#announce_choice_button_updates').on('change', function() {
        var name = 'announce_choice_button_updates';
        var isChecked = $(this).prop('checked');
        settings[name] = isChecked;
        localStorage.setItem(name, JSON.stringify(isChecked));
        if (isChecked) {
            buttonField.attr('aria-live', 'polite');
        } else {
            buttonField.attr('aria-live', 'off');
        }
    });

    $('#announce_description_when_shaking').on('change', function() {
        var name = 'announce_description_when_shaking';
        var isChecked = $(this).prop('checked');
        settings[name] = isChecked;
        localStorage.setItem(name, JSON.stringify(isChecked));
        var shakeThresholdGroup = $('#shake_sensitivity_threshold_group');
        if (isChecked) {
            var value = localStorage.getItem('shake_sensitivity_threshold');
            if (value !== null) {
                $('#shake_sensitivity_threshold').val(value);
            }
            shakeThresholdGroup.show();
        } else {
            shakeThresholdGroup.hide();
        }
    });

    $('#shake_sensitivity_threshold').change(function() {
        localStorage.setItem('shake_sensitivity_threshold', $(this).val());
    });

    /**
     * Click on btn
     */
    buttonField.on('click', '.button', function() {
        GlobalPlayer.action($(this).data('action'), false);
    });

    textfield.on('click', 'a.button', function() {
        GlobalPlayer.action($(this).data('action'), true);
        return false;
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