
function set(Player) {
    console.log(Player);

    /**
     * следующая строка
     *
     * @param {String} line
     */
    Player.prototype.next = function(line) {
        var line = this.Quest.get(Game.position);

        Game.position++;

        // вырезать комментарий
        if (line.indexOf(';') != -1) {
            line = line.substring(0, line.indexOf(';'));
        }

        if (!line) {
            return false;
        }

        return line.replace(/\t/g, ' ');
    };

    /**
     * коммон
     */
    Player.prototype.common = function() {
        if (this.proc('common')) {
            this.forgetProcs();
            this.play();
        }
    };


    /**
     * прыгнуть на метку
     *
     * @param {string} labelName
     * @param {string} type
     */
    Player.prototype.goto = function(labelName, type) {
        var label = this.Quest.getLabel(labelName);

        if (label) {
            if (type != 'proc') {
                Game.realCurrentLoc = label.name;
            }

            // todo контанты
            if ((type == 'btn' || type == 'goto')) {
                Game.setVar('previous_loc', Game.getVar('current_loc'));
                Game.setVar('current_loc', labelName);
            }

            if (type == 'goto') {
//                this.buttons = [];
//                this.text = [];
            }

            if (type == 'btn' || type == 'goto' || type == 'proc') {
                Game.setVar(label.name, Game.getVar(label.name) + 1);
            }

            Game.position = label.pos;

            // весь стек что дальше очищается
            this.flowStack[this.flow] = [];

            return true;
        }

        return false;
    };


    return Player;
}

export default set;