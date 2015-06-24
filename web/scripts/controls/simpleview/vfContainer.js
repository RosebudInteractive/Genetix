define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/fContainer.html', "flex-container"],
    function(template, tpl) {
        var vFContainer = {};
        vFContainer._templates = template.parseTemplate(tpl);
        vFContainer.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            if (item.length == 0) {
                // объект контейнера
                var allItems = $(vFContainer._templates['container']);
                // добавляем в парент
                var parent = this.getParent()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(allItems);

                item = allItems.first(".control").attr('id', this.getLid())

                var isRoot = this.hasGrid();
                this._isRoot = isRoot;

                if (isRoot) {
                    this._rows = [];
                    this._childrenGenerators = [];
                } else
                    this._rows = null;

                // верхний отступ
                var hRow = vFContainer.getRow.call(this, item);
                var hEl = $(vFContainer._templates['HEADER']).attr("id", "top-margin-" + this.getLid());
                var hObj = vFContainer.getObj.call(this, "true,", hRow, hEl);

                // Заголовок контейнера
                if (this.title()) {
                    var tRow = vFContainer.getRow.call(this, item);
                    var lbEl = $(vFContainer._templates['CONT_LABEL']);
                    var tObj = vFContainer.getObj.call(this, "true,", tRow, lbEl);
                    tObj.label = this.title();
                    tObj.element.find(".control.label").text(this.title());
                }

                var row = vFContainer.getRow.call(this, item);

                // создаем врапперы для чайлдов
                var childs = this.getCol('Children');
                for(var i=0; i<childs.count();i++) {
                    var child = this.getControlMgr().get(childs.get(i).getGuid());
                    if (!child.left) continue;
                    var curStr = child.layoutProp();

                    // если конец строки, то добавляем новый row
                    var curStrParts = curStr.trim().split(",");

                    var div = $('<div class="control-wrapper"></div>').attr('id', 'ch_'+child.getLid());
                    var ch = vFContainer.getObj.call(this, curStr, row, div);
                    ch.width = child.width();
                    ch.isLabel = child.className == "GenLabel";

                    if (curStrParts[curStrParts.length - 1].length >= 2 &&
                        curStrParts[curStrParts.length - 1].toUpperCase().trim().substr(0,2) == "BR") {
                        var brSign = curStrParts[curStrParts.length - 1];
                        row.grow = brSign.toUpperCase().indexOf("(TRUE)") >= 0
                        row = vFContainer.getRow.call(this, item);
                        row.grow = false;
                    }

                }

                // нижний отступ
                var fRow = vFContainer.getRow.call(this, item);
                var fEl = $(vFContainer._templates['HEADER']).attr("id", "bottom-margin-" + this.getLid());
                var fObj = vFContainer.getObj.call(this, "true,", fRow, fEl);

                var wOptions = {};
                wOptions._control = this;
                wOptions._rows = this._rows;
                wOptions._childrenGenerators = this._childrenGenerators;
                wOptions._isRoot = this._isRoot;
                wOptions._isRootFlex = vFContainer.isRootFlex.call(this);
                wOptions._maxColWidth = this.maxColWidth();
                wOptions._minColWidth = this.minColWidth();
                wOptions._columnsCount = this.columnsCount();
                wOptions._padding = this.padding();
                wOptions._parentFlex = vFContainer.getParentFlex.call(this);
                wOptions._templates = vFContainer._templates;
                wOptions._lid = this.getLid();
                this._containerWidget = item.genetixFlexContainer(wOptions);
            }

            // убираем удаленные объекты
			var del = this.getLogCol('Children').del;
            for (var guid in del)
                $('#ch_' + del[guid].getLid()).remove();

        };

        vFContainer.getObj = function(curStr, rowObj, el, pos) {
            var elObj = null;
            if (curStr != "EMPTY" && curStr != "PADDING") {
                var srcStr = curStr.trim();
                //var tCurStr = srcStr.toUpperCase();
                var parts = srcStr.split(",");
                var stretch = parts[0];
                rowObj.element.append(el);
                elObj = {
                    element: el,
                    width: 0,
                    //minColumns: minCols,
                    doNotBreak: (parts[parts.length - 1].toUpperCase().trim() == "NBR"),
                    grow: (stretch === "true" ? true : (stretch == "" ? null : false)),
                    isEmpty: false,
                    isMultyLine: false,
                    isLabel: false
                };
                rowObj.children.push(elObj);
            } else if (curStr == "EMPTY") {
                el = $(vFContainer._templates[curStr]);
                if (pos == -1)
                    rowObj.element.prepend(el);
                else
                    el.insertAfter(rowObj.children[pos].element);

                elObj = {
                    element: el,
                    width: 0,
                    doNotBreak: false,
                    grow: true,
                    isEmpty: true,
                    isPadding: (curStr == "PADDING"),
                    isMultyLine: false
                };
                rowObj.children.push(elObj);
            } else {
                el = $(vFContainer._templates[curStr]);
                if (pos == -1)
                    rowObj.element.parent().parent().prepend(el);
                else
                    rowObj.element.parent().parent().append(el);

                elObj = {
                    element: el,
                    width: 0,
                    doNotBreak: false,
                    grow: true,
                    isEmpty: true,
                    isPadding: (curStr == "PADDING"),
                    isMultyLine: false
                };
            }
            return elObj;
        };

        vFContainer.isRootFlex = function() {
            var result = true;
            var parent = this.getParent();
            while (parent && result) {
                if (parent.className != "FContainer") {
                    result = true;
                    break;
                }
                else if (parent.hasGrid()) result = false;
                parent = parent.getParent();
            }

            return result;
        };

        vFContainer.getParentFlex = function() {
            var result = this;
            var parent = this.getParent();
            while (parent) {
                if (parent.className != "FContainer") {
                    break;
                }
                else if (parent.hasGrid()) {
                    result = parent;
                    break;
                }
                parent = parent.getParent();
            }

            return vFContainer.getWidget.call(result);
        };

        vFContainer.getWidget = function() {
            return this._containerWidget;
        }

        vFContainer.getContainerWithGrid = function() {
            var result = null;
            if (this.hasGrid()) result = this;
            else {
                var parent = this.getParent();
                while (parent && !result) {
                    if (parent.className != "FContainer") break;
                    else if (parent.hasGrid()) result = parent;
                    else parent = parent.getParent();
                }
            }

            return result;
        }

        vFContainer.getRow = function(parent) {
            var row = $(vFContainer._templates["row"]);
            var contEl = parent.children(".c-content")
            contEl.append(row);

            var rowObj = {
                element: row,
                children: [],
                grow: false,
                container: {}
            };
            var fCont = vFContainer.getContainerWithGrid.call(this);
            fCont._rows.push(rowObj);
            return rowObj;
        };


        return vFContainer;
    }
);