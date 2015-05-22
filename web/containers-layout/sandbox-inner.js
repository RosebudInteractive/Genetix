/**
 * User: kiknadze
 * Date: 30.04.2015
 * Time: 16:14
 */

var templates = null;
require(
    ['/scripts/lib/uccello/uses/template.js', 'text!/containers-layout/frame-template.html'],
    function (template, tpl) {
        templates = template.parseTemplate(tpl);
    }
);



var HtmlGenerator = function(isRoot) {
    this._drawGrid = true;
    this._childrenGenerators = [];
    this._isRoot = isRoot;

    this.parseInput = function (content, parentContainer) {
        var that = this;
        this._templates = templates;
        this._rows = [];
        this._childrenGenerators = [];


        var stringArray = content;
        if (typeof stringArray == "string")
            stringArray = stringArray.split("\n");
        var parsedObj = {obj: null, container: null};
        this.parseLevel(stringArray, parsedObj, 0);

        var parentEl = parentContainer || $("body");
        parentEl.children(".f-row").remove();
        parentEl.prepend(parsedObj.obj);

        if (!parentContainer) {
            $(window).off("resize").resize(function () {
                that.resizeHandler();
                that.drawGridHandler();
            });
        }

        if (this._isRoot) {
            setTimeout(function() {
                that.resizeHandler();
                that.drawGridHandler();
            }, 0);
        }

    };

    this.getGridParameters = function() {
        var windowWidth = $("body").width();
        if (!this._isRoot)
            windowWidth = this.getRootRow().element.parent().width();

        // подсчитаем текущее ко-во колонок
        var curColCount = Math.floor(windowWidth/this.minColWidth);
        curColCount = (curColCount > this.columnsCount ? this.columnsCount : curColCount);

        if (curColCount == 0) {
            curColCount = 1;
            curColWidth = this.minColWidth;
        } else {
            var curColWidth = Math.floor(windowWidth / curColCount);
            if (curColWidth > this.maxColWidth) {
                curColWidth = this.maxColWidth;
                curColCount = Math.floor(windowWidth / curColWidth);
                //if (windowWidth % this.maxColWidth != 0)
                //    curColCount++;
                //curColWidth = Math.floor(windowWidth / curColCount);
            } else if (curColWidth < this.minColWidth) {
                curColWidth = this.minColWidth;
                curColCount = Math.floor(windowWidth / curColWidth);
            }
        }
        return {
            windowWidth: windowWidth,
            curColCount: curColCount,
            curColWidth: curColWidth
        }
    }

    this.resizeHandler = function() {
        var dBegin = new Date();
        var params = this.getGridParameters();
        var windowWidth = params.windowWidth;
        var curColCount = params.curColCount;
        var curColWidth = params.curColWidth;

        console.log("windowWidth: " + windowWidth + ", curColCount: " + curColCount + ", curColWidth: " + curColWidth);

        for (var i = 0; i < this._rows.length; i++) {
            var rowObj = this._rows[i];
            var rowEl = rowObj.element;
            if (rowObj.container) curColCount = rowObj.container.realColCount;
            var rowWidth = curColCount * curColWidth;
            rowEl.width(rowWidth);
            var children = rowObj.children;

            rowEl.find(".control-wrapper.empty").remove();
            // общее ко-во колонок в строке, заодно удалим пустые элементы
            var rowColCount = 0;
            var j = 0;
            while (j < children.length) {
                var childObj = children[j];
                if (!childObj.isEmpty) {
                    rowColCount += childObj.width;
                    j++;
                } else {
                    childObj.element.remove();
                    children.splice(j, 1);
                }
                childObj.isLineEnd = false;
            }

            if (children.length == 0) continue;
            var length = children.length;
            var tookColCount = 0;
            if (rowColCount <= curColCount) {
                var j = 0;
                while (j < length) {
                    var childObj = children[j];
                    childObj.realColCount = childObj.width;
                    childObj.isExtendedToEnd = false;
                    tookColCount += childObj.realColCount;

                    j++;
                }
                this.extendLineControls(rowObj, length - 1, curColCount);
            } else {
                tookColCount = 0;
                var j = 0;
                var breakOnNextLine = true;
                while (j < length) {
                    var childObj = children[j];
                    // если не помещается
                    if (tookColCount + childObj.width > curColCount) {
                        if (j > 0)
                            this.extendLineControls(rowObj, j - 1, curColCount);
                        if (childObj.width >= curColCount) {
                            childObj.realColCount = curColCount;
                            childObj.isExtendedToEnd = true;
                            childObj.isLineEnd = true;
                            tookColCount = 0;
                        } else {
                            childObj.realColCount = childObj.width;
                            childObj.isExtendedToEnd = false;
                            tookColCount = childObj.realColCount;
                        }
                    } else {
                        childObj.realColCount = childObj.width;
                        childObj.isExtendedToEnd = false;
                        tookColCount += childObj.realColCount;
                    }


                    // если это последний элемент, то расширим его
                    if (j > 0 && j + 1 == length) {
                        this.extendLineControls(rowObj, j, curColCount);
                    } else if (j + 1 != length && childObj.doNotBreak && breakOnNextLine) {
                        // проверим поместится ли след контрол, если нет, то перенесем все на след. строку
                        var nextChild = children[j+1];
                        // Если не помещается, то расширим предыдущий элемент и к обработке след. контрола не переходим.
                        // Повторяем вычисления для этого же контрола
                        if (curColCount - tookColCount < nextChild.width) {
                            if (j > 0 && !(children[j - 1].isLineEnd)) {
                                this.extendLineControls(rowObj, j-1, curColCount);
                            }
                            tookColCount = 0;
                            breakOnNextLine = false;
                            continue;
                        }
                    }
                    j++;
                    breakOnNextLine = true;
                }
            }

            // выставим ширину и вычислим максимальную высоту
            for (var k = 0; k < children.length; k++) {
                var childObj = children[k];
                childObj.element.css({height: "auto"});
                childObj.element.width(childObj.realColCount * curColWidth);
            }
        }

        // пересчитаем дочерние хендлеры
        for (var  i= 0; i < this._childrenGenerators.length; i++) {
            this._childrenGenerators[i].resizeHandler();
            this._childrenGenerators[i].drawGridHandler();
        }

        for (var i = this._rows.length - 1; i >= 0 ; i--) {
            var children = this._rows[i].children;
            var maxHeight = 0;
            for (var m = 0; m < children.length; m++) {
                var childObj = children[m];
                maxHeight = Math.max(maxHeight, childObj.element.height());
            }

            // теперь выставим у всех высоту
            for (var m = 0; m < children.length; m++) {
                var childObj = children[m];
                if (childObj.isLineEnd)
                    childObj.element.height(maxHeight);
            }
        }

        for (var i = 0; i < this._rows.length; i++) {
            var children = this._rows[i].children;

            var maxHeight = 0;
            for (var m = 0; m < children.length; m++) {
                var childObj = children[m];
                maxHeight = Math.max(maxHeight, childObj.element.height());
            }

            // теперь выставим у всех высоту
            for (var m = 0; m < children.length; m++) {
                var childObj = children[m];
                childObj.element.height(maxHeight);
            }
        }

        var dEnd = new Date();
        console.log("Длительность пересчета: " + (dEnd - dBegin) + " мСек.")
    };

    this.extendLineControls = function(rowObj, lastElIdx, curColCount) {
        var tookColCount = 0;
        var children = rowObj.children;
        var k = lastElIdx;
        var found = false;
        while (k >= 0) {
            var extChild = rowObj.children[k];
            if (k == lastElIdx || !(extChild.isLineEnd)) {
                tookColCount += extChild.realColCount;
                k--;
            }
            else if (k != lastElIdx && extChild.isLineEnd) k = -1;
            else k--;
        }

        k = lastElIdx;
        extChild = rowObj.children[k];
        while (k >= 0 && !extChild.isLineEnd && tookColCount < curColCount) {
            if (extChild.grow || (extChild.grow == null && rowObj.grow)) {
                extChild.realColCount++;
                extChild.isExtendedToEnd = true;
                tookColCount++;
                found = true;
            }
            k--;
            if ((k < 0 || children[k].isLineEnd) && found && tookColCount < curColCount)
                k = lastElIdx;
            else if (!found && k >= 0 && children[k].isLineEnd)
                break;
            extChild = rowObj.children[k];
        }

        // Если не найдено, то займем пустое место невидимым элементом
        if (!found && tookColCount < curColCount) {
            var emptyChild = this.getObj("EMPTY", rowObj, lastElIdx);
            emptyChild.realColCount = curColCount - tookColCount;
            emptyChild.isLineEnd = true;
        }
        //if (found)
        children[lastElIdx].isLineEnd = true;
    };

    this.setParameters = function(params) {
        var args = params.split(",");
        this.columnsCount = +(args[0].trim());  // количество колонок
        this.minColWidth = +(args[1].trim());   // минимальная ширина
        this.maxColWidth = +(args[2].trim());   // макимальная ширина
    };

    this.parseLevel = function(strings, parentContainer, position) {
        var nextPos = position;
        var isRoot = parentContainer.obj == null;
        if (position >= strings.length) return nextPos;

        var levelIndent = this.countSpaces(strings[position]);
        var indent = levelIndent;
        var curStr = strings[nextPos];

        if (!(parentContainer.obj) && this.isContainer(curStr) && nextPos != 0)
            throw "На корневом уровне должен находиться контейнер";

        var row = null;
        if (isRoot) {
            row = this.getRow(null);
            parentContainer.obj = row.element;
        } else {
            row = this.getRow(parentContainer);
        }

        while (indent == levelIndent && nextPos < strings.length) {
            var curObj = this.getObj(curStr, row);
            var curEl = curObj.element;
            if (row) {
                row.element.append(curEl);
                var that = this;
                curEl.find("textarea").autosize({
                    callback: function (el) {
                        that.resizeHandler();
                    }
                });
            } else
                parentContainer.obj = curEl;

            // если конец строки, то добавляем новый row
            var curStrParts = curStr.trim().split(",");
            if (curStrParts[curStrParts.length - 1].length >= 2 &&
                curStrParts[curStrParts.length - 1].toUpperCase().trim().substr(0,2) == "BR") {
                var brSign = curStrParts[curStrParts.length - 1];
                row.grow = brSign.toUpperCase().indexOf("(TRUE)") >= 0
                row = this.getRow(parentContainer, brSign);
                row.grow = false;
            }

            var contEl = null;
            if (this.isContainer(curStr))
                contEl = curEl.find(".c-content");
            else
                contEl = null;
            nextPos++;

            // Если контейнер имеет свою сетку, то создаем новый парсер
            if (this.isContainer(curStr) && this.isGridParams(strings[nextPos]) && !isRoot) {
                // создадим массив строк для парсера
                var subIndentLevel = this.countSpaces(curStr);
                var subStrings = [];
                subStrings.push(curStr);
                while (nextPos < strings.length) {
                    subStrings.push(strings[nextPos]);
                    nextPos++;
                    if (nextPos < strings.length && subIndentLevel >= this.countSpaces(strings[nextPos])) break;
                }

                var subGenerator = new HtmlGenerator(false);
                this._childrenGenerators.push(subGenerator);
                subGenerator.parseInput(subStrings, contEl);
            }

            if (nextPos >= strings.length) continue;
            curStr = strings[nextPos];
            if (nextPos < strings.length && this.isGridParams(strings[nextPos]) && isRoot) {
                this.setParameters(strings[nextPos]);
                curObj.width = this.columnsCount;
                nextPos++;
            }

            indent = this.countSpaces(strings[nextPos]);
            // Если уровень выше, то парсим его
            if (indent > levelIndent) {
                // проверим, что вложение происходит в контейнер
                if (contEl == null)
                    throw "Вложение может происходить только в контейнер. Строка:" + nextPos;

                // распарсим след. уровень
                var upperRes = {obj: contEl, container: curObj};
                // Если у контейнера заголовок, то создаем роу и растягиваем
                // заголовок по всей ширине
                if (curObj.isContainer && curObj.label != null) {
                    var tRow = this.getRow(upperRes, "br(true)");
                    var tObj = this.getObj("CONT_LABEL,1,true," + curObj.label + ",br", tRow);
                    tRow.element.append(tObj.element);
                }

                nextPos = this.parseLevel(strings, upperRes, nextPos);
                if (nextPos == strings.length) continue;
                curStr = strings[nextPos];
                indent = this.countSpaces(strings[nextPos]);
            } else if (indent < levelIndent) // уровень закончился
                return nextPos;
            else if (nextPos > 0 && isRoot)
                throw "На корневом уровне может находиться только 1 контейнер. Строка:" + nextPos;

        }

        return nextPos;
    };

    this.getRootRow = function() {
        return (this._rows.length > 0 ? this._rows[0] : null);
    };

    this.isGridParams = function(str) {
        var parts = str.split(",");
        return (parts.length == 3 && $.isNumeric(parts[0].trim()));
    }

    this.getRow = function(parent, brSign) {
        var row = $(this._templates["row"]);
        if (parent) {
            parent.obj.append(row);
        }
        var grow = (brSign !== undefined) && (brSign.toUpperCase().indexOf("(TRUE)") >= 0);

        var rowObj = {
            element: row,
            children: [],
            container: (parent ? parent.container : null),
            grow: grow
        };
        this._rows.push(rowObj);
        return rowObj;
    };

    this.isContainer = function(curStr) {
        var tCurStr = curStr.trim().toUpperCase();
        return tCurStr.indexOf("CONTAINER") == 0;
    };

    this.getObj = function(curStr, rowObj, pos) {
        var elObj = null;
        if (curStr != "EMPTY") {
            var srcStr = curStr.trim();
            //var tCurStr = srcStr.toUpperCase();
            var parts = srcStr.split(",");
            var templateName = parts[0].toUpperCase().trim();
            var template = this._templates[templateName];
            var contLabel = null;
            var el = $(template);
            if (templateName == "LABEL" || templateName == "CONT_LABEL") {
                el.find(".control.label").text(parts[3]);
            } else if (templateName == "CONTAINER") {
                if (parts.length >= 4 && (parts[3].toUpperCase().indexOf("br") < 0))
                   contLabel = parts[3];
            }

            var cols = +parts[1];
            var stretch = parts[2];
            elObj = {
                element: el,
                width: cols,
                //minColumns: minCols,
                doNotBreak: (parts[parts.length - 1].toUpperCase().trim() == "NBR"),
                grow: (stretch === "true" ? true : (stretch == "" ? null : false)),
                isEmpty: false,
                isMultyLine: (templateName == "TEXTAREA"),
                isContainer: (templateName == "CONTAINER"),
                label: contLabel
            };
        } else {
            var el = $(this._templates[curStr]);
            //rowObj.element.append(el);
            el.insertAfter(rowObj.children[pos].element);
            elObj = {
                element: el,
                width: 0,
                doNotBreak: false,
                grow: true,
                isEmpty: true,
                isMultyLine: (templateName == "TEXTAREA")
            };
        }
        rowObj.children.push(elObj);
        return elObj;
    };

    this.countSpaces = function(str) {
        try {
            return (str ? str.match(/^\s+/)[0].length : 0);
        } catch (e) {
            return 0;
        }
    };

    this.drawGridHandler = function() {
        if (this.drawGrid()) {
            var gridContainer = $(".grid");
            var params = this.getGridParameters();
            var windowWidth = params.windowWidth;
            var curColCount = params.curColCount;
            var curColWidth = params.curColWidth;

            gridContainer.empty();
            gridContainer.height($(window).height());
            //gridContainer.width(windowWidth - 8);

            for (var i = 0; i < curColCount; i++) {
                var colEl = $(this._templates["gridColumn"]);
                gridContainer.append(colEl);
                colEl.height(gridContainer.height());
                colEl.width(curColWidth);
            }


            gridContainer.show();
        } else
            $(".grid").hide();
    };

    this.drawGrid = function(value) {
        if (value === undefined) return (this._drawGrid || false);
        else {
            this._drawGrid = value;
            this.drawGridHandler();
        }
    }

};

var generator = null;
function executeGenerator(content) {
    if (!generator) generator = new HtmlGenerator(true);
    generator.parseInput(content);
};

function drawGrid(value) {
    generator.drawGrid(value);
};


