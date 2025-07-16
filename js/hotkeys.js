/**
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// Active element when key down event
var activeElementWhenKeyDown;
// Object for storing key states
var keyStates = {};
// Object for storing key handlers
var keyHandlers = {};
// Array of allowed combinations by key codes
var allowedCombinations = [
    'Escape',
    'KeyA',
    'KeyI',
    'KeyL',
    'KeyM',
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
    'Numpad0',
    'ArrowLeft',
    'ArrowUp',
    'ArrowRight',
    'ArrowDown'
];
// Objects of navigation clusters
var navigationClusters;

// Code for cluster navigation that needs to be executed after page has loaded
$(window).on("load", function() {
    // Define array of cluster elements
    navigationClusters = [
    	$('.navbar-nav')[0],
    	$('.navbar-right')[0],
    	$('#textfield')[0],
    	$('#buttons')[0],
    	$('#input')[0]
    ];
    // Disable default Bootstrap handlers of arrow keys for inventory dropdown menu
    $('#inventory').on('keydown', function(e) {
        var keyCode = e.code || e.key;
        if (keyCode && ['ArrowDown', 'ArrowUp'].includes(keyCode)) {
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
        }
    });
});

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
    activeElementWhenKeyDown = document.activeElement;

    // Not process hot keys if player is in waiting for any key to be pressed
    if (GlobalPlayer && GlobalPlayer.status == PLAYER_STATUS_ANYKEY) {
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
    if (GlobalPlayer && GlobalPlayer.status == PLAYER_STATUS_ANYKEY) 	{
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
function isFocusWithinElement($targetElement) {
    var $activeElement = $(':focus');
    return $targetElement.find($activeElement).length > 0;
}

// Function to activate button inside an element by number
function activateButtonByNumber(elementID, number) {
    if (!settings['numeric_keys']) return false;
    var element = document.getElementById(elementID);
    if (!$('#' + elementID).is(':visible') || isFocusWithinElement($('#input'))) return false;
    var buttons = element.getElementsByTagName('button');
    if(number > buttons.length) return false;
    buttons[number - 1].click();
    return true;
}

// Function to check if element is text input field
function isTextInput(element) {
    return element.tagName.toLowerCase() === 'textarea' ||
        (element.tagName.toLowerCase() === 'input' &&
            ['text', 'password', 'email', 'search'].includes(element.type));
}

// Function to cluster navigation
function ClusterNavigation(command) {
    if (!navigationClusters) return false;

    if (!settings['navigation_keys']) return false;

    var activeElement = activeElementWhenKeyDown;
    if (isTextInput(activeElement)) return false;

    var clusters = navigationClusters.filter(item => {
        var $element = $(item);
        if (!$element.is(':visible')) {
            return false;
        }
        if (getInteractiveChildren(item).length > 0) {
            return true;
        } else {
            return false;
        }
    });
    if (clusters.length === 0) return false;

    var indexOfCurrentCluster = getIndexOfCurrentCluster();
    if (indexOfCurrentCluster < 0) {
        // Focus first interactive element of first cluster
        getInteractiveChildren(clusters[0])[0].focus();
        return true;
    }

    switch(command) {
        case 'ArrowRight':
            return goToClusterByIndex(indexOfCurrentCluster + 1);
        case 'ArrowLeft':
            return goToClusterByIndex(indexOfCurrentCluster - 1);
    }

    var elementsOfCurrentCluster = getInteractiveChildren(clusters[indexOfCurrentCluster]);
    var indexOfActiveElement = getIndexOfActiveElement();

    switch(command) {
        case 'ArrowDown':
            return goToElementOfClusterByIndex(indexOfActiveElement + 1);
        case 'ArrowUp':
            return goToElementOfClusterByIndex(indexOfActiveElement - 1);
        default:
            return false;
    }

    // Returns array of child interactive elements
    function getInteractiveChildren(element) {
        var $visibleDescendants = $(element).find(':visible');
        var $focusableElements = $visibleDescendants.filter(function() {
            var $this = $(this);
            var tagName = $this.prop('tagName').toLowerCase();
    
            var isDefaultFocusable = [
                'input', 'select', 'textarea', 'button', 'a'
            ].includes(tagName);
            
            var isEnabled = !$this.is(':disabled');
            
            var hasValidTabIndex = (
                this.tabIndex >= 0 || 
                ($this.attr('tabindex') !== undefined && $this.attr('tabindex') >= 0)
            );
            
            var isLinkWithHref = ($this.is('a') && $this.attr('href') !== undefined);
            
            return (
                (isDefaultFocusable && isEnabled) ||
                hasValidTabIndex ||
                isLinkWithHref
            );
        });
        
        return $focusableElements.get();
    }

    // Returns index of cluster in which active element is located
    function getIndexOfCurrentCluster() {
        for(var i = 0; i < clusters.length; i++) {
            if (clusters[i].contains(activeElement)) {
                return i;
            }
        }
        return -1;
    }

    // Go to cluster with index closest to passed argument
    function goToClusterByIndex(index) {
        var length = clusters.length;
        if (index > length) {
            index = length;
        } else if (index < 0) {
            index = 0;
        }
        // Focus first interactive element of target cluster
        getInteractiveChildren(clusters[index])[0].focus();
        return true;
    }

    // Returns index of active element within current cluster
    function getIndexOfActiveElement() {
        for(var i = 0; i < elementsOfCurrentCluster.length; i++) {
            if (elementsOfCurrentCluster[i] === activeElement) return i;
        }
        return -1;
    }

    // Go to element with index closest to passed argument
    function goToElementOfClusterByIndex(index) {
        /*
         * Do not perform navigation on elements that open dropdown menus
         * and/or are inside dropdown menus.
         * They have their own implementation of keyboard navigation.
         * Exception is inventory drop-down menu, where standard implementation must be replaced.
         */
        if (!document.getElementById('inventory').contains(activeElement)
        && (activeElement.closest('.dropdown-toggle') !== null
        || activeElement.closest('.dropdown-menu') !== null)) {
            return false;
        }
        var length = elementsOfCurrentCluster.length;
        if (index > length) {
            index = length;
        } else if (index < 0) {
            index = 0;
        }
        elementsOfCurrentCluster[index].focus();
        return true;
    }

    return false;
}

// Registering supported hot keys

registerHotKey('Escape', (event) => {
    if ($('#return_to_game').is(':visible')) {
        $('#return_to_game').click();
    } else if ($('#close_menu').is(':visible')) {
        $('#close_menu').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyA', (event) => {
    if (settings['alphabetic_keys'] && $('#textfield').is(':visible') && !isFocusWithinElement($('#input'))) {
        var element = document.getElementById('textfield');
        var content = element.innerText.trim();
        announceForAccessibility(content);
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyI', (event) => {
    var $inventoryBtn = $('#inventory_btn');
    if (!$inventoryBtn.is(':visible')) {
        $inventoryBtn = $('#inventory_btn_xs');
        if (!$inventoryBtn.is(':visible')) {
            event.preventDefault(false);
            return;
        }
    }

    if (settings['alphabetic_keys'] && !isFocusWithinElement($('#input'))) {
        $inventoryBtn.focus();
        if (!$inventoryBtn.parent().hasClass('open')) {
            $inventoryBtn.click();
        }
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyL', (event) => {
    if (settings['alphabetic_keys'] && $('#load').is(':visible') && !isFocusWithinElement($('#input'))) {
        $('#load').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyM', (event) => {
    if (settings['alphabetic_keys'] && $('#menu').is(':visible') && !isFocusWithinElement($('#input'))) {
        $('#menu').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyR', (event) => {
    if (settings['alphabetic_keys'] && $('#restart').is(':visible') && !isFocusWithinElement($('#input'))) {
        $('#restart').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyS', (event) => {
    if (settings['alphabetic_keys'] && $('#save').is(':visible') && !isFocusWithinElement($('#input'))) {
        $('#save').click();
    } else {
        event.preventDefault(false);
    }
}, true);

registerHotKey('KeyV', (event) => {
    if (settings['alphabetic_keys'] && $('#mute').is(':visible') && !isFocusWithinElement($('#input'))) {
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

registerHotKey('ArrowLeft', (event) => {
    if (!ClusterNavigation('ArrowLeft')) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('ArrowUp', (event) => {
    if (!ClusterNavigation('ArrowUp')) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('ArrowRight', (event) => {
    if (!ClusterNavigation('ArrowRight')) {
        event.preventDefault(false);
    }
}, true);

registerHotKey('ArrowDown', (event) => {
    if (!ClusterNavigation('ArrowDown')) {
        event.preventDefault(false);
    }
}, true);
