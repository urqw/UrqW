/**
 * Copyright (C) 2015 Akela <akela88@bk.ru>
 * Copyright (C) 2025, 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/**
 * Evaluates an expression using different algorithms depending on the URQ mode.
 * @param {string} str Expression
 * @returns {number|string} The result of the evaluation
 */
function Expression(exp) {
    // Use a simpler algorithm for compatibility with older games
    // (e.g., it supports spaces in variable names,
    // but does not support built-in functions).
    var result;
    if (['ripurq', 'dosurq', 'akurq', 'urqw1'].includes(Game.getVar('urq_mode'))) {
        result = new ShuntingYardEvaluator(exp).calc();
    } else {
        result = new RecursiveDescentEvaluator(exp).calc();
    }
    return result;
}

/**
 * New Expression Evaluator Base on the Recursive Descent Method
 * Usage: var result = new RecursiveDescentEvaluator(exp).calc();
 * @param {string} str Expression
 *
 * @constructor
 */
function RecursiveDescentEvaluator(str) {
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
            if (op === '=') {
                if ((typeof value === 'string') && (typeof right === 'string')) {
                    res = value.toLowerCase() == right.toLowerCase();
                } else {
                    res = value == right;
                }
            } else if (op === '==') {
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
                        var errorDesc = `The ${lower}() function returned NaN. The call was likely made with invalid arguments: ${String(args)}`;
                        setGlobalError(1, errorDesc);
                        throw new Error(errorDesc);
                    }

                    // If function executes successfully, reset error flags.
                    // This overrides any errors that occurred in argument evaluation,
                    // ensuring the final state reflects the last successful call.
                    if (Game.getVar('error') === 0) {
                        setGlobalError(0, '');
                    }
                    
                    return result;
                } catch (e) {
                    // If function throws an exception, set global error
                    setGlobalError(1, e.message);
                    // The caller (DSL engine) should handle this exception if needed.
                    throw e;
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
 * Old Expression Evaluator Base on the Shunting Yard Algorithm and Reverse Polish Notation
 * Usage: var result = new ShuntingYardEvaluator(exp).calc();
 * @param {string} str Expression
 *
 * @constructor
 */
function ShuntingYardEvaluator(str) {

    /**
     * @return {Array}
     *
     * Tokenizer
     */
    this.tokenize = function (str) {
        str = ' ' + str + ' ';
        // The not operator immediately after the left parenthesis is not processed correctly
        str = str.replace(/\(not /g, '\( not ');
        // For now, do it this way (so that "not" can stick to everything)
        str = str.replace(/ not /g, '  not  ');
        return str.split(/(".+?"|'.+?'| AND | OR | NOT |\|\||&&|<>|!=|==|<=|>=|\^|\+|\-|\*|\/|>|<|=|\(|\))/gi);
    };

    /**
     * @type {Array}
     */
    this.expr = this.tokenize(str);

    /**
     * @returns {Array}
     */
    this.toRPN = function () {
        var exitStack = [];
        var operStack = [];
        var lastWasOperand = false;

        for (var i = 0; i < this.expr.length; i++) {
            var token = this.expr[i].trim();

            if (token.length == 0) continue;

            // Unary operators
            if ((token == '-' || token == '+') && !lastWasOperand) {
                token = (token == '-') ? 'u-' : 'u+';
                var tokenPriority = this.getPriority(token);
                var topPriority = operStack.length > 0 ? this.getPriority(operStack[operStack.length - 1]) : 0;

                while (tokenPriority <= topPriority) {
                    exitStack.push(operStack.pop());
                    topPriority = operStack.length > 0 ? this.getPriority(operStack[operStack.length - 1]) : 0;
                }
                operStack.push(token);
                continue; 
            }
            
            // ordinary number
            if (!isNaN(token.replace(',', '.').replace(/ /g, ''))) {
                // Read number further
                exitStack.push([parseFloat(token.replace(',', '.').replace(/ /g, ''))]);
                lastWasOperand = true;
            } else if (this.getPriority(token) > 0) {
                // binary operator
                if (token == '(') {
                    operStack.push(token);
                    lastWasOperand = false;
                } else if (token == ')') {
                    while (operStack[operStack.length - 1] != '(') {
                        exitStack.push(operStack.pop());
                    }

                    operStack.pop();
                    lastWasOperand = true;
                } else {
                    var tokenPriority = this.getPriority(token);
                    var topPriority = operStack.length > 0 ? this.getPriority(operStack[operStack.length - 1]) : 0;
                    // For right-associative operators
                    if (token === '^') {
                        while (tokenPriority < topPriority) {
                            exitStack.push(operStack.pop());
                            topPriority = operStack.length > 0 ? this.getPriority(operStack[operStack.length - 1]) : 0;
                        }
                    } else {
                        // For left-associative operators
                        while (tokenPriority <= topPriority) {
                            if (operStack.length == 0) break;
                            exitStack.push(operStack.pop());
                            topPriority = operStack.length > 0 ? this.getPriority(operStack[operStack.length - 1]) : 0;
                        }
                    }

                    operStack.push(token);
                    lastWasOperand = false;
                }
            } else {
                var variable = Game.getVar(token);

                if (variable === 0) {
                    if (token.substr(0, 1) == '\'' || token.substr(0, 1) == '\"') {
                        if (token.substr(-1, 1) == '\'' || token.substr(-1, 1) == '\"') {
                            variable = token.substr(1, (token.length - 2));;
                        }
                    }
                }

                exitStack.push([variable]);
                lastWasOperand = true;
            }
        }

        while (operStack.length > 0) {
            exitStack.push(operStack.pop());
        }

        return exitStack;
    };


    /**
     * @returns {int}
     */
    this.calc = function () {
        var stack = this.toRPN();

        var temp = [];

        for (var i = 0; i < stack.length; i++) {
            var token = stack[i];

            if (this.getPriority(token) > 0) {
                var result;

                // Handling unary operators
                if (token == 'u-') {
                    var a = temp.pop();
                    if (typeof a === 'boolean') {
                        result = !a;
                    } else {
                        result = -a;
                    }
                    temp.push(result);
                    continue;
                }

                if (token == 'u+') {
                    var a = temp.pop();
                    if (typeof a === 'number') {
                        result = +a; 
                    } else {
                        result = a;
                    }
                    temp.push(result);
                    continue;
                }

                if (/*token == '!' ||*/ token == 'not') {
                    var variable = temp.pop();

                    result = !(toBoolean(variable));
                } else {
                    var a = temp.pop();
                    var b = temp.pop();

                    switch (token) {
                        case '*':
                            result = b * a;
                            break;
                        case '/':
                            result = b / a;
                            break;
                        case '^':
                            result = b ** a;
                            break;
                        case '+':
                            result = b + a;
                            break;
                        case '-':
                            result = b - a;
                            break;
                        case '==':
                            if ((typeof b == 'string') && (typeof a == 'string')) {
                                var reg = new RegExp('^' + a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&").replace(/\\\*/g, '.*').replace(/\\\?/g, '.') + '$', 'i');
                                result = b.search(reg) != -1;
                            } else {
                                result = b == a;
                            }
                            break;
                        case '=':
                            if ((typeof b == 'string') && (typeof a == 'string')) {
                                result = b.toLowerCase() == a.toLowerCase();
                            } else {
                                result = b == a;
                            }
                            break;
                        case '!=':
                        case '<>':
                            if ((typeof b == 'string') && (typeof a == 'string')) {
                                result = b.toLowerCase() != a.toLowerCase();
                            } else {
                                result = b != a;
                            }

                            break;
                        case '>':
                            result = b > a;
                            break;
                        case '<':
                            result = b < a;
                            break;
                        case '>=':
                            result = b >= a;
                            break;
                        case '<=':
                            result = b <= a;
                            break;
                        case '&&':
                        case 'and':
                            result = toBoolean(b) && toBoolean(a)
                            break;
                        case '||':
                        case 'or':
                            result = toBoolean(b) || toBoolean(a)
                            break;
                    }
                }

                temp.push(result);
            } else {
                temp.push(token[0]);
            }
        }
        
        return temp.pop();
    };

    /**
     * @param operand
     * @returns {number}
     */
    this.getPriority = function (operand) {
        switch (operand) {
            case 'not':
                return 16;
            case '^':
                return 15;
            case 'u+':
            case 'u-':
                return 14;
            case '*':
            case '/':
                return 13;
            case '+':
            case '-':
                return 12;
            case '<':
            case '<=':
            case '>':
            case '>=':
                return 11;
            case '=':
            case '==':
            case '!=':
            case '<>':
                return 10;
            case '&&':
            case 'and':
                return 6;
            case '||':
            case 'or':
                return 5;
            case '(':
            case ')':
                return 1;
            default:
                return 0;
        }
    }
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

/**
 * Set or clear global error flags in the variable store
 * @param {number} code - Error code; 0 clears variables
 * @param {string} [msg=''] - Error description message
 * @returns {void}
 */
// Set global error flags via GlobalPlayer.setVar
function setGlobalError(code, msg = '') {
    if (code === 0) {
        GlobalPlayer.varkill('error');
        GlobalPlayer.varkill('error_desc');
    } else {
        GlobalPlayer.setVar('error', code);
        GlobalPlayer.setVar('error_desc', msg);
    }
}
