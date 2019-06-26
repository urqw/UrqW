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
   * @type string
   */
  this.fistLabel = "";

  /**
   * @type {Object}
   */
  this.labels = {};

  /**
   * @type {Object}
   */
  this.useLabels = {};

  /**
   * @type {string}
   */
  this.quest = text
    .replace(/^[\n\r]+|[\n\r]+$/g, "")
    .replace(/\/\*[\s\S.]+?\*\//g, "")
    .split(/[\n\r]+/);
}

/**
 * инициализация
 */
Quest.prototype.init = function() {
  /**
   * Собираем метки
   */
  var label = "";

  for (var i = this.quest.length - 1; i >= 0; i--) {
    var str = this.get(i);

    if (str.substr(0, 1) == "_" && str.substr(1, 1) !== "_") {
      this.quest[i - 1] = this.quest[i - 1] + str.substr(1);
      this.quest[i] = "";
    } else if (str.substr(0, 1) === ":") {
      label = str
        .substr(1)
        .toLowerCase()
        .trim();

      if (str.substr(0, 5).toLowerCase() === ":use_") {
        this.useLabels[label] = i;
      }

      this.labels[label] = i;
    }
  }

  this.firstLabel = label;
};

/**
 * @param {String} label
 */
Quest.prototype.getLabel = function(label) {
  label = label.toString().toLowerCase();

  if (this.labels[label] !== undefined) {
    return {
      name: label,
      pos: this.labels[label]
    };
  } else {
    return false;
  }
};

/**
 * строка по номеру
 */
Quest.prototype.get = function(i) {
  if (this.quest[i] !== undefined) {
    return this.quest[i];
  } else {
    return false;
  }
};

export default Quest;
