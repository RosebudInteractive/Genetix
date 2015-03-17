if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/label'],
    function(Label) {
        var GenLabel = Label.extend({

            className: "GenLabel",
            classGuid: "151c0d05-4236-4732-b0bd-ddcf69a35e25",
            metaFields: [
                {fname:"FontSize",ftype:"string"},
                {fname:"Color",ftype:"string"},
                {fname:"FontFamily",ftype:"string"}
            ],

            /**
             * Инициализация объекта
             * @param cm ссылка на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                this._super(cm, params);
                this.params = params;
            },

            // Properties
            label: function(value) {
                return this._genericSetter("Label", value);
            },
            fontSize: function(value) {
                return this._genericSetter("FontSize", value);
            },
            color: function(value) {
                return this._genericSetter("Color", value);
            },
            fontFamily: function(value) {
                return this._genericSetter("FontFamily", value);
            }
        });
        return GenLabel;
    }
);