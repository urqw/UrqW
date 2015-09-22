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
        return this.get(++this.position);
    };

    /**
     * строка по номеру
     */
    this.get = function(i) {
        var line = this.quest[i];

        // вырезать комментарий
        if (line.indexOf(';') != -1) {
            line = line.substring(0, line.indexOf(';'));
        }

        return line.trim();
    };

    /**
     * прыгнуть на метку
     *
     * @param {string} label
     */
    this.to = function(label) {
        this.position = this.labels[label.toLowerCase()] - 1;

        return this.next();
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
                this.labels[this.get(i).substr(1).toLowerCase()] = i;
            }
        }
    };

    /**
     * @param name
     * @param {int} count
     */
    this.addItem = function(name, count) {
        this.items[name] = this.items[name] + count;
    };

    /**
     * @param name
     * @param {int} count
     */
    this.removeItem = function(name, count) {
        this.items[name] = this.items[name] - count;
    };

    /**
     *
     * @param {String} variable
     * @param {*} value
     */
    this.setVar = function(variable, value) {
        this.vars[variable] = value;
    };

    /**
     * @param variable
     * @returns {*}
     */
    this.getVar = function(variable) {
        if (this.vars[variable] != undefined) {
            return this.vars[variable];
        }

        return false;
    }
}

