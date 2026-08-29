/**
 * Copyright (C) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

var functions = {
    // All method names must be in lowercase

    /**
     * Mathematical Functions
     */

    // Calculates the absolute value of a number.
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

    // Returns a number rounded up to the next integer.
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

    // Calculates e to the power of a number.
    exp(num) {
        if (arguments.length !== 1) {
            throw new Error('The exp() function takes 1 argument.');
        }
        var result = Math.exp(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for exp() function: ${num}`);
        }
        return result;
    },

    // Returns a number rounded down to the closest integer.
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

    // Returns the integer part of a number by removing any fractional digits.
    int(num) {
        if (arguments.length !== 1) {
            throw new Error('The int() function takes 1 argument.');
        }
        var result = Math.trunc(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for int() function: ${num}`);
        }
        return result;
    },

    // Inverts the Boolean representation of a value.
    invert(val) {
        if (arguments.length !== 1) {
            throw new Error('The invert() function takes 1 argument.');
        }
        var result = !toBoolean(val) ? 1 : 0;
        return result;
    },

    // Calculates the natural logarithm of a number.
    log(num) {
        if (arguments.length !== 1) {
            throw new Error('The log() function takes 1 argument.');
        }
        var result = Math.log(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for log() function: ${num}`);
        }
        return result;
    },

    // Calculates the common (decimal) logarithm of a number.
    log10(num) {
        if (arguments.length !== 1) {
            throw new Error('The log10() function takes 1 argument.');
        }
        var result = Math.log10(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for log10() function: ${num}`);
        }
        return result;
    },

    // Calculates the binary logarithm of a number.
    log2(num) {
        if (arguments.length !== 1) {
            throw new Error('The log2() function takes 1 argument.');
        }
        var result = Math.log2(num);
        if (Number.isNaN(result)) {
            throw new Error(`Invalid argument for log2() function: ${num}`);
        }
        return result;
    },

    // Returns the largest of the passed numbers.
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

    // Returns the smallest of the passed numbers.
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

    // Calculates a number to a power.
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

    // Returns a number rounded to a specified number of decimal places.
    round(num, decimals = 0) {
        if (arguments.length !== 1 && arguments.length !== 2) {
            throw new Error('The round() function takes 1 or 2 argument.');
        }
        var factor = 10 ** decimals;
        var result = Math.round(num * factor) / factor;
        if (Number.isNaN(result)) {
            throw new Error(`Invalid arguments for round() function: ${num} and ${decimals}`);
        }
        return result;
    },

    // Calculates the square-root of a number.
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
