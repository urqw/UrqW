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
        line = line.replace(/^\s+/, '');
        // просмотреть список известных операторов
        var expl = line.split(' ');
        var operand = expl[0].toLowerCase().trim();
        var command = expl.slice(1).join(' ');

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

            var conditionResult = new Expression(this.openTags(cond)).calc();

            if (conditionResult === true || conditionResult > 0) {
                this.parse(then);
            } else {
                if (els) {
                    this.parse(els);
                }
            }

        } else if (operand == 'btn') {
            var xbtn = command.split(',');
            var desc = this.prepareLine(xbtn.slice(1).join(',').trim());

            return GlobalPlayer.btn(xbtn[0].trim(), desc);
        } else {
            //todo
            line = this.prepareLine(line);
            expl = line.split(' ');
            operand = expl[0].toLowerCase().trim();
            command = expl.slice(1).join(' ');

            if (operand[0] == ':') return;

            switch (operand) {
                case 'music': return GlobalPlayer.playMusic(command, false);
                case 'play':
                    if (files === null) {
                        (new Audio('quests/' + Game.name + '/' + command).play());
                    } else {
                        (new Audio(files[command])).play();
                    }
                    break;
                case 'cls': return GlobalPlayer.cls();
                case 'forget_proc': return GlobalPlayer.forgetProc();
                case 'proc': return GlobalPlayer.proc(command);
                case 'end': return GlobalPlayer.end();
                case 'anykey': return GlobalPlayer.anykey(command);
                case 'pause': return GlobalPlayer.pause(parseInt(command));
                case 'input': return GlobalPlayer.input(command);
                case 'quit': return GlobalPlayer.quit();
                case 'invkill': return GlobalPlayer.invkill(command.length >0 ? command : null);
                case 'perkill': return GlobalPlayer.perkill();
                case 'inv-':
                    var item = command.split(',');
                    var quantity = 1;
                    if (item.length > 1) {
                        quantity = parseInt(item[0]);
                        item = item[1];
                    }

                    return GlobalPlayer.invRemove(item.toString().trim(), quantity);
                case 'inv+':
                    item = command.split(',');
                    quantity = 1;
                    if (item.length > 1) {
                        quantity = parseInt(item[0]);
                        item = item[1];
                    }

                    return GlobalPlayer.invAdd(item.toString().trim(), quantity);
                case 'goto': return GlobalPlayer.goto(command, 'goto');
                case 'p':
                case 'print': return GlobalPlayer.print(command, false);
                case 'pln':
                case 'println': return GlobalPlayer.print(command, true);
                case 'btn':
                    var btn = command.split(',');

                    return GlobalPlayer.btn(btn[0].trim(), btn.slice(1).join(',').trim());
                //рудименты далее
                case 'instr':
                    line = command;

                    if (line.indexOf('=') > 0) {
                        GlobalPlayer.setVar(line.substring(0, line.indexOf('=')), new Expression('\'' + line.substr(line.indexOf('=') + 1) + '\'').calc());
                    }

                    // no break here
                    break;

                // если ничего не помогло^w^w^w не оператор
                default:
                    //  это выражение?
                    if (line.indexOf('=') > 0) {
                        GlobalPlayer.setVar(line.substring(0, line.indexOf('=')), new Expression(line.substr(line.indexOf('=') + 1)).calc());
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
            GlobalPlayer.flowAdd(line.substring(line.indexOf('&') + 1));
            line = line.substring(0, line.indexOf('&')).replace(/^\s+/, '');
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

        line = line.replace(/\#\/\$/g, '<br>');
        line = line.replace(/\#\%\/\$/g, '<br>');
        line = line.replace(/\#\$/g, ' ');
        line = line.replace(/\#\%\$/g, ' ');

        // ##$
        line = line.replace(/\#\#[^\#]+?\$/g, function(exp) {
            return '&#' + exp.substr(2, (exp.length - 3)) + ';';
        });

        while (line.match(/\#[^\#]+?\$/)) {
            line = line.replace(/\#[^\#]+?\$/, function(exp) {
                // рудимент для совместимости
                if (exp[1] == '%') {
                    return new Expression(exp.substr(2, (exp.length - 3))).calc();
                } else {
                    return new Expression(exp.substr(1, (exp.length - 2))).calc();
                }
            });
        }

        return line;
    };
}

