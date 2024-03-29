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
                this._source = {
                    datatype: "json",
                    datafields: [],
                    localdata: '{}',
                    id:'Id'
                };
            },

            /**
             * Рендер контрола
             * @param viewset
             * @param options
             */
            irender: function(viewset, options) {
                if (this.getControlMgr().getInitRender() || !this._realyRendered) {
                    viewset.render.apply(this, [options]);
                    return;
                }

                // проверяем ширины столбцов
                //var columns = this.getObj().getCol('Columns');
                var columns = this.getCol('Columns');
                if (columns) {
                    var modified = false;
                    for (var i = 0, len = columns.count(); i < len; i++) {
                        var column = columns.get(i);
                        if (column.isFldModified("Width")) {
                            modified = true;
                            viewset.renderWidth.apply(this, [i, column.width()]);
                            if (modified)
                                return;
                        }
                    }
                }


                // если надо лишь передвинуть курсор
                if (this.isOnlyCursor() && !this.editable()) {
                    viewset.renderCursor.apply(this, [this.dataset().cursor()]);
                    return;
                }

                // если только фокус
                if  (this.isOnlyFocus()) {
                    if (this.getForm().currentControl() == this)
                        viewset.setFocus.apply(this);
                    return;
                }

                // если передвинули курсор + фокус
                if (this.isCursorFocus()) {
                    if (this.getForm().currentControl() == this)
                        viewset.setFocus.apply(this);
                    viewset.renderCursor.apply(this, [this.dataset().cursor()]);
                    return;
                }

                // рендерим DOM
                viewset.render.apply(this, [options]);
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

        });
        return GenDataGrid;
    }
);