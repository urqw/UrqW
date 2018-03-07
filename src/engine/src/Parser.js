/**
 * @constructor
 */
function Parser() {

}

/**
 *
 * @param line
 */
Parser.prototype.parse = function(line) {
    line = line.replace(/^\s+/, '');
    // просмотреть список известных операторов
    var expl = line.split(' ');
    var operand = expl[0].toLowerCase().trim();
    var command = expl.slice(1).join(' ');

    if (operand == 'if') {
        var cond = line.substring(line.indexOf('if ') + 3, line.indexOf(' then '));

        var then;
        var els;
        var ifline = line;

        // todo переделать на обратную польскую
        if (ifline.indexOf(' if ') != -1) {
            ifline = ifline.substring(0, ifline.indexOf(' if ') + 1)
        }

        if (ifline.indexOf(' else ') == -1) {
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

        return;
    } else if (operand == 'btn') {
        var xbtn = command.split(',');

        if (xbtn.length > 1) {
            var desc = this.prepareLine(xbtn.slice(1).join(',').trim());
            var com = xbtn[0].trim();

            if (com.indexOf('&') == -1) {
                com = this.openTags(com);
            }

            return Game.Player.btn(com, desc);
        }
    }

    //todo
    line = this.prepareLine(line);
    expl = line.split(' ');
    operand = expl[0].toLowerCase().trim();
    command = expl.slice(1).join(' ');

    if (operand[0] == ':') return;

    switch (operand) {
        case 'save': return Game.save('fast');
        case 'image': return Game.Player.image(command.toString().trim());
        case 'music': return Game.Player.playMusic(command.toString().trim(), false);
        case 'play':
            if (volume == 3) return;

            var Sound;
            if (files === null) {
                Sound = new Audio('quests/' + Game.name + '/' + command.toString().trim());
            } else {
                Sound = new Audio(files[command.toString().trim()]);
            }

            Sound.volume = (volume == 1) ? 1 : 0.5;
            Sound.play();

            break;
        case 'clsb': return Game.Player.clsb();
        case 'cls': return Game.Player.cls();
        case 'forget_procs': return Game.Player.forgetProcs();
        case 'proc': return Game.Player.proc(command.toString().trim());
        case 'end': return Game.Player.end();
        case 'anykey': return Game.Player.anykey(command.toString().trim());
        case 'pause': return Game.Player.pause(parseInt(command));
        case 'input': return Game.Player.input(command.toString().trim());
        case 'quit': return Game.Player.quit();
        case 'invkill': return Game.Player.invkill(command.toString().trim().length > 0 ? command.toString().trim() : null);
        case 'perkill': return Game.Player.perkill();
        case 'inv-':
            var item = command.split(',');
            var quantity = 1;
            if (item.length > 1) {
                quantity = parseInt(item[0]);
                item = item[1];
            }

            return Game.Player.invRemove(item.toString().trim(), quantity);
        case 'inv+':
            item = command.split(',');
            quantity = 1;
            if (item.length > 1) {
                quantity = parseInt(item[0]);
                item = item[1];
            }

            return Game.Player.invAdd(item.toString().trim(), quantity);
        case 'goto': return Game.Player.goto(command.toString().trim(), 'goto');
        case 'p':
        case 'print':  return Game.Player.print(this.openLinks(command), false);
        case 'pln':
        case 'println': return Game.Player.print(this.openLinks(command), true);
        case 'btn':
            var btn = command.split(',');

            return Game.Player.btn(btn[0].trim(), btn.slice(1).join(',').trim());
        //рудименты далее
        case 'tokens':
            var reg;

            if (Game.getVar('tokens_delim') == 'char') {
                reg = '';
            } else {
                reg = new RegExp('[' + (Game.getVar('tokens_delim')).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + ']', 'gi');
            }

            var str = (new Expression(command.trim())).calc().split(reg);

            Game.Player.setVar('tokens_num', str.length);

            for (var i = 0; i < str.length; i++) {
                Game.Player.setVar('token' + (i + 1), str[i]);
            }

            break;
        case 'instr':
            line = command;

            if (line.indexOf('=') > 0) {
                Game.Player.setVar(line.substring(0, line.indexOf('=')).trim(), new Expression('\'' + line.substr(line.indexOf('=') + 1) + '\'').calc());
            }

            // no break here
            break;

        // если ничего не помогло^w^w^w не оператор
        default:
            //  это выражение?
            if (line.indexOf('=') > 0) {
                Game.Player.setVar(line.substring(0, line.indexOf('=')).trim(), new Expression(line.substr(line.indexOf('=') + 1)).calc());
            } else {
                console.log('Unknown operand: ' + operand + ' ignored (line: ' + line + ')');
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
Parser.prototype.prepareLine = function (line) {
    var pos = line.replace(/\[\[.+?\]\]/g, function(exp) {
        return exp.replace(/\&/g, ' ');
    }).indexOf('&');

    if (pos != -1) {
        Game.Player.flowAdd(line.substring(pos + 1));
        line = line.substring(0, pos).replace(/^\s+/, '');
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
Parser.prototype.openTags = function (line) {
    line = line.replace(/\#\/\$/g, '<br>');
    line = line.replace(/\#\%\/\$/g, '<br>');
    line = line.replace(/\#\$/g, ' ');
    line = line.replace(/\#\%\$/g, ' ');

    // ##$
    line = line.replace(/\#\#[^\#]+?\$/g, function(exp) {
        return '&#' + exp.substr(2, (exp.length - 3)) + ';';
    });

    while (line.search(/\#[^\#]+?\$/) != -1) {
        line = line.replace(/\#[^\#]+?\$/, function(exp) {
            // рудимент для совместимости
            if (exp[1] == '%') {
                exp = exp.substr(2, (exp.length - 3));
            } else {
                exp = exp.substr(1, (exp.length - 2));
            }
            var result = new Expression(exp).calc();

            return isFloat(result) ? result.toFixed(2) : result;
        });
    }

    return line;
};

/**
 * @param {String} line
 *
 * @returns {String}
 */
Parser.prototype.openLinks = function(line) {
    while (line.search(/\[\[.+?\]\]/) != -1) {
        line = line.replace(/\[\[.+?\]\]/, function(exp) {
            var text;
            var command;
            exp = exp.substr(2, (exp.length - 4));

            if (exp.indexOf('|') > 0) {
                var exptmp = exp.split('|');
                command = exptmp.slice(1).join('|').trim();
                text = exptmp[0].trim();
            } else {
                command = exp.trim();
                text = exp;
            }

            return Game.Client.convertToLink(text, Game.Player.link(command));
        });
    }

    return line;
};

export default Parser;