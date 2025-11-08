/**
 * Copyright (C) 2015, 2017, 2018 Akela <akela88@bk.ru>
 * Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
 * This file is part of UrqW.
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

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
    // View list of known operators
    var expl = line.split(' ');
    var operand = expl[0].toLowerCase().trim();
    var command = expl.slice(1).join(' ');

    if (operand == 'if') {
        var cond = line.substring(line.indexOf('if ') + 3, line.indexOf(' then '));

        var then;
        var els;
        var ifline = line;

        // todo Convert to Reverse Polish notation
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

            return GlobalPlayer.btn(com, desc);
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
        case 'image': return GlobalPlayer.image(command.toString().trim());
        case 'music': return GlobalPlayer.playMusic(command.toString().trim(), false);
        case 'play':
            if (volumeMultiplier == 0 || Number(settings['volume']) == 0) return;

            resetAudio(gameSound);

            var src;
            if (files === null) {
                src = normalizeInternalPath(questPath + '/' + command.toString().trim());
            } else {
                src = files[normalizeInternalPath(command.toString().trim())];
            }

            gameSound.src = src;
            gameSound.volume = Number(settings['volume'])/100*volumeMultiplier;
            gameSound.play();

            break;
        case 'clsb': return GlobalPlayer.clsb();
        case 'clsl': return GlobalPlayer.clsl();
        case 'clst': return GlobalPlayer.clst();
        case 'cls': return GlobalPlayer.cls();
        case 'forget_procs': return GlobalPlayer.forgetProcs();
        case 'proc': return GlobalPlayer.proc(command.toString().trim());
        case 'end': return GlobalPlayer.end();
        case 'anykey': return GlobalPlayer.anykey(command.toString().trim());
        case 'pause': return GlobalPlayer.pause(parseInt(command));
        case 'input': return GlobalPlayer.input(command.toString().trim());
        case 'quit': return GlobalPlayer.quit();
        case 'invkill': return GlobalPlayer.invkill(command.toString().trim().length > 0 ? command.toString().trim() : null);
        case 'perkill': return GlobalPlayer.perkill();
        case 'varkill': return GlobalPlayer.perkill();
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
        case 'goto': return GlobalPlayer.goto(command.toString().trim(), 'goto');
        case 'p':
        case 'print':  return GlobalPlayer.print(this.openLinks(command), false);
        case 'pln':
        case 'println': return GlobalPlayer.print(this.openLinks(command), true);
        case 'btn':
            var btn = command.split(',');

            return GlobalPlayer.btn(btn[0].trim(), btn.slice(1).join(',').trim());
        // Rudiments of "Next"
        case 'tokens':
            var reg;

            if (Game.getVar('tokens_delim') == 'char') {
                reg = '';
            } else {
                reg = new RegExp('[' + (Game.getVar('tokens_delim')).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&") + ']', 'gi');
            }

            var str = (new Expression(command.trim())).calc().split(reg);

            GlobalPlayer.setVar('tokens_num', str.length);

            for (var i = 0; i < str.length; i++) {
                GlobalPlayer.setVar('token' + (i + 1), str[i]);
            }

            break;
        case 'instr':
            line = command;

            if (line.indexOf('=') > 0) {
                GlobalPlayer.setVar(line.substring(0, line.indexOf('=')).trim(), new Expression('\'' + line.substr(line.indexOf('=') + 1) + '\'').calc());
            }

            // no break here
            break;

        // If nothing helped ^w^w^w is not operator
        default:
            //  Is this an expression?
            if (line.indexOf('=') > 0) {
                GlobalPlayer.setVar(line.substring(0, line.indexOf('=')).trim(), new Expression(line.substr(line.indexOf('=') + 1)).calc());
            } else {
                console.log('Unknown operand: ' + operand + ' ignored (line: ' + line + ')');
            }
    }

};

/**
 * Split by &
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
        GlobalPlayer.flowAdd(line.substring(pos + 1));
        line = line.substring(0, pos).replace(/^\s+/, '');
    }

    return this.openTags(line);
};

/**
 * Expand #$, #%$
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
            // Rudiment for compatibility
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
                command = exptmp[1].trim();
                text = exptmp[0].trim();

                // Link with drop-down menu
                if ((exp.match(/\|/g) || []).length > 1) {
                    var command2 = exptmp[2].split(',');

                    var links = [];
                    var action = '';
                    var label;
                    for (var i = 0; i < command2.length; i++) {
                        label = command + command2[i].trim();
                        if (Game.getVar('hide_' + label) > 0) {
                            continue;
                        }
                        if (Game.getLabel(label)) {
                            action = label;
                        } else {
                            action = '';
                            // The label was not found, so there is no such action.
                            // You can execute something here, for example:
                            // action = `pln You cannot ${command2[i].trim()} ${command}!`;
                        }

                        var displayName = Game.getVar('display_' + label);
                        var actionDisplayName;
                        if (displayName) {
                            actionDisplayName = displayName;
                        } else {
                            actionDisplayName = command2[i].replace(/_/g, ' ').trim();
                        }

                        var actionNum = GlobalPlayer.link(action);
                        links.push(`<li><a data-action="${actionNum}" class="button" href="#">${actionDisplayName}</a></li>`);
                    }

                    if (links.length == 0) {
                        return text;
                    } else {
                        return '<span class="dropdown dropdownmenulinks">' +
                            '<a href="#" class="dropdown dropdown-toggle" type="button" id="dropdownMenu' + actionNum + '" data-toggle="dropdown">' +
                            text +
                            '</a>' +
                            '<ul class="dropdown-menu">' +
                            links.join('') +
                            '</ul>' +
                            '</span>';
                    }
                }
            } else {
                command = exp.trim();
                text = exp;
            }

            return GlobalPlayer.Client.convertToLink(text, GlobalPlayer.link(command));
        });
    }

    return line;
};