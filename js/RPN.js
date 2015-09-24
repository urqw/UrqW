/**
 * @author narmiel
 */

/**
 * @param {string} str выражение
 *
 * @constructor
 */
function Expression(str) {

    this.expr = str;

    /**
     * @returns {Array}
     */
    this.toRPN = function () {
        var exitStack = [];
        var operStack = [];

        for (var i = 0; i < this.expr.length; i++) {
            if (this.expr[i] == ' ') continue;
            var token = [];

            // если число
            if (!isNaN(this.expr[i])) {
                // считываем всё число дальше

                while (' 0123456789,.'.indexOf(this.expr[i]) != -1) {
                    token.push(this.expr[i]);

                    i++;

                    if (i >= this.expr.length) break;
                }

                exitStack.push(parseFloat(token.join('').replace(',', '.')));

                i--;
                continue;
            }

            token.push(this.expr[i]);

            if (this.expr[i] == '=' && this.expr[i + 1] == '=') {
                    token.push(this.expr[++i]);
            } else if (this.expr[i] == '<' && this.expr[i + 1] == '=') {
                    token.push(this.expr[++i]);
            } else if (this.expr[i] == '<' && this.expr[i + 1] == '>') {
                    token.push(this.expr[++i]);
            } else if (this.expr[i] == '>' && this.expr[i + 1] == '=') {
                    token.push(this.expr[++i]);
            } else if (this.expr[i] == '!' && this.expr[i + 1] == '=') {
                    token.push(this.expr[++i]);
            } else if (this.expr[i] == '&' && this.expr[i + 1] == '&') {
                    token.push(this.expr[++i]);
            } else if (this.expr[i] == '|' && this.expr[i + 1] == '|') {
                    token.push(this.expr[++i]);
            } else if (this.expr[i] == 'o' && this.expr[i + 1] == 'r' && this.expr[i + 2] == ' ') {
                    token.push(this.expr[++i]);
            } else if (this.expr[i] == 'a' && this.expr[i + 1] == 'n' && this.expr[i + 2] == 'd' && this.expr[i + 3] == ' ') {
                    token.push(this.expr[++i]);
                    token.push(this.expr[++i]);
            }

            token = token.join('');

            if (this.getPriority(token) > 0) {
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
            } else if (token == '\'') {
                token = [];
                i++;

                while ('\''.indexOf(this.expr[i]) == -1) {
                    token.push(this.expr[i]);

                    i++;

                    if (i >= this.expr.length) break;
                }

                exitStack.push(token.join(''));
            } else if (token == '\"') {
                token = [];
                i++;

                while ('\"'.indexOf(this.expr[i]) == -1) {
                    token.push(this.expr[i]);

                    i++;

                    if (i >= this.expr.length) break;
                }

                exitStack.push(token.join(''));
            } else {
                token = [];

                while (' ><?=/^&*!|()+-'.indexOf(this.expr[i]) == -1) {
                    token.push(this.expr[i]);

                    i++;

                    if (i >= this.expr.length) break;
                }

                if (token.length > 0) {
                    i--;
                }

                exitStack.push(Game.getVar(token.join('')));
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
            token = stack[i];

            if (this.getPriority(token) > 0) {
                var result;
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

