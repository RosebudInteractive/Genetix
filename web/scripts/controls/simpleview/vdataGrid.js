define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/dataGrid.html', "wGrid", "/scripts/lib/iscroll.js"],
    function(template, tpl) {
        var vDataGrid = {};
        vDataGrid._templates = template.parseTemplate(tpl);

        vDataGrid._source = {
            datatype: "json",
            datafields: [],
            localdata: '{}',
            id:'id'
        };

        /**
         * Рендер DOM грида
         * @param options
         */
        vDataGrid.render = function(options) {
            console.time('renderGrid '+this.name());

            var that = this;
            var grid = $('#' + this.getLid());
            var dataset = null;

            // если не создан грид
            if (grid.length == 0) {
                grid = $(vDataGrid._templates['grid']).attr('id', this.getLid());
                var parent = (this.getParent()? '#' + this.getParent().getLid(): options.rootContainer);
                $(parent).append(grid);

                var opt = {
                    width: '100%',
                    height: $(parent).height(),
                    columns: [],
                    source: this.source,
                    selectrow: function (event, row, obj) {
                        console.log("grid.selectRow");
                    }
                };
                vDataGrid._grid = grid.grid(opt);
                vDataGrid._iscroll = null;

            }
            // Отрендерим св-ва
            if (this.whiteHeader())
                grid.addClass("white-header");
            else
                grid.removeClass("white-header");

            if (this.horizontalLines())
                grid.addClass("has-horizontal-lines");
            else
                grid.removeClass("has-horizontal-lines");

            if (this.verticalLines())
                grid.addClass("has-vertical-lines");
            else
                grid.removeClass("has-vertical-lines");

            if (this.bigSize())
                grid.addClass("is-big");
            else
                grid.removeClass("is-big");

            if (!(this.alternate()))
                grid.addClass("no-alter-rows");
            else
                grid.removeClass("no-alter-rows");

            if (!(this.hasFooter()))
                grid.addClass("has-no-paginator");
            else
                grid.removeClass("has-no-paginator");

            // отобразим данные
            vDataGrid._reloading(this);

            //grid.css({top: this.top() + 'px', left: this.left() + 'px', width: this.width() + 'px', height: this.height() + 'px'});
            console.timeEnd('renderGrid '+this.name());
        }

        /**
         * Рендер данных
         * @param cm
         */
        vDataGrid._reloading = function(o) {
            var gridColumns = [];
            var datafields = [];
            var data = [];

            if (o) {
                var cm = o.getControlMgr();

                var db = cm.getDB();
                var rootElem = null;
                var dataset = null;

                var columnsArr = [];

                if (o.dataset()) {
                    dataset = cm.getByGuid(o.dataset());
                    if (dataset) {
                        rootElem = dataset.root();
                        rootElem = rootElem? db.getObj(rootElem): null;
                    }
                }

                if (rootElem)
                {
                    // данные
                    var col = rootElem.getCol('DataElements');
                    // колонки грида
                    var columns = o.getObj().getCol('Columns');
                    // поля
                    var fields = dataset.getObj().getCol('Fields');

                    var idIndex = null, cursor = dataset.cursor(), rows = '', cursorIndex = -1;
                    var fieldsArr = {};
                    for (var i = 0, len = fields.count(); i < len; i++) {
                        var field = fields.get(i);
                        fieldsArr[field.getGuid()] = field.get('Name');
                        if (field.get('Name') == 'Id')
                            idIndex = field.getGuid();
                        datafields.push({name: field.get('Name')});
                        if (columns.count() == 0) {
                            var column = columns.get(i);
                            var gridCol = {};
                            gridCol.datafield = field.get('Name');
                            gridCol.text = field.get('Name');
                            gridColumns.push(gridCol);
                        }
                    }

                    if (columns.count() != 0) {
                        for (var i = 0, len = columns.count(); i < len; i++) {
                            var column = columns.get(i);
                            var gridCol = {};
                            gridCol.datafield = fieldsArr[column.get('Field')];
                            gridCol.text = column.get('Label');
                            if (column.get('Width'))
                                gridCol.width = column.get('Width')+'%';
                            gridColumns.push(gridCol);
                            columnsArr.push({field:column.get('Field'), width:column.get('Width')});
                        }
                    }

                    // rows
                    for (var i = 0, len = col.count(); i < len; i++) {
                        var obj = col.get(i);
                        var id = null;
                        var dataRow = {};
                        // добавляем ячейка
                        for (var j in fieldsArr) {
                            var text = obj.get(fieldsArr[j]);
                            dataRow[fieldsArr[j]] = text;
                            if (idIndex == j)
                                id = text;
                        }
                        data.push(dataRow);

                        // запоминаем текущий курсор
                        if (cursor == id)
                            cursorIndex = i;
                    }


                }

            }


            this._source.datafields = datafields;
            this._source.localdata = data;

            if (this._grid) {
                //this._grid.grid("renderHeader");
                //this._grid.grid("renderData");
                this._grid.grid("reloading", gridColumns, this._source);
                this._refreshScroll(o);
            }


        }

        vDataGrid._refreshScroll = function(o) {
            if (this._iscroll) {
                this._iscroll.refresh();
            } else {
                var that = this;

                var _iscroll = new IScroll(this._grid.find('.scrollable-bll').get(0), {
                    snapStepY: 23,
                    scrollX: true,
                    bottomPadding: o.hasFooter() ? 28 : 0,
                    topPadding: o.bigSize() ? 38 : 28,
                    resize: true,
                    scrollbars: true,
                    mouseWheel: true,
                    disableMouse: true,
                    interactiveScrollbars: true,
                    keyBindings: false,
                    click: true,
                    probeType: 3
                });
                _iscroll.on('scroll', function () {
                    //gr.data("grid").updatePosition(this.y);
                    if (that._grid)
                        that._grid.grid("updatePosition", this.y);
                });
                this._iscroll = _iscroll;
            }

        }

        /**
         * Рендер курсора
         * @param id
         */
        vDataGrid.renderCursor = function(id) {
            var table = $('#' + this.getLid()).find('.table');
            var rowTr = table.find('.row.data[data-id='+id+']');
            table.find('.row.active').removeClass('active');
            rowTr.addClass('active');
        }

        /**
         * Рендер ячейки грида
         * @param id
         * @param index
         * @param value
         */
        vDataGrid.renderCell = function(id, datafield, value) {
            var index=null, columns = this.getObj().getCol('Columns');
            if (columns) {
                for (var i = 0, len = columns.count(); i < len; i++) {
                    if (columns.get(i).get('Field') == datafield) {
                        index = i;
                        break;
                    }
                }
                if (index) {
                    var table = $('#' + this.getLid()).find('.table');
                    var rowTr = table.find('.row.data[data-id='+id+']');
                    $(rowTr.children()[index]).html(value);
                }
            }
        }
        return vDataGrid;
    }
);