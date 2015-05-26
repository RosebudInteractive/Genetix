/**
 * User: kiknadze
 * Date: 27.04.2015
 * Time: 15:01
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/gColumn'],
    function(Column) {
        var GenColumn = Column.extend({

            className: "GenGColumn",
            classGuid: "8d1b679e-4cfe-4faa-aecb-f0c53cf8e35a",
            metaFields: [
                {fname:"IsSeparator", ftype:"boolean"}
            ],

            init: function(cm,params){
                UccelloClass.super.apply(this, [cm, params]);
            },

            // Properties
            isSeparator: function(value) {
                return this._genericSetter("IsSeparator", value);
            }
        });
        return GenColumn;
    }
);