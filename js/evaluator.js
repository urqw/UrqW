/**
 * Copyright (C) 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/**
 * Expression Evaluator
 * Usage: var result = new Expression(exp).calc();
 * @param {string} str Expression
 *
 * @constructor
 */
function Expression(str) {
    var tokens = [];
    var pos = 0;

    // Tokenize input string into a list of tokens (NUMBER, STRING, OPERATOR, IDENTIFIER)
    function tokenize(input) {
        var result = [];
        var i = 0;
        var len = input.length;

        while (i < len) {
            var char = input[i];

            // Skip whitespace
            if (/\s/.test(char)) { i++; continue; }

            // Handle string literals (double or single quotes)
            if (char === '"' || char === "'") {
                var quote = char;
                var start = ++i;
                while (i < len && input[i] !== quote) i++;
                if (i >= len) throw new Error("Unclosed string literal");
                result.push({ type: 'STRING', value: input.substring(start, i) });
                i++; 
                continue;
            }

            // Handle numeric literals
            if (/[0-9]/.test(char)) {
                var start = i;
                while (i < len && (/[0-9]/.test(input[i]) || input[i] === '.')) i++;
                var raw = input.substring(start, i);
                var numVal = parseFloat(raw);
                if (isNaN(numVal)) throw new Error("Invalid number: " + raw);
                result.push({ type: 'NUMBER', value: numVal });
                continue;
            }

            var remaining = input.substring(i);
            
            // Handle multi-character operators
            if (remaining.startsWith('&&')) { result.push({ type: 'OPERATOR', value: '&&' }); i += 2; continue; }
            if (remaining.startsWith('||')) { result.push({ type: 'OPERATOR', value: '||' }); i += 2; continue; }
            if (remaining.startsWith('==')) { result.push({ type: 'OPERATOR', value: '==' }); i += 2; continue; }
            if (remaining.startsWith('!=')) { result.push({ type: 'OPERATOR', value: '!=' }); i += 2; continue; }
            if (remaining.startsWith('<>')) { result.push({ type: 'OPERATOR', value: '<>' }); i += 2; continue; }
            if (remaining.startsWith('<=')) { result.push({ type: 'OPERATOR', value: '<=' }); i += 2; continue; }
            if (remaining.startsWith('>=')) { result.push({ type: 'OPERATOR', value: '>=' }); i += 2; continue; }

            // Handle single-character operators
            if (['+', '-', '*', '/', '^', '(', ')', ',', '<', '>', '='].indexOf(char) !== -1) {
                result.push({ type: 'OPERATOR', value: char });
                i++;
                continue;
            }

            // Handle keyword operators (and, or, not) before identifiers
            var lowerSub = remaining.toLowerCase();
            if (lowerSub.startsWith('and')) {
                var nextChar = input[i + 3];
                if (!/[a-z0-9_]/.test(nextChar)) {
                    result.push({ type: 'OPERATOR', value: 'and' });
                    i += 3;
                    continue;
                }
            }
            if (lowerSub.startsWith('or')) {
                var nextChar = input[i + 2];
                if (!/[a-z0-9_]/.test(nextChar)) {
                    result.push({ type: 'OPERATOR', value: 'or' });
                    i += 2;
                    continue;
                }
            }
            if (lowerSub.startsWith('not')) {
                var nextChar = input[i + 3];
                if (!/[a-z0-9_]/.test(nextChar)) {
                    result.push({ type: 'OPERATOR', value: 'not' });
                    i += 3;
                    continue;
                }
            }

            // Handle identifiers (variables/functions): consume until delimiter
            var start = i;
            while (i < len) {
                var c = input[i];
                if (/\s/.test(c)) break;
                if (c === '"' || c === "'") break;
                if (['+', '-', '*', '/', '^', '(', ')', ',', '<', '>', '=', '&', '|'].indexOf(c) !== -1) break;
                i++;
            }
            var name = input.substring(start, i);
            if (name.length === 0) throw new Error("Unexpected token");
            result.push({ type: 'IDENTIFIER', value: name });
            continue;
        }
        return result;
    }

    tokens = tokenize(str);

    // Return next token without consuming
    function peek() { return pos < tokens.length ? tokens[pos] : null; }
    
    // Consume next token, validate type/value if provided
    function consume(expectedType, expectedValue) {
        var t = peek();
        if (!t) throw new Error("Unexpected end");
        if (expectedType && t.type !== expectedType) throw new Error("Expected " + expectedType);
        if (expectedValue && t.value !== expectedValue) throw new Error("Expected '" + expectedValue + "'");
        pos++;
        return t;
    }

    // Set global error flags via GlobalPlayer.setVar
    function setGlobalError(code, msg) {
        GlobalPlayer.setVar('error', code);
        GlobalPlayer.setVar('error_desc', msg);
    }

    // Parse logical OR (lowest precedence): A || B | or
    function parseLogicalOr() {
        var value = parseLogicalAnd();
        while (true) {
            var t = peek();
            if (!t || t.type !== 'OPERATOR' || (t.value !== '||' && t.value !== 'or')) break;
            consume('OPERATOR');
            var right = parseLogicalAnd();
            value = toBoolean(value) || toBoolean(right);
        }
        return value;
    }

    // Parse logical AND: A && B | and
    function parseLogicalAnd() {
        var value = parseComparison();
        while (true) {
            var t = peek();
            if (!t || t.type !== 'OPERATOR' || (t.value !== '&&' && t.value !== 'and')) break;
            consume('OPERATOR');
            var right = parseComparison();
            value = toBoolean(value) && toBoolean(right);
        }
        return value;
    }

    // Parse comparisons: A < B, A == B, etc.
    function parseComparison() {
        var value = parseAddSub();
        while (true) {
            var t = peek();
            if (!t || t.type !== 'OPERATOR') break;
            var op = t.value;
            if (op !== '<' && op !== '>' && op !== '<=' && op !== '>=' && 
                op !== '==' && op !== '=' && op !== '!=' && op !== '<>') break;
            
            consume('OPERATOR');
            var right = parseAddSub();
            var res = false;
            if (op === '=' || op === '==') {
                if ((typeof value === 'string') && (typeof right === 'string')) {
                    var reg = new RegExp('^' + right.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace(/\\\*/g, '.*').replace(/\\\?/g, '.') + '$', 'i');
                    res = value.search(reg) != -1;
                } else {
                    res = value == right;
                }
            } else if (op === '!=' || op === '<>') {
                if ((typeof value === 'string') && (typeof right === 'string')) {
                    res = value.toLowerCase() != right.toLowerCase();
                } else {
                    res = value != right;
                }
            } else if (op === '<') res = value < right;
            else if (op === '>') res = value > right;
            else if (op === '<=') res = value <= right;
            else if (op === '>=') res = value >= right;
            
            value = res;
        }
        return value;
    }

    // Parse addition/subtraction
    function parseAddSub() {
        var value = parseMultDiv();
        while (true) {
            var t = peek();
            if (!t || t.type !== 'OPERATOR' || (t.value !== '+' && t.value !== '-')) break;
            consume('OPERATOR');
            var right = parseMultDiv();
            value = (t.value === '+') ? value + right : value - right;
        }
        return value;
    }

    // Parse multiplication/division
    function parseMultDiv() {
        var value = parsePower();
        while (true) {
            var t = peek();
            if (!t || t.type !== 'OPERATOR' || (t.value !== '*' && t.value !== '/')) break;
            consume('OPERATOR');
            var right = parsePower();
            // Pure math: returns Infinity or NaN
            value = (t.value === '*') ? value * right : value / right;
        }
        return value;
    }

    // Parse exponentiation (right-associative)
    function parsePower() {
        var value = parseUnary();
        var t = peek();
        if (t && t.type === 'OPERATOR' && t.value === '^') {
            consume('OPERATOR');
            var right = parsePower();
            return Math.pow(value, right);
        }
        return value;
    }

    // Parse unary operators (+, -, not)
    function parseUnary() {
        var t = peek();
        if (t && t.type === 'OPERATOR') {
            if (t.value === '+' || t.value === '-') {
                consume('OPERATOR');
                var op = parseUnary();
                return (t.value === '-') ? -op : +op;
            }
            if (t.value === 'not') {
                consume('OPERATOR');
                var op = parseUnary();
                return !toBoolean(op);
            }
        }
        return parsePrimary();
    }

    // Parse primary elements: numbers, strings, parenthesized expressions, variables, functions
    function parsePrimary() {
        var t = peek();
        if (t && t.type === 'NUMBER') { consume('NUMBER'); return t.value; }
        if (t && t.type === 'STRING') { consume('STRING'); return t.value; }
        if (t && t.type === 'OPERATOR' && t.value === '(') {
            consume('OPERATOR');
            var val = parseLogicalOr();
            var close = peek();
            if (!close || close.value !== ')') throw new Error("Missing )");
            consume('OPERATOR');
            return val;
        }
        if (t && t.type === 'IDENTIFIER') {
            var name = t.value;
            consume('IDENTIFIER');
            var lower = name.toLowerCase();
            
            // Prevent 'and', 'or', 'not' from being treated as functions if followed by '('
            if (['and', 'or', 'not'].indexOf(lower) !== -1) {
                var next = peek();
                if (next && next.type === 'OPERATOR' && next.value === '(') {
                    throw new Error("Syntax error: '" + name + "' is an operator");
                }
                return Game.getVar(lower);
            }

            // Handle function calls
            var next = peek();
            if (next && next.type === 'OPERATOR' && next.value === '(') {
                consume('OPERATOR');
                
                // Reset global error state before executing any function.
                // This ensures the result reflects the status of the current call only.
                setGlobalError(0, '');
                
                var args = [];
                if (peek() && peek().value !== ')') {
                    args.push(parseLogicalOr());
                    while (true) {
                        var comma = peek();
                        if (comma && comma.type === 'OPERATOR' && comma.value === ',') {
                            consume('OPERATOR');
                            args.push(parseLogicalOr());
                        } else break;
                    }
                }
                var close = peek();
                if (!close || close.value !== ')') throw new Error("Missing ) in function");
                consume('OPERATOR');
                
                try {
                    var func = functions[lower];
                    if (!func) throw new Error("Function '" + name + "' not found");
                    
                    var result = func.apply(null, args);
                    
                    // Handle NaN return values explicitly
                    if (typeof result === 'number' && isNaN(result)) {
                        setGlobalError(1, "Function '" + name + "' returned NaN");
                        return 0;
                    }

                    // If function executes successfully, reset error flags.
                    // This overrides any errors that occurred in argument evaluation,
                    // ensuring the final state reflects the last successful call.
                    setGlobalError(0, ''); 
                    
                    return result;
                } catch (e) {
                    // If function throws an exception, set global error
                    setGlobalError(1, e.message);
                    return 0;
                }
            }
            return Game.getVar(lower);
        }
        throw new Error("Unexpected token: " + (t ? t.value : "EOF"));
    }

    // Public API: evaluate expression and return result
    this.calc = function() {
        try {
            pos = 0;
            // No reset here: if no functions are called, global error state remains untouched.
            return parseLogicalOr();
        } catch (e) {
            // Syntax errors (unexpected tokens, missing parens) are thrown.
            // The caller (DSL engine) should handle this exception if needed.
            throw e;
        }
    };
}

/**
 * Conversion to a boolean value
 * @param value
 * @returns {boolean}
 */
function toBoolean(value) {
    return (
        value === true ||
        (typeof value === 'number' && value !== 0) ||
        (typeof value === 'string' && value.length > 0)
    );
}
