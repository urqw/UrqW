/**
 * @author narmiel
 */


/**
 *
 *
 * @constructor
 */
function Parser() {
    /**
     * @param {Quest} Quest строка
     */
    this.parse = function(Quest) {
        var text = [];
        var buttons = [];

        while (line = Quest.next()) {

            // комментарий
            if (line.substr(0, 1) != ';') {
                line = line.split(' ');

                var operand = line[0];
                var command = line.slice(1).join(' ');

                // конец
                if (operand == 'end') {
                    break;
                }

                switch (operand) {
                    case 'pln':
                        text.push(command);
                        break;
                    case 'btn':
                        var btn = command.split(',');
                        var label = btn[0];
                        var desc = btn.slice(1).join(',');
                        buttons.push({
                            label: label,
                            desc: desc
                        });
                        break;
                    default:
                        console.log('Unknown operand: ' + operand + ' ignored');
                        break;
                }
            }
        }

        return {
            text: text,
            buttons: buttons
        }
    };
}

