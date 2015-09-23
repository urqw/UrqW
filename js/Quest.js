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
     * @type {Array}
     */
    this.labels = [];

    /**
     * @type {Array}
     */
    this.items = [];

    /**
     * @type {Object}
     */
    this.vars = {};

    /**
     * @type {string}
     */
    this.quest = text.replace(/^[\n\r]+|[\n\r]+$/g,'').split(/[\n\r]+/);

    /**
     * @type {number}
     */
    this.position = 0;
    /**
     * следующая строка
     */
    this.next = function() {
        var line = this.get(++this.position);

        // вырезать комментарий
        if (line.indexOf(';') != -1) {
            line = line.substring(0, line.indexOf(';'));
        }

        return line.trim();
    };

    /**
     * строка по номеру
     */
    this.get = function(i) {
        return this.quest[i];
    };

    /**
     * прыгнуть на метку
     *
     * @param {string} label
     */
    this.to = function(label) {
        this.setVar('count_' + label, this.getVar('count_' + label) + 1);

        if (this.labels[label.toLowerCase()] !== undefined) {
            this.position = this.labels[label.toLowerCase()] ;
        }
    };

    /**
     * инициализация
     */
    this.init = function() {
        /**
         * Собираем метки
         */
        for (var i = 0; i < this.quest.length; i++) {
            if (this.get(i).substr(0, 1) == ':') {
                this.labels[this.get(i).substr(1).toLowerCase().trim()] = i;
            }
        }
    };

    /**
     * @param name
     * @param {int} count
     */
    this.addItem = function(name, count) {
        if (this.items[name] == undefined) {
            this.items[name] = 0;
        }

        this.items[name] = this.items[name] + parseInt(count);
        this.setVar(name, this.items[name]);
    };

    /**
     * @param name
     * @param {int} count
     */
    this.removeItem = function(name, count) {
        this.items[name] = this.items[name] - count;
        this.setVar(name, this.items[name]);
    };

    /**
     * @param {String} variable
     * @param {*} value
     */
    this.setVar = function(variable, value) {
        this.vars[variable.toLowerCase()] = value;
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

        if (this.vars[variable] != undefined) {
            return this.vars[variable];
        }

        return 0;
    }
}

