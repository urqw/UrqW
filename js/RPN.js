/**
 * @author narmiel
 */

/**
 * @param {string} str выражение
 *
 * @constructor
 */
function Expression(str) {

    /**
     * @return {Array}
     *
     * токенолизатор
     */
    this.tokenize = function (str) {
        str = ' ' + str + ' ';
        str = str.replace(' not ', '  not  '); // пока так (чтобы not мог прилипать ко всему)
        return str.split(/( AND | OR | NOT |\|\||&&|<>|!=|==|<=|>=|\+|\-|\*|\/|>|<|=|\(|\)|!)/gi);
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
        var lastTokenIsOperator = null;

        for (var i = 0; i < this.expr.length; i++) {
            var token = this.expr[i].trim();

            if (token.length == 0) continue;

            // если отрицательное число
            if (lastTokenIsOperator && token == '-') {

                do {
                    token = this.expr[++i].trim();
                } while(token.length == 0);

                exitStack.push(-parseFloat(token.replace(',', '.').replace(' ', '')));
                // если число
            } else if (!isNaN(token.replace(',', '.').replace(' ', ''))) {
                // считываем всё число дальше
                exitStack.push(parseFloat(token.replace(',', '.').replace(' ', '')));
            } else if (this.getPriority(token) > 0) {
                if (token == '(') {
                    operStack.push(token);
                } else if (token == ')') {
                    while (operStack[operStack.length - 1] != '(') {
                        exitStack.push(operStack.pop());
                    }

                    operStack.pop();
                } else {
                    while (this.getPriority(token) <= this.getPriority(operStack[operStack.length - 1])) {
                        if (operStack.length == 0) break;
                        exitStack.push(operStack.pop());
                    }

                    operStack.push(token);
                }
            } else if (token.substr(0, 1) == '\'' || token.substr(0, 1) == '\"') {
                if (token.substr(-1, 1) == '\'' || token.substr(-1, 1) == '\"') {
                    exitStack.push(token.substr(1, (token.length - 2)));
                }
            } else {
                exitStack.push(Game.getVar(token));
            }

            lastTokenIsOperator = (this.getPriority(token) > 1);
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
            token = stack[i];

            if (this.getPriority(token) > 0) {
                var result;

                if (token == '!' || token == 'not') {
                    result = !temp.pop();
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
                        case '+':
                            result = b + a;
                            break;
                        case '-':
                            result = b - a;
                            break;
                        case '==':
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
                            result = b && a;
                            break;
                        case '||':
                        case 'or':
                            result = b || a;
                            break;
                    }
                }

                temp.push(result);
            } else {
                temp.push(token);
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
            case '!':
                return 15;
            case '*':
            case '/':
                return 14;
            case '+':
            case '-':
                return 13;
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

