/**
 * Copyright (C) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

window.compareResults = function(actual, expected) {
    const result = actual === expected;
    if (result) {
        GlobalPlayer.proc('passed');
    } else {
        GlobalPlayer.proc('failed');
    }
    return result;
}
