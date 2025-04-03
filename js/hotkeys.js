/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// Object for storing key states
var keyStates = {};
// Object for storing key handlers
var keyHandlers = {};
// Array of allowed combinations by key codes
var allowedCombinations = [
    'Escape',
    'KeyL',
    'KeyR',
    'KeyS',
    'KeyV',
    'Digit1',
    'Digit2',
    'Digit3',
    'Digit4',
    'Digit5',
    'Digit6',
    'Digit7',
    'Digit8',
    'Digit9',
    'Digit0',
    'Numpad1',
    'Numpad2',
    'Numpad3',
    'Numpad4',
    'Numpad5',
    'Numpad6',
    'Numpad7',
    'Numpad8',
    'Numpad9',
    'Numpad0'
];

// Function to register new hot key or combination
function registerHotKey(combination, handler, allowDefault = false) {
    keyStates[combination] = false;
    keyHandlers[combination] = {
        handler: handler,
        allowDefault: allowDefault
    };
}

// Key down event handler
document.addEventListener('keydown', (event) => {
    // Not process hot keys if player is in waiting for any key to be pressed
    if (GlobalPlayer.status == PLAYER_STATUS_ANYKEY) {
        return;
    }

    var currentCombination = '';
    
    if (event.ctrlKey) currentCombination += 'Control+';
    if (event.shiftKey) currentCombination += 'Shift+';
    if (event.altKey) currentCombination += 'Alt+';
    if (event.metaKey) currentCombination += 'Meta+';
    // Check Windows/Super key
    if (event.code === 'OSLeft' || event.code === 'OSRight') {
        currentCombination += 'Super+';
    }
    
    var keyCode = event.code;
    currentCombination += keyCode;
    
    // check if such combination is in list of allowed ones
    if (allowedCombinations.includes(currentCombination)) {
        // Keep ability to skip preventDefault
        if (!keyHandlers[currentCombination] || !keyHandlers[currentCombination].allowDefault) {
            event.preventDefault();
        }
        // Mark combination as active
        keyStates[currentCombination] = true;
    }
}, true); // Use capture phase for maximum priority

// Key up event handler
document.addEventListener('keyup', (event) => {
    // Not process hot keys if player is in waiting for any key to be pressed
    if (GlobalPlayer.status == PLAYER_STATUS_ANYKEY) {
        return;
    }

    var currentCombination = '';
    
    if (event.ctrlKey) currentCombination += 'Control+';
    if (event.shiftKey) currentCombination += 'Shift+';
    if (event.altKey) currentCombination += 'Alt+';
    if (event.metaKey) currentCombination += 'Meta+';
    // Check Windows/Super key
    if (event.code === 'OSLeft' || event.code === 'OSRight') {
        currentCombination += 'Super+';
    }
    
    var keyCode = event.code;
    currentCombination += keyCode;
    
    // Execute handler on key up if combination was active
    if (keyStates[currentCombination] && keyHandlers[currentCombination]) {
        keyHandlers[currentCombination].handler(event);
    }
    // Reset state
    keyStates[currentCombination] = false;
}, true); // Use capture phase for maximum priority

// Function to check if focus is within element
function isFocusWithinElement(elementID) {
    var $targetElement = $('#' + elementID);
    var $activeElement = $(':focus');
    return $targetElement.find($activeElement).length > 0;
}

// Function to activate button inside an element by number
function activateButtonByNumber(elementID, number) {
    var element = document.getElementById(elementID);
    if (!$('#' + elementID).is(':visible') || isFocusWithinElement('input')) return false;
    var buttons = element.getElementsByTagName('button');
    if(number > buttons.length) return false;
    buttons[number - 1].click();
    return true;
}

// Registering supported hot keys

registerHotKey('Escape', (event) => {
    if ($('#return_to_game').is(':visible')) {
        $('#return_to_game').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyL', (event) => {
    if ($('#load').is(':visible') && !isFocusWithinElement('input')) {
        $('#load').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyR', (event) => {
    if ($('#restart').is(':visible') && !isFocusWithinElement('input')) {
        $('#restart').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyS', (event) => {
    if ($('#save').is(':visible') && !isFocusWithinElement('input')) {
        $('#save').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyV', (event) => {
    if ($('#mute').is(':visible') && !isFocusWithinElement('input')) {
        $('#mute').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit1', (event) => {
    if (!activateButtonByNumber('buttons', 1)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit2', (event) => {
    if (!activateButtonByNumber('buttons', 2)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit3', (event) => {
    if (!activateButtonByNumber('buttons', 3)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit4', (event) => {
    if (!activateButtonByNumber('buttons', 4)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit5', (event) => {
    if (!activateButtonByNumber('buttons', 5)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit6', (event) => {
    if (!activateButtonByNumber('buttons', 6)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit7', (event) => {
    if (!activateButtonByNumber('buttons', 7)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit8', (event) => {
    if (!activateButtonByNumber('buttons', 8)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit9', (event) => {
    if (!activateButtonByNumber('buttons', 9)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Digit0', (event) => {
    if (!activateButtonByNumber('buttons', 10)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad1', (event) => {
    if (!activateButtonByNumber('buttons', 1)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad2', (event) => {
    if (!activateButtonByNumber('buttons', 2)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad3', (event) => {
    if (!activateButtonByNumber('buttons', 3)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad4', (event) => {
    if (!activateButtonByNumber('buttons', 4)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad5', (event) => {
    if (!activateButtonByNumber('buttons', 5)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad6', (event) => {
    if (!activateButtonByNumber('buttons', 6)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad7', (event) => {
    if (!activateButtonByNumber('buttons', 7)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad8', (event) => {
    if (!activateButtonByNumber('buttons', 8)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad9', (event) => {
    if (!activateButtonByNumber('buttons', 9)) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('Numpad0', (event) => {
    if (!activateButtonByNumber('buttons', 10)) {
        event.preventDefault(false);
    }
}, true);
