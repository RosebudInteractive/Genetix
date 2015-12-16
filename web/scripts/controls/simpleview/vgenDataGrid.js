define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/dataGrid.html',
        '/scripts/controls/simpleview/vbase.js', "wGrid", "/scripts/lib/iscroll.js"],
    function(template, tpl, Base) {
        var vDataGrid = {};
        for (var i in Base)
            vDataGrid[i] = Base[i];
        vDataGrid._templates = template.parseTemplate(tpl);


        /**
         * Рендер DOM грида
         * @param options
         */
        vDataGrid.render = function(options) {
            var that = this;
            var grid = $('#' + this.getLid());

            var hasStroll = true;
            if (this.scroll() !== undefined)
                hasStroll = this.scroll() ? true : false

            // если не создан грид
            if (grid.length == 0) {
                var pItem = $(vDataGrid._templates['grid']).attr('id', "mid_" + this.getLid());
                var layoutPane = pItem.find(".layout");
                grid = layoutPane.children(".grid-b").attr('id', this.getLid());

                var parent = (this.getParent()? '#ch_' + this.getLid(): options.rootContainer);
                $(parent).append(pItem);


                layoutPane.css({width: "100%", "height": "100%"});
                layoutPane.panel({
                    border: false
                });
                $(window).on("genetix:resize", function () {
                    layoutPane.panel('resize');
                    grid.treegrid('resize');
                });

                var gCols = vDataGrid._getColumns.call(that);
                this._grid = grid.datagrid({
                    columns:[gCols],
                    idField: "Id",
                    fit: true,
                    singleSelect: true,
                    loader: function(param, success, error) {
                        vDataGrid._getData.call(that, param, success, error);
                    },
                    onSelect: function (index,row) {
                        if (that.dataset() && that.dataset().cursor() != row.Id) {
                            that.getControlMgr().userEventHandler(that, function(){
                                that.dataset().cursor(row.id);
                            });
                        }
                    }
                });

                this._grid.datagrid("load");

                grid.focus(function() {
                    if (that.getRoot().currentControl() != that) {
                        that.getControlMgr().userEventHandler(that, function () {
                            that.setFocused();
                        });
                    }
                });

            } else {
                pItem = $("#mid_" + this.getLid());
            }

            if (this.verticalAlign()) {
                pItem.css("display", "table-cell");
                var vAl = this.verticalAlign().toUpperCase();
                if (vAl == "TOP")
                    pItem.css("vertical-align", "top");
                else if (vAl == "BOTTOM")
                    pItem.css("vertical-align", "bottom");
                else
                    pItem.css("vertical-align", "middle");
            }
            else {
                pItem.css("display", "");
                pItem.css("vertical-align", "");
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

            var cssPos = (hasStroll ? "absolute" : "relative");
            grid.children().css({"position": cssPos});

            // выставляем фокус
            //if ($(':focus').attr('id') != this.getLid() && this.getRoot().isFldModified("CurrentControl") && this.getRoot().currentControl() == this)
            //    pItem.find("tr[tabIndex=1]").focus();
            //else
            //    pItem.find("tr[tabIndex=1]").blur();

            vDataGrid._setVisible.call(this);
            vDataGrid._genEventsForParent.call(this);
        }

        vDataGrid.setFocus = function() {
            var pItem = $("#mid_" + this.getLid());
            pItem.find("tr[tabIndex=1]").focus();
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vDataGrid._genEventsForParent = function() {
            var genEvent = false;
            var changedFields = {};
            if (this.isFldModified("Width")) { changedFields.Width = true; genEvent = true; }
            if (this.isFldModified("Height")) { changedFields.Height = true; genEvent = true; }
            if (this.isFldModified("HorizontalAlign")) { changedFields.HorizontalAlign = true; genEvent = true; }
            if (this.isFldModified("VerticalAlign")) { changedFields.VerticalAlign = true; genEvent = true; }
            if (this.isFldModified("MinWidth")) { changedFields.MinWidth = true; genEvent = true; }
            if (this.isFldModified("MinHeight")) { changedFields.MinHeight = true; genEvent = true; }
            if (this.isFldModified("MaxWidth")) { changedFields.MaxWidth = true; genEvent = true; }
            if (this.isFldModified("MaxHeight")) { changedFields.MaxHeight = true; genEvent = true; }
            if (this.isFldModified("PadLeft")) { changedFields.PadLeft = true; genEvent = true; }
            if (this.isFldModified("PadRight")) { changedFields.PadRight = true; genEvent = true; }
            if (this.isFldModified("PadTop")) { changedFields.PadTop = true; genEvent = true; }
            if (this.isFldModified("PadBottom")) { changedFields.PadBottom = true; genEvent = true; }
            if (this.isFldModified("Visible")) { changedFields.Visible = true; genEvent = true; }

            if (this._reloaded) { changedFields.Height = true; genEvent = true; }
            if (genEvent) {
                $('#ch_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }

        vDataGrid._getData = function(param, success, error) {
            var dataset = null;
            var rootElem = null;
            var datafields = [];
            var data = [];

            if (this.dataset()) {
                //dataset = cm.get(o.dataset());
                dataset = this.dataset();
                if (dataset) {
                    rootElem = dataset.root();
                }
            }
            if (rootElem) {
                var idIndex = null;
                var fieldsArr = {};
                var fields = dataset.getCol('Fields');
                for (var i = 0, len = fields.count(); i < len; i++) {
                    var field = fields.get(i);
                    fieldsArr[field.getGuid()] = field.get('Name');
                    if (field.get('Name') == 'Id')
                        idIndex = field.getGuid();
                    datafields.push({name: field.get('Name')});
                }

                var col = rootElem.getCol('DataElements');
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
                }

            }
            success(data);
        }

        vDataGrid._getColumns = function() {
            var gridColumns = [];
            var dataset = this.dataset();
            var columns = this.getCol('Columns');
            var fieldsArr = {};

            if (dataset) {
                var fields = dataset.getCol('Fields');
                for (var i = 0, len = fields.count(); i < len; i++) {
                    var field = fields.get(i);
                    fieldsArr[field.getGuid()] = field.get('Name');
                    if (columns.count() == 0) {
                        var gridCol = {};
                        gridCol.field = field.get('Name');
                        gridCol.title = field.get('Name');
                        gridColumns.push(gridCol);
                    }
                }
            }

            if (columns.count() > 0) {
                for (var i = 0, len = columns.count(); i < len; i++) {
                    var column = columns.get(i);
                    var gridCol = {};
                    gridCol.field = fieldsArr[column.get('Field').getGuid()];
                    gridCol.title = column.get('Label');
                    if (column.get('Width'))
                        gridCol.width = column.get('Width')+'%';
                    gridColumns.push(gridCol);
                }
            }

            return gridColumns;
        },


        /**
         * Рендер курсора
         * @param id
         */
        vDataGrid.renderCursor = function(id) {
            if (!id || !(this._grid)) return false;

            this._grid.datagrid('selectRecord', id);
        }

        return vDataGrid;
    }
);