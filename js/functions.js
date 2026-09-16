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
        var result = Math.max(...args);
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
        var result = Math.min(...args);
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
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error('The round() function takes 1 or 2 arguments.');
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
    },

    /**
     * Type Conversion Functions
     */

    // Returns the boolean representation of a value.
    boolean(val) {
        if (arguments.length !== 1) {
            throw new Error('The boolean() function takes 1 argument.');
        }
        return toBoolean(val) ? 1 : 0;
    },

    // Returns the number representation of a value.
    number(val) {
        if (arguments.length !== 1) {
            throw new Error('The number() function takes 1 argument.');
        }
        var result = Number(val);
        if (Number.isNaN(result)) {
            result = 0;
        }
        return result;
    },

    // Returns the string representation of a value.
    string(val) {
        if (arguments.length !== 1) {
            throw new Error('The string() function takes 1 argument.');
        }
        return String(val);
    },

    /**
     * Value and variable state check functions
     */

    // Checks whether the value has the derived type array.
    isarray(val) {
        if (arguments.length !== 1) {
            throw new Error('The isarray() function takes 1 argument.');
        }
        if (typeof val !== 'string') {
            return 0;
        }
        try {
            var parsed = JSON.parse(val);
            return Array.isArray(parsed) ? 1 : 0;
        } catch (e) {
            return 0;
        }
    },

    // Checks whether the value has the derived type boolean.
    isboolean(val) {
        if (arguments.length !== 1) {
            throw new Error('The isboolean() function takes 1 argument.');
        }
        return (val === 1 || val === 0) ? 1 : 0;
    },

    // Checks whether a variable with the given name is defined.
    isdeclared(varName) {
        if (arguments.length !== 1) {
            throw new Error('The isdeclared() function takes 1 argument.');
        }
        if (typeof varName !== 'string') {
            throw new Error('Invalid argument for isdeclared() function: it must be string.');
        }
        varName = varName.toLowerCase().trim();
var exists = Object.prototype.hasOwnProperty.call(Game.vars, varName);
        return exists ? 1 : 0;
    },

    // Checks whether the value has the primitive type number.
    isnumber(val) {
        if (arguments.length !== 1) {
            throw new Error('The isnumber() function takes 1 argument.');
        }
        return typeof val === 'number' ? 1 : 0;
    },

    // Checks whether the value has the derived type object.
    isobject(val) {
        if (arguments.length !== 1) {
            throw new Error('The isobject() function takes 1 argument.');
        }
        if (typeof val !== 'string') {
            return 0;
        }
        try {
            var parsed = JSON.parse(val);
            return (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) ? 1 : 0;
        } catch (e) {
            return 0;
        }
    },

    // Checks whether the value has the primitive type string.
    isstring(val) {
        if (arguments.length !== 1) {
            throw new Error('The isstring() function takes 1 argument.');
        }
        return typeof val === 'string' ? 1 : 0;
    },

    // Returns the type of a value.
    typeof(val) {
        if (arguments.length !== 1) {
            throw new Error('The typeof() function takes 1 argument.');
        }
        return typeof val;
    },

    /**
     * Object Functions
     */

    // Deletes a key from an object.
    objectdel(json, key) {
        if (arguments.length !== 2) {
            throw new Error('The objectdel() function takes 2 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid argument for objectdel() function: it must be object.');
            }
            delete parsed[key];
            return JSON.stringify(parsed);
        } catch (e) {
            throw new Error(`Invalid argument for objecdel() function: it must be object. ${e}`);
        }
    },

    // Returns an array of object key-value pairs.
    objectentries(json) {
        if (arguments.length !== 1) {
            throw new Error('The objectentries() function takes 1 argument.');
        }
        try {
            var parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid argument for objectentries() function: it must be object.');
            }
            var pairs = Object.entries(parsed);
            return JSON.stringify(pairs);
        } catch (e) {
            throw new Error(`Invalid argument for objectentries() function: it must be object. ${e}`);
        }
    },

    // Returns the value of a key from an object.
    objectget(json, key) {
        if (arguments.length !== 2) {
            throw new Error('The objectget() function takes 2 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid argument for objectget() function: it must be object.');
            }
            var val = parsed[key];
            if (typeof val !== 'string' && typeof val !== 'number') {
                val = JSON.stringify(parsed);
            }
            return val;
        } catch (e) {
            throw new Error(`Invalid argument for objectget() function: it must be object. ${e}`);
        }
    },

    // Returns an array of object keys.
    objectkeys(json) {
        if (arguments.length !== 1) {
            throw new Error('The objectkeys() function takes 1 argument.');
        }
        try {
            var parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid argument for objectkeys() function: it must be object.');
            }
            var keys = Object.keys(parsed);
            return JSON.stringify(keys);
        } catch (e) {
            throw new Error(`Invalid argument for objectkeys() function: it must be object. ${e}`);
        }
    },

    // Sets the value of a key in an object.
    objectset(json, key, val) {
        if (arguments.length !== 3) {
            throw new Error('The objectset() function takes 3 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid argument for objectset() function: it must be object.');
            }
            parsed[key] = val;
            return JSON.stringify(parsed);
        } catch (e) {
            throw new Error(`Invalid argument for objectset() function: it must be object. ${e}`);
        }
    },

    // Returns an array of object values.
    objectvalues(json) {
        if (arguments.length !== 1) {
            throw new Error('The objectvalues() function takes 1 argument.');
        }
        try {
            var parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid argument for objectvalues() function: it must be object.');
            }
            var values = Object.values(parsed);
            return JSON.stringify(values);
        } catch (e) {
            throw new Error(`Invalid argument for objectvalues() function: it must be object. ${e}`);
        }
    },

    /**
     * String Functions
     */

    // TODO: stringinstr

    // Returns a number of characters from the left-hand side of a string.
    stringleft(str, count) {
        if (arguments.length !== 2) {
            throw new Error('The stringleft() function takes 2 arguments.');
        }
        if (count <= 0) {
            return '';
        }
        str = String(str);
        if (count >= str.length) {
            return str;
        }
        return str.slice(0, count);
    },

    // Returns the number of characters in a string.
    stringlen(str) {
        if (arguments.length !== 1) {
            throw new Error('The stringlen() function takes 1 argument.');
        }
        return String(str).length;
    },

    // Converts a string to lowercase using locale-specific rules.
    stringlocalelower(str, locale) {
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error('The stringlocalelower() function takes 1 or 2 arguments.');
        }
        if (arguments.length === 1) {
            locale = Game.getVar('urqw_game_lang');;
            if (!locale) {
                locale = document.documentElement.lang;
            }
        }
        return String(str).toLocaleLowerCase(locale);
    },

    // Converts a string to uppercase using locale-specific rules.
    stringlocaleupper(str, locale) {
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error('The stringlocaleupper() function takes 1 or 2 arguments.');
        }
        if (arguments.length === 1) {
            locale = Game.getVar('urqw_game_lang');;
            if (!locale) {
                locale = document.documentElement.lang;
            }
        }
        return String(str).toLocaleUpperCase(locale);
    },

    // Converts a string to lowercase.
    stringlower(str) {
        if (arguments.length !== 1) {
            throw new Error('The stringlower() function takes 1 argument.');
        }
        return String(str).toLowerCase();
    },

    // Extracts a number of characters from a string.
    stringmid(str, start, count) {
        if (arguments.length < 2 && arguments.length > 3) {
            throw new Error('The stringmid() function takes 2 or 3 arguments.');
        }
        str = String(str);
        if (start < 0 || start >= str.length) {
            return '';
            }
        if (arguments.length === 2) {
            return str.slice(start);
        }
        if (count <= 0) {
            return '';
        }
        return str.slice(start, start + count);
    },

    // TODO: stringregexp
    // TODO: stringregexpreplace
    // TODO: stringreplace

    // Returns a number of characters from the right-hand side of a string.
    stringright(str, count) {
        if (arguments.length !== 2) {
            throw new Error('The stringright() function takes 2 arguments.');
        }
        if (count <= 0) {
            return '';
        }
        str = String(str);
        if (count >= str.length) {
            return str;
        }
        return str.slice(-count);
    },

    // Splits up a string into substrings depending on the given delimiter.
    stringsplit(str, delimiter) {
        if (arguments.length !== 2) {
            throw new Error('The stringsplit() function takes 2 arguments.');
        }
        str = String(str);
        delimiter = String(delimiter);
        var parts = str.split(delimiter);
        return JSON.stringify(parts);
    },

    // Trims whitespace characters or a number of characters from the beginning and end of a string.
    stringtrim(str, count) {
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error('The stringtrim() function takes 1 or 2 arguments.');
        }
        str = String(str);
        if (arguments.length === 1) {
            return str.trim();
        }
        if (count <= 0) {
            return str;
        }
        var len = str.length;
        if (count*2 >= len) {
            return '';
        }
        return str.slice(count, len - count);
    },

    // Trims either whitespace characters or a number of characters from the right hand side of a string.
    stringtrimleft(str, count) {
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error('The stringtrimleft() function takes 1 or 2 arguments.');
        }
        str = String(str);
        if (arguments.length === 1) {
            return str.replace(/^\s+/, '');
        }
        if (count <= 0) {
            return str;
        }
        return count >= str.length ? '' : str.slice(count);
    },

    // Trims either whitespace characters or a number of characters from the left hand side of a string.
    stringtrimright(str, count) {
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error('The stringtrimright() function takes 1 or 2 arguments.');
        }
        str = String(str);
        if (arguments.length === 1) {
            return str.replace(/\s+$/, '');
        }
        if (count <= 0) {
            return str;
        }
        return count >= str.length ? '' : str.slice(0, str.length - count);
    },

    // Converts a string to uppercase.
    stringupper(str) {
        if (arguments.length !== 1) {
            throw new Error('The stringupper() function takes 1 argument.');
        }
        return String(str).toUpperCase();
    },

    /**
     * Other Functions
     */

    // Executes JavaScript code.
    javascript(code) {
        if (arguments.length !== 1) {
            throw new Error('The javascript() function takes 1 argument.');
        }
        var result;
        try {
            result = eval(code);
        } catch (e) {
            throw new Error('The code passed to the javascript() function failed.');
        }
        if (typeof result === 'number' || typeof result === 'string') {
            if (typeof result === 'number' && Number.isNaN(result)) {
                result = String(result);
            }
            return result;
        }
        return String(result);
    }

}
