/**
 * Copyright (C) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// Converts a JavaScript value to a JSON-formatted string.
functions.jsonstringify = function (val) {
    if (arguments.length !== 1) {
        throw new Error('The jsonstringify() function takes 1 argument.');
    }
    return JSON.stringify(val);
};

window.compareResults = function(actual, expected) {
    const result = actual === expected;
    if (result) {
        GlobalPlayer.proc('passed');
    } else {
        GlobalPlayer.proc('failed');
    }
    return result;
}
