/**
 * @author narmiel
 */


/**
 * @param {string} text тело игры
 *
 * @constructor
 */
function Quest(text) {

    /**
     * @type {string} имя игры или файла для сохранения
     */
    this.name = '';

    /**
     * @type {boolean}
     */
    this.locked = false;

    /**
     * @type {Object}
     */
    this.labels = {};

    /**
     * @type {Object}
     */
    this.useLabels = {};

    /**
     * @type {Object}
     */
    this.items = {};

    /**
     * @type {Object}
     */
    this.vars = {};

    /**
     * @type {number}
     */
    this.position = 0;

    /**
     * @type {string}
     */
    this.realCurrentLoc = '';

    /**
     * @type {string}
     */
    this.quest = text.replace(/^[\n\r]+|[\n\r]+$/g,'').replace(/\/\*[\s\S.]+?\*\//g,'').split(/[\n\r]+/);

    /**
     * @param {String} label
     */
    this.getLabel = function(label) {
        label = label.toString().toLowerCase();

        if (this.labels[label] != undefined) {
            return {
                name: label,
                pos: this.labels[label]
            };
        } else {
            return false;
        }
    };

    /**
     * следующая строка
     */
    this.next = function() {
        var line = this.get(this.position);

        this.position++;

        if (!line) {
            return false;
        }

        if (this.getVar('urq_mode') == 'ripurq' || this.getVar('urq_mode') == 'dosurq') {
            // вырезать комментарий
            if (line.indexOf(';') != -1) {
                line = line.substring(0, line.indexOf(';'));
            }
        }

        return line.replace(/\t/g, ' ');
    };

    /**
     * строка по номеру
     */
    this.get = function(i) {
        if (this.quest[i] != undefined) {
            return this.quest[i];
        } else  {
            return false;
        }
    };

    /**
     * инициализация
     */
    this.init = function() {
        this.labels = {};
        this.useLabels = {};
        this.items = {};
        this.vars = {
            'tokens_delim': '\ \,\"\?\!'
        };
        this.position = 0;
        this.realCurrentLoc = '';

        /**
         * Собираем метки
         */
        for (var i = this.quest.length -1; i >=0; i--) {
            var str = this.get(i);

            if (str.substr(0, 1) == '_' && str.substr(1, 1) != '_') {
                this.quest[i - 1] = this.quest[i - 1] + str.substr(1);
                this.quest[i] = '';
            } else if (str.substr(0, 1) == ':') {
                if (str.substr(0, 5).toLowerCase() == ':use_') {
                    this.useLabels[str.substr(1).toLowerCase().trim()] = i;
                }

                this.labels[str.substr(1).toLowerCase().trim()] = i;
            }
        }

        for (var i = 0; i < this.quest.length; i++) {
            if (str.substr(0, 1) == ':') {
                var key = str.substr(1).toLowerCase().trim();
                this.realCurrentLoc = key;
                this.setVar('current_loc', key);
                this.setVar('previous_loc', key);
                
                break;
            }
        }
    };

    /**
     * @param name
     * @param {int} count
     */
    this.addItem = function(name, count) {
        return this.setItem(name, this.getItem(name) + parseInt(count));
    };

    /**
     * @param name
     * @param {int} count
     */
    this.removeItem = function(name, count) {
        return this.setItem(name, this.getItem(name) - parseInt(count));
    };

    /**
     *
     * @param name
     * @param {int} count
     */
    this.setItem = function (name, count) {
        if (Game.locked) return false;

        count = parseInt(count);

        if (count <= 0) {
            delete this.items[name];
            this.setVar(name, 0);
        } else {
            this.items[name] = count;
            this.setVar(name, count);
        }
    };

    /**
     *
     * @param name
     * @return {int}
     */
    this.getItem = function (name) {
        return (this.items[name] == undefined) ? 0 : this.items[name];
    };

    /**
     * @param {String} variable
     * @param {*} value
     */
    this.setVar = function(variable, value) {
        if (variable.substr(0, 4).toLowerCase() == 'inv_') {
            variable = variable.substr(4);

            this.setItem(variable, value);
        } else {
            this.vars[variable.toLowerCase()] = value;
        }
    };

    /**
     * @param variable
     * @returns {*}
     */
    this.getVar = function(variable) {
        variable = variable.toLowerCase();

        if (variable.substr(0, 4) == 'inv_') {
            variable = variable.substr(4);
        }

        if (variable == 'rnd') {
            return Math.random();
        } else if (variable.substr(0, 3) == 'rnd') {
            return Math.floor(Math.random() * parseInt(variable.substr(3))) + 1;
        }

        // Для выражений вроде "1 деньги"
        if (variable.split(' ').length > 1) {
            var count = variable.split(' ')[0];
            if (!isNaN(count)) {
                variable = variable.split(' ').slice(1).join(' ').trim()
                return this.vars[variable] >= count;
            }
        }

        if (this.vars[variable] != undefined) {
            return this.vars[variable];
        }

        return 0;
    };

    /**
     * сохранение
     *
     * @param {int} slot
     */
    this.save = function(slot) {
        var Datetime = new Date();

        localStorage.setItem(this.name + '_' + slot.toString() + '_name', Datetime.toLocaleDateString() + ' ' + Datetime.toLocaleTimeString());
        localStorage.setItem(this.name + '_' + slot.toString() + '_data', JSON.stringify({
            items: this.items,
            vars: this.vars,
            position: this.position,
            realCurrentLoc: this.realCurrentLoc
        }));
    };

    /**
     * загрузка
     *
     * @param {int} slot
     */
    this.load = function(slot) {
        var data = JSON.parse(localStorage.getItem(this.name + '_' + slot.toString() + '_data'));
        this.items = data.items;
        this.vars = data.vars;
        this.position = data.position;
        this.realCurrentLoc = data.realCurrentLoc;
    };
}

