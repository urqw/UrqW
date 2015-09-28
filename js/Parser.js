/**
 * @author narmiel
 */

/**
 * @constructor
 */
function Parser() {

    /**
     *
     * @param line
     */
    this.parse = function(line) {
        line = line.trim();
        // просмотреть список известных операторов
        var expl = line.split(' ');
        var operand = expl[0].toLowerCase().trim();
        var command = expl.slice(1).join(' ').trim();

        if (operand == 'if') {
            var cond = line.substring(line.indexOf('if ') + 3, line.indexOf(' then '));

            var then;
            var els;
            if (line.indexOf(' else ') == -1) {
                then = line.substring(line.indexOf(' then ') + 6);
                els = false;
            } else {
                then = line.substring(line.indexOf(' then ') + 6, line.indexOf(' else '));
                els = line.substring(line.indexOf(' else ') + 6);
            }

            if (new Expression(this.openTags(cond)).calc()) {
                this.parse(then);
            } else {
                if (els) {
                    this.parse(els);
                }
            }
        } else {
            //todo
            line = this.prepareLine(line);
            expl = line.split(' ');
            operand = expl[0].toLowerCase().trim();
            command = expl.slice(1).join(' ').trim();

            switch (operand) {
                case 'forget_proc':
                    this.flowStack[0] = this.flowStack[this.flow];
                    this.proc_position = [];
                    this.flow = 0;
                    break;
                case 'proc':
                    GlobalPlayer.proc();
                    break;
                case 'end':
                    GlobalPlayer.end();
                    return;
                case 'anykey':
                    this.inf = command;
                    this.status = PLAYER_STATUS_ANYKEY;
                    return;
                case 'pause':
                    this.inf = parseInt(command);
                    this.status = PLAYER_STATUS_PAUSE;
                    return;
                case 'input':
                    this.inf = command;
                    this.status = PLAYER_STATUS_INPUT;
                    return;
                case 'quit':
                    this.status = PLAYER_STATUS_QUIT;
                    return;
                case 'invkill':

                    GlobalPlayer.invkill(command.length >0 ? command : null);
                    break;
                case 'perkill':
                    GlobalPlayer.perkill();
                    break;
                case 'inv-':
                    var item = command.split(',');
                    var quantity = 1;
                    if (item.length > 1) {
                        quantity = parseInt(item[0]);
                        item = item[1];
                    }

                    Game.removeItem(item.toString().trim(), quantity);
                    break;
                case 'inv+':
                    item = command.split(',');
                    quantity = 1;
                    if (item.length > 1) {
                        quantity = parseInt(item[0]);
                        item = item[1];
                    }

                    Game.addItem(item.toString().trim(), quantity);
                    break;
                case 'goto':
                    GlobalPlayer.to(command);
                    break;
                case 'p':
                case 'print':
                    this.text.push([command, false]);
                    break;
                case 'pln':
                case 'println':
                    this.text.push([command, true]);
                    break;
                case 'btn':
                    var btn = command.split(',');
                    var label = btn[0];
                    var desc = btn.slice(1).join(',');
                    this.buttons.push({
                        label: label,
                        desc: desc
                    });
                    break;

                //рудименты далее
                case 'instr':
                    line = command;
                    // no break here
                default:
                    //  это выражение?
                    if (line.indexOf('=') > 0) {
                        var variable = line.substring(0, line.indexOf('='));
                        var value = new Expression(line.substr(line.indexOf('=') + 1)).calc();
                        Game.setVar(variable, value);
                    } else {
                        console.log('Unknown operand: ' + operand + ' ignored (line: ' + line + ')');
                    }
            }
        }

    };

    /**
     * Разбиваем по &
     *
     * @param line
     *
     * @returns {String}
     */
    this.prepareLine = function (line) {
        if (line.indexOf('&') != -1) {
            this.flowStack[this.flow].push(line.substring(line.indexOf('&') + 1).trim());

            line = line.substring(0, line.indexOf('&')).trim();
        }

        return this.openTags(line);
    };

    /**
     * Открываем #$, #%$
     *
     * @param {String} line
     *
     * @returns {String}
     */
    this.openTags = function (line) {
        // открыть #$
        while (line.indexOf('#') != -1 && line.indexOf('$') != -1) {
            var exp = line.substring(line.lastIndexOf('#') + 1, line.indexOf('$'));

            // рудимент для совместимости
            if (exp[0] == '%') {
                exp = exp.substr(1);
            }

            line = line.slice(0, line.lastIndexOf('#')) + new Expression(exp).calc() + line.slice(line.indexOf('$') + 1);
        }

        return line;
    };
}

