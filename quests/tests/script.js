/**
 * Copyright (C) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// The file encoding is UTF-8 without BOM

// Converts a JavaScript value to a JSON-formatted string.
functions.jsonstringify = function (val) {
    if (arguments.length !== 1) {
        throw new Error('The jsonstringify() function takes 1 argument.');
    }
    return JSON.stringify(val);
};

// Tests for Unicode support in function names and datas
functions.функция = function(аргумент) {
    if (аргумент === "Раз") {
        return 'Два';
    }
    return false;
};

// Aliases with a mixed Latin-Cyrillic name for the function функция()
functions.funcция = functions.функция;
functions.функtion = functions.функция;

// Compares the actual and expected results and updates statistical variables.
window.compareResults = function(actual, expected) {
    const result = actual === expected;
    if (result) {
        GlobalPlayer.proc('passed');
    } else {
        GlobalPlayer.proc('failed');
    }
    return result;
}
