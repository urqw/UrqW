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
        return this.quest[i].trim();
    };

    /**
     * прыгнуть на метку
     *
     * @param {string} label
     */
    this.to = function(label) {
        this.position = this.labels[label];

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
                this.labels[this.get(i).substr(1)] = i;
            }
        }
    }
}

