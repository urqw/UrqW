/**
 * @author narmiel
 */


/**
 *
 *
 * @constructor
 */
function Parser() {
    this.text = [];
    this.buttons = [];
    this.stop = false;

    /**
     * @param {Quest} Game
     */
    this.parse = function(Game) {
        var line;

        while (line = Game.next()) {
            // остановиться
            if (this.stop) {
                break;
            }

            this.parseLine(line);
        }

        return {
            text: this.text,
            buttons: this.buttons
        }
    };


    /**
     *
     * @param line
     */
    this.parseLine = function(line) {

        // вырезать комментарий
        if (line.indexOf(';') != -1) {
            line = line.substring(0, line.indexOf(';'));
        }

        // открыть #$
        while (line.indexOf('#') != -1 && line.indexOf('$') != -1) {
            var exp = line.substring(line.lastIndexOf('#') + 1, line.indexOf('$'));
            line = line.slice(0, line.lastIndexOf('#')) + new Expression(exp).calc() + line.slice(line.indexOf('$') + 1);
        }

        var expl = line.split(' ');

        // просмотреть список известных операторов
        var operand = expl[0].toLowerCase().trim();
        var command = expl.slice(1).join(' ').trim();

        if (operand == 'end') {
            this.stop = true;
            return;
        }

        switch (operand) {
            case 'inv-':
                var item = command.split(',');
                var quantity = 1;
                if (item.length > 1) {
                    quantity = parseInt(item[0]);
                    item = item.join(',');
                }

                Game.removeItem(item.trim(), quantity);
                break;
            case 'inv+':
                item = command.split(',');
                quantity = 1;
                if (item.length > 1) {
                    quantity = parseInt(item[0]);
                    item = item.join(',');
                }

                Game.addItem(item.trim(), quantity);
                break;
            case 'if':
                var cond = line.substring(line.indexOf('if ') + 3, line.indexOf('then'));
                var then = line.substring(line.indexOf('then ') + 5);

                if (new Expression(cond).calc()) {
                    this.parseLine(then);
                }

                break;
            case 'goto':
                Game.to(command);
                break;
            case 'p':
            case 'pln':
                this.text.push(command);
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
            default:
                console.log('Unknown operand: ' + operand + ' ignored');
                break;
        }

        //  это мат выражение?
        if (line.indexOf('=') > 0) {
            var variable = line.substring(0, line.indexOf('='));
            var value = new Expression(line.substr(line.indexOf('=') + 1)).calc();
            Game.setVar(variable, value);
        }
    }
}

