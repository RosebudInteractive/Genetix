if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/button'],
    function(Button) {
        var GenButton = Button.extend({

			className: "GenButton",
			classGuid: "bf0b0b35-4025-48ff-962a-1761aa7b3a7b",
            metaFields: [
                {fname:"Background",ftype:"string"},
                {fname:"Color",ftype:"string"},
                {fname:"BorderColor",ftype:"string"},
                {fname:"ExtendedClass",ftype:"string"}
            ],

            /**
             * Инициализация объекта
             * @param cm ссылка на контрол менеджер
             * @param params
             */
            init: function(cm, params) {
                this._super(cm, params);
                this.params = params;
            },

			// Properties
            caption: function(value) {
                return this._genericSetter("Caption", value);
            },

            background: function(value) {
                return this._genericSetter("Background", value);
            },

            color: function(value) {
                return this._genericSetter("Color", value);
            },

            borderColor: function(value) {
                return this._genericSetter("BorderColor", value);
            },
            extendedClass: function(value) {
                return this._genericSetter("ExtendedClass", value);
            }
        });
        return GenButton;
    }
);