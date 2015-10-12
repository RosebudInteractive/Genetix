if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var UccelloClass = require(UCCELLO_CONFIG.uccelloPath + '/system/uccello-class');
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
                {fname:"HasFooter", ftype:"boolean"},
                {fname:"Scroll", ftype:"boolean"},
                {fname:"BodyBackground", ftype:"string"}
            ],
            metaCols: [ ],

            /**
             * Инициализация объекта
             * @param cm на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                UccelloClass.super.apply(this, [cm, params]);
                this.params = params;

                this.initRender();

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
            scroll: function(value) {
                return this._genericSetter("Scroll", value);
            },

            /**
             * Нужно перерендерить только курсор
             * @returns {boolean}
             */
            isOnlyCursor: function() {
                if (this.dataset()) {
                    var ds = this.dataset();
                    if  ((!ds.isDataSourceModified()) && (ds.isFldModified("Cursor")) && (!this.isDataModified()))
                        return true;
                    else
                        return false;
                }
                else return false;
            },

            initRender: function() {
                this.pvt.renderDataVer = undefined;
            }


        });
        return GenDataGrid;
    }
);