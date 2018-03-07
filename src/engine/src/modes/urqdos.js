
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

            if (type == 'btn' || type == 'goto' || type == 'proc') {
                Game.setVar('count_' + label.name, Game.getVar('count_' + label.name) + 1);
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