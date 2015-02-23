if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [],
    function() {
        var Container = Class.extend({

            className: "Container",
            classGuid: "1d95ab61-df00-aec8-eff5-0f90187891cf",
            metaCols: [ {"cname": "Children", "ctype": "control"} ],
            metaFields: [],

            init: function(cm, params) {
                this._super(cm, params);
                this.params = params;
            }

        });
        return Container;
    }
);