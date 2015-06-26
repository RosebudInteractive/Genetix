define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/dataGrid.html', "wGrid", "/scripts/lib/iscroll.js"],
    function(template, tpl) {
        var vDataGrid = {};
        vDataGrid._templates = template.parseTemplate(tpl);


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
                var parent = (this.getParent()? '#ch_' + this.getLid(): options.rootContainer);
                $(parent).append(grid);

                var opt = {
                    height: $(parent).height(),
                    width: "100%",
                    columns: [],
                    source: this.source,
                    selectrow: function (event, row, obj) {
                        if (row && 'Id' in row) {
                            event.stopPropagation();
                            that.getControlMgr().userEventHandler(that, function(){
                                var ds = that.dataset();
                                if (ds.cursor() != row.Id) ds.cursor(row.Id);
                            });

                            //setTimeout(function () {
                            //    if (that._iscroll && obj) {
                            //        that._iscroll.scrollToElementVisible(obj.get(0), 0);
                            //    }
                            //}, 0);

                        }
                    },
                    sizechanged: function() {
                        if (that._grid)
                            vDataGrid._refreshScroll(that);
                    }
                };

                this._grid = grid.grid(opt);
                this._iscroll = null;


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

                var rootElem = null;
                var dataset = null;

                var columnsArr = [];

                if (o.dataset()) {
                    //dataset = cm.get(o.dataset());
                    dataset = o.dataset();
                    if (dataset) {
                        rootElem = dataset.root();
                        //rootElem = rootElem? cm.getObj(rootElem): null;
                    }
                }

                if (rootElem)
                {
                    // данные
                    var col = rootElem.getCol('DataElements');
                    // колонки грида
                    var columns = o.getCol('Columns');
                    // поля
                    var fields = dataset.getCol('Fields');

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
                            gridCol.datafield = fieldsArr[column.get('Field').getGuid()];
                            gridCol.text = column.get('Label');
                            if (column.get('Width'))
                                gridCol.width = column.get('Width')+'%';
                            gridColumns.push(gridCol);
                            columnsArr.push({field:column.get('Field').getGuid(), width:column.get('Width')});
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


            o._source.datafields = datafields;
            o._source.localdata = data;

            if (o._grid) {
                o._grid.grid("reloading", gridColumns, o._source);
                if (cursor) o._grid.grid("selectrow", cursor);
                vDataGrid._refreshScroll(o);
            }


        }

        vDataGrid._refreshScroll = function(o) {
            if (o._iscroll) {
                o._iscroll.refresh();
            } else {

                var _iscroll = new IScroll(o._grid.find('.scrollable-bll').get(0), {
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
                    probeType: 3,
                    rightPadding: 0
                });
                _iscroll.on('scroll', function () {
                    //gr.data("grid").updatePosition(this.y);
                    if (o._grid)
                        o._grid.grid("updatePosition", this.y);
                });
                _iscroll.on('scrollStart', function() {
                    $(this.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: 1});
                });
                _iscroll.on('scrollEnd', function() {
                    $(this.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: ""});
                });
                o._iscroll = _iscroll;
            }

        }

        /**
         * Рендер курсора
         * @param id
         */
        vDataGrid.renderCursor = function(id) {
            if (!id) return false;
            this._grid.grid('selectrow', id, true);
        }

        /**
         * Рендер ячейки грида
         * @param id
         * @param index
         * @param value
         */
        vDataGrid.renderCell = function(id, datafield, value) {
            vDataGrid._reloading(this);
        }
        return vDataGrid;
    }
);