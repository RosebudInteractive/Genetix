if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [UCCELLO_CONFIG.uccelloPath+'controls/dataGrid'],
    function(DataGrid) {
        var GenDataGrid = DataGrid.extend({

            className: "GenDataGrid",
            classGuid: "55d59ec4-77ac-4296-85e1-def78aa93d55",
            metaFields: [
                {fname:"Alternate", ftype:"boolean"},
                {fname:"HorizontalLines", ftype:"boolean"},
                {fname:"VerticalLines", ftype:"boolean"},
                {fname:"BigSize", ftype:"boolean"},
                {fname:"WhiteHeader", ftype:"boolean"},
                {fname:"HasFooter", ftype:"boolean"}
            ],

            /**
             * Инициализация объекта
             * @param cm на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                this._super(cm,params);
                this.params = params;

                this._source = {
                    datatype: "json",
                    datafields: [],
                    localdata: '{}',
                    id:'Id'
                };
            },

            /**
             * Свойсва
             */
            alternate: function(value) {
                return this._genericSetter("Alternate", value);
            },
            horizontalLines: function(value) {
                return this._genericSetter("HorizontalLines", value);
            },
            verticalLines: function(value) {
                return this._genericSetter("VerticalLines", value);
            },
            bigSize: function(value) {
                return this._genericSetter("BigSize", value);
            },
            whiteHeader: function(value) {
                return this._genericSetter("WhiteHeader", value);
            },
            hasFooter: function(value) {
                return this._genericSetter("HasFooter", value);
            },

            /**
             * Рендер контрола
             * @param viewset
             * @param options
             */
            irender: function(viewset, options) {

                // если надо лишь передвинуть курсор
                if (this.isOnlyCursor()) {
                    viewset.renderCursor.apply(this, [this.getControlMgr().getByGuid(this.dataset()).cursor()]);
                    return;
                }

                // рендерим DOM
                viewset.render.apply(this, [options]);

                // доп. действия
                if (this.dataset()) {
                    this.pvt.renderDataVer = this.getControlMgr().getByGuid(this.dataset()).getDataVer();
                }
            },

            /**
             * Нужно перерендерить только курсор
             * @returns {boolean}
             */
            isOnlyCursor: function() {
                if (this.dataset()) {
                    var dataset = this.getControlMgr().getByGuid(this.dataset());

                    if ((this.pvt.renderDataVer == dataset.getDataVer()) && (!dataset.isDataModified()))
                        return true;
                    else
                        return false;
                }
                else return false;
            }

    });
        return GenDataGrid;
    }
);