/**
 * Copyright (C) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

var functions = {

    // Mathematical Functions

    abs(num) {
        if (arguments.length !== 1) {
            throw new Error('The abs() function takes 1 argument.');
        }
        var result = Math.abs(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for abs() function: ${num}`);
        }
        return result;
    },

    ceil(num) {
        if (arguments.length !== 1) {
            throw new Error('The ceil() function takes 1 argument.');
        }
        var result = Math.ceil(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for ceil() function: ${num}`);
        }
        return result;
    },

    floor(num) {
        if (arguments.length !== 1) {
            throw new Error('The floor() function takes 1 argument.');
        }
        var result = Math.floor(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for floor() function: ${num}`);
        }
        return result;
    },

    max(...args) {
        if (args.length === 0) {
            throw new Error('The max() function requires at least 1 argument.');
        }
        result = Math.max(...args);
        if (Number.isNaN(result)) {
            throw new Error('Invalid arguments for max() function: all must be numbers');
        }
        return result;
    },

    min(...args) {
        if (args.length === 0) {
            throw new Error('The min() function requires at least 1 argument.');
        }
        result = Math.min(...args);
        if (Number.isNaN(result)) {
            throw new Error('Invalid arguments for min() function: all must be numbers');
        }
        return result;
    },

    pow(base, exponent) {
        if (arguments.length !== 2) {
            throw new Error('The pow() function takes 2 arguments.');
        }
        var result = Math.pow(base, exponent);
        if (Number.isNaN(result)) {
            throw new Error(`Result of pow(${base}, ${exponent}) is NaN`);
        }
        if (!Number.isFinite(result)) {
            throw new Error(`Result of pow(${base}, ${exponent}) is too large (Infinity)`);
        }
        return result;
    },

    round(num) {
        if (arguments.length !== 1) {
            throw new Error('The round() function takes 1 argument.');
        }
        var result = Math.round(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for round() function: ${num}`);
        }
        return result;
    },

    sqrt(num) {
        if (arguments.length !== 1) {
            throw new Error('The sqrt() function takes 1 argument.');
        }
        var result = Math.sqrt(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for sqrt() function: ${num}`);
        }
        return result;
    }

}
