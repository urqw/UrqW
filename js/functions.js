/**
 * Copyright (C) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

var functions = {
    /**
     * If the function's (method's) result is NaN,
     * the general expression evaluator treats this as an error,
     * so there is no need to handle the NaN result
     * within the function implementation itself.
     * Only arity errors and function-specific errors
     * should be handled inside the functions.
     */

    // All method names must be in lowercase

    /**
     * Mathematical Functions
     */

    // Calculates the absolute value of a number.
    abs(num) {
        if (arguments.length !== 1) {
            throw new Error('The abs() function takes 1 argument.');
        }
        return Math.abs(num);
    },

    // Returns a number rounded up to the next integer.
    ceil(num) {
        if (arguments.length !== 1) {
            throw new Error('The ceil() function takes 1 argument.');
        }
        return Math.ceil(num);
    },

    // Calculates e to the power of a number.
    exp(num) {
        if (arguments.length !== 1) {
            throw new Error('The exp() function takes 1 argument.');
        }
        return Math.exp(num);
    },

    // Returns a number rounded down to the closest integer.
    floor(num) {
        if (arguments.length !== 1) {
            throw new Error('The floor() function takes 1 argument.');
        }
        return Math.floor(num);
    },

    // Returns the integer part of a number by removing any fractional digits.
    int(num) {
        if (arguments.length !== 1) {
            throw new Error('The int() function takes 1 argument.');
        }
        return Math.trunc(num);
    },

    // Inverts the Boolean representation of a value.
    invert(val) {
        if (arguments.length !== 1) {
            throw new Error('The invert() function takes 1 argument.');
        }
        return !toBoolean(val) ? 1 : 0;
    },

    // Calculates the natural logarithm of a number.
    log(num) {
        if (arguments.length !== 1) {
            throw new Error('The log() function takes 1 argument.');
        }
        return Math.log(num);
    },

    // Calculates the common (decimal) logarithm of a number.
    log10(num) {
        if (arguments.length !== 1) {
            throw new Error('The log10() function takes 1 argument.');
        }
        return Math.log10(num);
    },

    // Calculates the binary logarithm of a number.
    log2(num) {
        if (arguments.length !== 1) {
            throw new Error('The log2() function takes 1 argument.');
        }
        return Math.log2(num);
    },

    // Returns the largest of the passed numbers.
    max(...args) {
        if (args.length === 0) {
            throw new Error('The max() function requires at least 1 argument.');
        }
        return Math.max(...args);
    },

    // Returns the smallest of the passed numbers.
    min(...args) {
        if (args.length === 0) {
            throw new Error('The min() function requires at least 1 argument.');
        }
        return Math.min(...args);
    },

    // Calculates a number to a power.
    pow(base, exponent) {
        if (arguments.length !== 2) {
            throw new Error('The pow() function takes 2 arguments.');
        }
        return Math.pow(base, exponent);
    },

    // Returns a number rounded to the specified number of decimal places.
    round(num, decimals = 0) {
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error('The round() function takes 1 or 2 arguments.');
        }
        var factor = 10 ** decimals;
        return Math.round(num * factor) / factor;
    },

    // Calculates the square-root of a number.
    sqrt(num) {
        if (arguments.length !== 1) {
            throw new Error('The sqrt() function takes 1 argument.');
        }
        return Math.sqrt(num);
    },

    /**
     * Array Functions
     */

    // Adds the element to the array.
    arrayadd(json, elem) {
        if (arguments.length !== 2) {
            throw new Error('The arrayadd() function takes 2 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (!Array.isArray(parsed)) {
                throw new Error('Invalid argument #1 for function arrayadd(): it must be an array.');
            }
            parsed.push(elem);
            return JSON.stringify(parsed);
        } catch (e) {
            throw new Error(`Invalid argument #1 for function arrayadd(): it must be an array. ${e}`);
        }
    },

    // Deletes the element from the array by index.
    arraydel(json, ind) {
        if (arguments.length !== 2) {
            throw new Error('The arraydel() function takes 2 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (!Array.isArray(parsed)) {
                throw new Error('Invalid argument #1 for function arraydel(): it must be an array.');
            }
            if (typeof ind !== 'number' || !Number.isInteger(ind)) {
                throw new Error('Invalid argument #2 for function arraydel(): it must be an integer index.');
            }
            // Indexing in URQL arrays starts from 1
            if (ind <= 0 || ind > parsed.length) {
                throw new Error('Invalid argument #2 for function arraydel(): index out of bounds.');
            }
            parsed.splice(ind - 1, 1);
            return JSON.stringify(parsed);
        } catch (e) {
            throw new Error(`Invalid argument #1 for function arraydel(): it must be an array. ${e}`);
        }
    },

    // Returns the element from the array by index.
    arrayget(json, ind) {
        if (arguments.length !== 2) {
            throw new Error('The arrayget() function takes 2 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (!Array.isArray(parsed)) {
                throw new Error('Invalid argument #1 for function arrayget(): it must be an array.');
            }
            if (typeof ind !== 'number' || !Number.isInteger(ind)) {
                throw new Error('Invalid argument #2 for function arrayget(): it must be an integer index.');
            }
            // Indexing in URQL arrays starts from 1
            if (ind <= 0 || ind > parsed.length) {
                throw new Error('Invalid argument #2 for function arrayget(): index out of bounds.');
            }
            var val = parsed[ind - 1];
            if (typeof val !== 'string' && typeof val !== 'number') {
                val = JSON.stringify(val);
            }
            return val;
        } catch (e) {
            throw new Error(`Invalid argument #1 for function arrayget(): it must be an array. ${e}`);
        }
    },

    // Returns the number of elements in the array.
    arraylen(json) {
        if (arguments.length !== 1) {
            throw new Error('The arraylen() function takes 1 argument.');
        }
        try {
            var parsed = JSON.parse(json);
            if (!Array.isArray(parsed)) {
                throw new Error('Invalid argument #1 for function arraylen(): it must be an array.');
            }
            return parsed.length;
        } catch (e) {
            throw new Error(`Invalid argument #1 for function arraylen(): it must be an array. ${e}`);
        }
    },

    // Sets the value of the element in the array by index.
    arrayset(json, ind, val) {
        if (arguments.length !== 3) {
            throw new Error('The arrayset() function takes 3 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (!Array.isArray(parsed)) {
                throw new Error('Invalid argument #1 for function arrayset(): it must be an array.');
            }
            if (typeof ind !== 'number' || !Number.isInteger(ind)) {
                throw new Error('Invalid argument #2 for function arrayset(): it must be an integer index.');
            }
            // Indexing in URQL arrays starts from 1
            if (ind <= 0 || ind > parsed.length) {
                throw new Error('Invalid argument #2 for function arrayset(): index out of bounds.');
            }
            parsed[ind - 1] = val;
            return JSON.stringify(parsed);
        } catch (e) {
            throw new Error(`Invalid argument #1 for function arrayset(): it must be an array. ${e}`);
        }
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

    // Checks whether a value has the derived type array.
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

    // Checks whether a value has the derived type boolean.
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
            throw new Error('Invalid argument #1 for function isdeclared(): it must be a string.');
        }
        varName = varName.toLowerCase().trim();
        var exists = Object.prototype.hasOwnProperty.call(Game.vars, varName);
        return exists ? 1 : 0;
    },

    // Checks whether a value has the primitive type number.
    isnumber(val) {
        if (arguments.length !== 1) {
            throw new Error('The isnumber() function takes 1 argument.');
        }
        return typeof val === 'number' ? 1 : 0;
    },

    // Checks whether a value has the derived type object.
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

    // Checks whether a value has the primitive type string.
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

    // Deletes the key from the object.
    objectdel(json, key) {
        if (arguments.length !== 2) {
            throw new Error('The objectdel() function takes 2 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid argument #1 for function objectdel(): it must be an object.');
            }
            var exists = Object.prototype.hasOwnProperty.call(parsed, key);
            var deleted = delete parsed[key];
            var errorCode, errorDesc;
            if (!exists) {
                errorCode = 1;
                errorDesc = `The key '${key}' does not exist in the object.`;
            } else if (!deleted) {
                errorCode = 1;
                errorDesc = `Failed to delete the key '${key}'.`;
            }
            if (errorCode) {
                setGlobalError(errorCode, errorDesc);
            }
            return JSON.stringify(parsed);
        } catch (e) {
            throw new Error(`Invalid argument #1 for function objectdel(): it must be an object. ${e}`);
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
                throw new Error('Invalid argument #1 for function objectentries(): it must be an object.');
            }
            var pairs = Object.entries(parsed);
            return JSON.stringify(pairs);
        } catch (e) {
            throw new Error(`Invalid argument #1 for function objectentries(): it must be an object. ${e}`);
        }
    },

    // Returns a value of the key from the object.
    objectget(json, key) {
        if (arguments.length !== 2) {
            throw new Error('The objectget() function takes 2 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid argument #1 for function objectget(): it must be an object.');
            }
            var val = parsed[key];
            if (typeof val !== 'string' && typeof val !== 'number') {
                val = JSON.stringify(val);
            }
            return val;
        } catch (e) {
            throw new Error(`Invalid argument #1 for function objectget(): it must be an object. ${e}`);
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
                throw new Error('Invalid argument #1 for function objectkeys(): it must be an object.');
            }
            var keys = Object.keys(parsed);
            return JSON.stringify(keys);
        } catch (e) {
            throw new Error(`Invalid argument #1 for function objectkeys(): it must be an object. ${e}`);
        }
    },

    // Sets the value of the key in the object.
    objectset(json, key, val) {
        if (arguments.length !== 3) {
            throw new Error('The objectset() function takes 3 arguments.');
        }
        try {
            var parsed = JSON.parse(json);
            if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Invalid argument #1 for function objectset(): it must be an object.');
            }
            parsed[key] = val;
            return JSON.stringify(parsed);
        } catch (e) {
            throw new Error(`Invalid argument #1 for function objectset(): it must be an object. ${e}`);
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
                throw new Error('Invalid argument #1 for function objectvalues(): it must be an object.');
            }
            var values = Object.values(parsed);
            return JSON.stringify(values);
        } catch (e) {
            throw new Error(`Invalid argument #1 for function objectvalues(): it must be an object. ${e}`);
        }
    },

    /**
     * String Functions
     */

    // TODO: stringinstr

    // Returns a number of characters from the left-hand side of the string.
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

    // Returns a number of characters in the string.
    stringlen(str) {
        if (arguments.length !== 1) {
            throw new Error('The stringlen() function takes 1 argument.');
        }
        return String(str).length;
    },

    // Converts the string to lowercase using locale-specific rules.
    stringlocalelower(str, locale) {
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error('The stringlocalelower() function takes 1 or 2 arguments.');
        }
        if (arguments.length === 1) {
            locale = Game.getVar('urqw_game_lang');
            if (!locale) {
                locale = document.documentElement.lang;
            }
        }
        return String(str).toLocaleLowerCase(locale);
    },

    // Converts the string to uppercase using locale-specific rules.
    stringlocaleupper(str, locale) {
        if (arguments.length < 1 || arguments.length > 2) {
            throw new Error('The stringlocaleupper() function takes 1 or 2 arguments.');
        }
        if (arguments.length === 1) {
            locale = Game.getVar('urqw_game_lang');
            if (!locale) {
                locale = document.documentElement.lang;
            }
        }
        return String(str).toLocaleUpperCase(locale);
    },

    // Converts the string to lowercase.
    stringlower(str) {
        if (arguments.length !== 1) {
            throw new Error('The stringlower() function takes 1 argument.');
        }
        return String(str).toLowerCase();
    },

    // Extracts a number of characters from the string.
    stringmid(str, start, count) {
        if (arguments.length < 2 || arguments.length > 3) {
            throw new Error('The stringmid() function takes 2 or 3 arguments.');
        }
        str = String(str);
        if (start <= 0 || start > str.length) {
            return '';
            }
        if (arguments.length === 2) {
            return str.slice(start - 1);
        }
        if (count <= 0) {
            return '';
        }
        return str.slice(start - 1, start - 1 + count);
    },

    // TODO: stringregexp
    // TODO: stringregexpreplace
    // TODO: stringreplace

    // Returns a number of characters from the right-hand side of the string.
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

    // Splits up the string into substrings depending on the given delimiter.
    stringsplit(str, delimiter) {
        if (arguments.length !== 2) {
            throw new Error('The stringsplit() function takes 2 arguments.');
        }
        str = String(str);
        delimiter = String(delimiter);
        var parts = str.split(delimiter);
        return JSON.stringify(parts);
    },

    // Trims whitespace characters or a number of characters from the beginning and end of the string.
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

    // Trims either whitespace characters or a number of characters from the left hand side of the string.
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

    // Trims either whitespace characters or a number of characters from the right hand side of the string.
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

    // Converts the string to uppercase.
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
