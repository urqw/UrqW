/**
 * @author narmiel
 */


/**
 * @constructor
 */


function Parser() {
    this.STATUS_NEXT = 0;
    this.STATUS_END = 1;
    this.STATUS_ANYKEY = 2;
    this.STATUS_PAUSE = 3;
    this.STATUS_INPUT = 4;
    this.STATUS_QUIT = 5;

    this.text = [];
    this.buttons = [];
    this.inf = false;

    this.proc_position = [];
    this.flow = 0;
    this.flowStack = [];
    this.flowStack[this.flow] = [];

    /**
     * @param {Quest} Game
     */
    this.parse = function(Game) {
        var line;

        this.status = this.STATUS_NEXT;

        while ((this.status == this.STATUS_NEXT)) {
    //        console.log('play: ' + line);

            if (this.flowStack[this.flow].length == 0 && ((line = Game.next()) !== false)) {
                this.parseLine(line);
            }

            while (this.flowStack[this.flow].length > 0 && this.status == this.STATUS_NEXT) {
                this.parseLine(this.flowStack[this.flow].pop());
            }
        }
   //     console.log(' --- ');

        return {
            status: this.status,
            text: this.text,
            buttons: this.buttons,
            sysinf: this.inf
        }
    };

    /**
     *
     * @param line
     */
    this.parseLine = function(line) {
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
                this.parseLine(then);
            } else {
                if (els) {
                    this.parseLine(els);
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
                    this.proc_position.push(Game.position);
                    if (Game.to(command)) {
                        this.flow++;
                        this.flowStack[this.flow] = [];
                    } else {
                        this.proc_position.pop();
                    }
                    break;
                case 'end':
                    if (this.proc_position.length > 0) {
                        this.flowStack[this.flow].pop();
                        Game.position = this.proc_position.pop();
                        this.flow--;
                    } else {
                        this.status = this.STATUS_END;
                    }
                    return;
                case 'anykey':
                    this.status = this.STATUS_ANYKEY;
                    return;
                case 'pause':
                    this.inf = parseInt(command);
                    this.status = this.STATUS_PAUSE;
                    return;
                case 'input':
                    this.inf = command;
                    this.status = this.STATUS_INPUT;
                    return;
                case 'quit':
                    this.status = this.STATUS_QUIT;
                    return;
                case 'invkill':
                    Game.invkill(command.length >0 ? command : null);
                    break;
                case 'perkill':
                    Game.perkill();
                    break;
                case 'inv-':
                    var item = command.split(',');
                    var quantity = 1;
                    if (item.length > 1) {
                        quantity = parseInt(item[0]);
                        item = item.join(',');
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
                    Game.to(command);
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

    this.prepareLine = function (line) {
        if (line.indexOf('&') != -1) {
            this.flowStack[this.flow].push(line.substring(line.indexOf('&') + 1).trim());

            line = line.substring(0, line.indexOf('&')).trim();
        }

        return this.openTags(line);
    };

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
    }
}

