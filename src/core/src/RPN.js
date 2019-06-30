/**
 * @author narmiel
 */

export default class Expression {
  /**
   * @param {string} str выражение
   * @param {Game} Game
   */
  constructor(str, Game) {
    this.Game = Game;

    /**
     * @type {Array}
     */
    this.expr = this.tokenize(str);
  }

  toRPN() {
    const exitStack = [];
    const operStack = [];
    let lastTokenIsOperator = true;

    for (var i = 0; i < this.expr.length; i++) {
      var token = this.expr[i].trim();

      if (token.length === 0) {
        continue;
      }

      // если отрицательное число
      const preparedToken = token.replace(",", ".").replace(/ /g, "");
      if (lastTokenIsOperator && token === "-") {
        do {
          token = this.expr[++i].trim();
        } while (token.length === 0);

        exitStack.push([-parseFloat(preparedToken)]);
        // если число
      } else if (!isNaN(preparedToken)) {
        // считываем всё число дальше
        exitStack.push([parseFloat(preparedToken)]);
      } else if (this.getPriority(token) > 0) {
        if (token === "(") {
          operStack.push(token);
        } else if (token === ")") {
          while (operStack[operStack.length - 1] !== "(") {
            exitStack.push(operStack.pop());
          }

          operStack.pop();
        } else {
          while (
            this.getPriority(token) <=
            this.getPriority(operStack[operStack.length - 1])
          ) {
            if (operStack.length === 0) {
              break;
            }
            exitStack.push(operStack.pop());
          }

          operStack.push(token);
        }
      } else {
        let variable = this.Game.getVar(token);

        if (variable === 0) {
          if (token.startsWith("'") || token.startsWith('"')) {
            if (token.endsWith("'") || token.endsWith('"')) {
              variable = token.substr(1, token.length - 2);
            }
          }
        }

        exitStack.push([variable]);
      }

      lastTokenIsOperator = this.getPriority(token) > 1;
    }

    while (operStack.length > 0) {
      exitStack.push(operStack.pop());
    }

    return exitStack;
  }

  getPriority(operand) {
    switch (operand) {
      case "not":
        return 15;
      case "*":
      case "/":
        return 14;
      case "+":
      case "-":
        return 13;
      case "<":
      case "<=":
      case ">":
      case ">=":
        return 11;
      case "=":
      case "==":
      case "!=":
      case "<>":
        return 10;
      case "&&":
      case "and":
        return 6;
      case "||":
      case "or":
        return 5;
      case "(":
      case ")":
        return 1;
      default:
        return 0;
    }
  }

  calc() {
    const stack = this.toRPN();

    const temp = [];

    for (let i = 0; i < stack.length; i++) {
      const token = stack[i];

      if (this.getPriority(token) > 0) {
        let result;

        if (/*token == '!' ||*/ token === "not") {
          const variable = temp.pop();

          result = !(variable === true || variable > 0);
        } else {
          const a = temp.pop();
          const b = temp.pop();

          switch (token) {
            case "*":
              result = b * a;
              break;
            case "/":
              result = b / a;
              break;
            case "+":
              result = b + a;
              break;
            case "-":
              result = b - a;
              break;
            case "==":
              if (typeof b == "string" && typeof a == "string") {
                const reg = new RegExp(
                  "^" +
                  a
                    .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
                    .replace(/\\\*/g, ".*")
                    .replace(/\\\?/g, ".") +
                  "$",
                  "i"
                );
                result = b.search(reg) !== -1;
              } else {
                result = b === a;
              }
              break;
            case "=":
              if (typeof b == "string" && typeof a == "string") {
                result = b.toLowerCase() === a.toLowerCase();
              } else {
                result = b === a;
              }
              break;
            case "!=":
            case "<>":
              if (typeof b == "string" && typeof a == "string") {
                result = b.toLowerCase() !== a.toLowerCase();
              } else {
                result = b !== a;
              }

              break;
            case ">":
              result = b > a;
              break;
            case "<":
              result = b < a;
              break;
            case ">=":
              result = b >= a;
              break;
            case "<=":
              result = b <= a;
              break;
            case "&&":
            case "and":
              result = (b === true || b > 0) && (a === true || a > 0);
              break;
            case "||":
            case "or":
              result = b === true || b > 0 || (a === true || a > 0);
              break;
          }
        }

        temp.push(result);
      } else {
        temp.push(token[0]);
      }
    }

    return temp.pop();
  }

  tokenize(str) {
    str = " " + str + " ";
    str = str.replace(/ not /g, "  not  "); // пока так (чтобы not мог прилипать ко всему)
    return str.split(
      /(".+?"|'.+?'| AND | OR | NOT |\|\||&&|<>|!=|==|<=|>=|\+|\-|\*|\/|>|<|=|\(|\))/gi
    );
  }
}
