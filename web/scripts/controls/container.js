if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/aControl'],
    function(AControl) {
        var Container = AControl.extend({

            className: "Container",
            classGuid: "1d95ab61-df00-aec8-eff5-0f90187891cf",
            metaCols: [ {"cname": "Children", "ctype": "control"} ],
            metaFields: [
                {fname:"Background", ftype:"string"},
                {fname:"Position", ftype:"string"}
            ],

            init: function(cm, params) {
                this._super(cm, params);
                this.params = params;
            },

            background: function(value) {
                return this._genericSetter("Background", value);
            },
            position: function(value) {
                return this._genericSetter("Position", value);
            }
        });
        return Container;
    }
);