/**
 * User: kiknadze
 * Date: 19.03.2015
 * Time: 14:58
 */
if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/dataEdit'],
    function(DataEdit) {
        var GenDataEdit = DataEdit.extend({

            className: "GenDataEdit",
            classGuid: "567cadd5-7f9d-4cd8-a24d-7993f065f5f9",
            metaFields: [
                {fname:"Title", ftype:"string"},
                {fname:"Multiline", ftype:"boolean"}
            ],

            init: function(cm, params) {
                this._super(cm, params);
                this.params = params;
            },

            title: function(value) {
                return this._genericSetter("Title", value);
            },

            multiline: function(value) {
                return this._genericSetter("Multiline", value);
            }
        });
        return GenDataEdit;
    }
);