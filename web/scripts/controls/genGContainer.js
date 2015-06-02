if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/gContainer'],
    function(Container) {
        var GContainer = Container.extend({

            className: "GenGContainer",
            classGuid: "93ada11b-8c2a-4b06-b5ee-8622d607b0a4",
            metaFields: [
                {fname:"Title", ftype:"string"}
            ],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            },

            // Properties
            title: function(value) {
                return this._genericSetter("Title", value);
            }
        });
        return GContainer;
    }
);