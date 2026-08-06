/**
 * Copyright (C) 2015 Akela <akela88@bk.ru>
 * Copyright (C) 2025, 2026 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/**
 * @param {string} str Expression
 *
 * @constructor
 */
function Expression(str) {

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
