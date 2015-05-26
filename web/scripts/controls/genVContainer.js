if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/vContainer'],
    function(Container) {
        var GenVContainer = Container.extend({

            className: "GenContainer",
            classGuid: "b75474ef-26d0-4298-9dad-4133edaa8a9c",
            metaFields: [
                {fname:"Background", ftype:"string"},
                {fname:"Position", ftype:"string"}
            ],

            init: function(cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
                this.params = params;
            },

            background: function(value) {
                return this._genericSetter("Background", value);
            },
            position: function(value) {
                return this._genericSetter("Position", value);
            }
        });
        return GenVContainer;
    }
);