/**
 * User: kiknadze
 * Date: 30.04.2015
 * Time: 16:14
 */

var HtmlGenerator = {};

HtmlGenerator.parseInput = function (content) {
    require(
        ['/scripts/lib/uccello/uses/template.js', 'text!/containers-layout/frame-template.html'],
        function (template, tpl) {
            HtmlGenerator._templates = template.parseTemplate(tpl);
            HtmlGenerator._rows = [];

            var stringArray = content.split("\n");
            var firstStr = stringArray.shift();
            HtmlGenerator.setParameters(firstStr);
            var parsedObj = {obj: null, container: null};
            HtmlGenerator.parseLevel(stringArray, parsedObj, 0);

            $("body").empty().append(parsedObj.obj);

            $(window).resize(function () {
                HtmlGenerator.resizeHandler();
            });
            setTimeout(function() {
                HtmlGenerator.resizeHandler();
            }, 0);
        });
};

HtmlGenerator.resizeHandler = function() {
    var windowWidth = $(window).width();

    // подсчитаем текущее ко-во колонок
    var curColCount = Math.floor((this.columnsCount*windowWidth)/(this.columnsCount*this.minColWidth));
    curColCount = (curColCount > this.columnsCount ? this.columnsCount : curColCount);
    var curColWidth = Math.floor(windowWidth / curColCount);
    if (curColWidth > this.maxColWidth) {
        curColCount = Math.floor(windowWidth / this.maxColWidth);
        if (windowWidth % this.maxColWidth != 0)
            curColCount++;
        curColWidth = Math.floor(windowWidth / curColCount);
    }

    console.log("windowWidth: " + windowWidth + ", curColCount: " + curColCount + ", curColWidth: " + curColWidth);

    for (var i = 0; i < this._rows.length; i++) {
        var rowObj = this._rows[i];
        var rowEl = rowObj.element;
        if (rowObj.container) curColCount = rowObj.container.realColCount;
        var rowWidth = curColCount * curColWidth;
        rowEl.width(rowWidth);
        var children = rowObj.children;

        // общее ко-во колонок в строке
        var rowColCount = 0;
        var minColCount = 0;
        for (var j = 0; j < children.length; j++) {
            var childObj = children[j];
            rowColCount += childObj.width;
            minColCount += childObj.minColumns;
        }

        var tookColCount = 0;
        if (rowColCount <= curColCount || minColCount <= curColCount) {
            var useMinColCount = true;
            if (rowColCount <= curColCount) {
                useMinColCount = false;
            }
            var j = 0;
            var breakOnNextLine = true;
            while (j < children.length) {
                var childObj = children[j];
                childObj.realColCount = (useMinColCount ? childObj.minColumns : childObj.width);
                childObj.isExtendedToEnd = false;
                tookColCount += childObj.realColCount;

                // проверим поместится ли след контрол, если нет, то перенесем все на след. строку
                if (j + 1 != children.length && childObj.doNotBreak && breakOnNextLine) {
                    var nextChild = children[j+1];
                    // Если не помещается, то расширим предыдущий элемент и к обработке след. контрола не переходим.
                    // Повторяем вычисления для этого же контрола
                    if (curColCount - tookColCount < nextChild.minColumns) {
                        if (j > 0 && !(children[j-1].isExtendedToEnd)) {
                            children[j-1].realColCount = children[j-1].realColCount + curColCount - tookColCount;
                            children[j-1].isExtendedToEnd = true;
                        }
                        tookColCount = 0;
                        breakOnNextLine = false;
                        continue;
                    }
                }

                j++;
                breakOnNextLine = true;
            }
            var elIdx = 0;
            // расширим последний элемент
            //childObj.realColCount = childObj.realColCount + curColCount - tookColCount;

            var found = false;
            var growAll = false;
            while (tookColCount < curColCount) {
                var childObj = children[elIdx];
                if (childObj.grow || growAll) {
                    childObj.realColCount++;
                    tookColCount++;
                    found = true;
                }
                elIdx++;
                if (elIdx == children.length) {
                    elIdx = 0;
                    // Если не найдено ни одного контрола для увеличения
                    if (!found) growAll = true;
                }
            }
        } else {
            tookColCount = 0;
            var j = 0;
            var breakOnNextLine = true;
            while (j < children.length) {
                var childObj = children[j];
                if (tookColCount + childObj.minColumns > curColCount) {
                    // расширим предыдущий контрол
                    if (tookColCount != 0 && j > 0) {
                        children[j-1].realColCount = children[j-1].realColCount + curColCount - tookColCount;
                        children[j-1].isExtendedToEnd = true;
                    }

                    if (childObj.minColumns >= curColCount) {
                        childObj.realColCount = curColCount;
                        childObj.isExtendedToEnd = true;
                        tookColCount = 0;
                    } else {
                        childObj.realColCount = childObj.minColumns;
                        childObj.isExtendedToEnd = false;
                        tookColCount = childObj.realColCount;
                    }
                } else {
                    childObj.realColCount = childObj.minColumns;
                    childObj.isExtendedToEnd = false;
                    tookColCount += childObj.realColCount;
                }


                //childObj.realColCount = (childObj.minColumns <= curColCount ? childObj.minColumns : curColCount);
                // если это последний элемент, то расширим его
                if (j + 1 == children.length && !(childObj.isExtendedToEnd)) {
                    childObj.realColCount = childObj.realColCount + curColCount - tookColCount;
                    childObj.isExtendedToEnd = true;
                } else if (j + 1 != children.length && childObj.doNotBreak && breakOnNextLine) {
                    // проверим поместится ли след контрол, если нет, то перенесем все на след. строку
                    var nextChild = children[j+1];
                    // Если не помещается, то расширим предыдущий элемент и к обработке след. контрола не переходим.
                    // Повторяем вычисления для этого же контрола
                    if (curColCount - tookColCount < nextChild.minColumns) {
                        if (j > 0 && !(children[j-1].isExtendedToEnd)) {
                            children[j-1].realColCount =
                                children[j-1].realColCount + curColCount - tookColCount + childObj.realColCount;
                            children[j-1].isExtendedToEnd = true;
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
        var maxHeight = 0;
        for (var k = 0; k < children.length; k++) {
            var childObj = children[k];
            childObj.element.css({height: "auto"});
            childObj.element.width(childObj.realColCount * curColWidth);
            maxHeight = Math.max(maxHeight, childObj.element.height());
        }
        // теперь выставим у всех высоту
        for (var m = 0; m < children.length; m++) {
            var childObj = children[m];
            childObj.element.height(maxHeight);
        }
    }

};

HtmlGenerator.setParameters = function(params) {
    var args = params.split(",");
    this.columnsCount = +(args[0].trim());  // количество колонок
    this.minColWidth = +(args[1].trim());   // минимальная ширина
    this.maxColWidth = +(args[2].trim());   // макимальная ширина
}

HtmlGenerator.parseLevel = function(strings, parentContainer, position) {
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
        } else
            parentContainer.obj = curEl;

        // если конец строки, то добавляем новый row
        var curStrParts = curStr.trim().split(",");
        if (curStrParts[curStrParts.length - 1].toUpperCase().trim() == "BR") {
            row = this.getRow(parentContainer);
        }

        var contEl = null;
        if (this.isContainer(curStr))
            contEl = curEl.find(".c-content");
        else
            contEl = null;
        nextPos++;
        curStr = strings[nextPos];
        indent = this.countSpaces(strings[nextPos]);
        // Если уровень выше, то парсим его
        if (indent > levelIndent) {
            // проверим, что вложение происходит в контейнер
            if (contEl == null)
                throw "Вложение может происходить только в контейнер. Строка:" + nextPos;

            // распарсим след. уровень
            var upperRes = {obj: contEl, container: curObj};
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

HtmlGenerator.getRow = function(parent) {
    var row = $(this._templates["row"]);
    if (parent) {
        parent.obj.append(row);
    }
    var rowObj = {element: row, children: [], container: (parent ? parent.container : null)};
    this._rows.push(rowObj);
    return rowObj;
}

HtmlGenerator.isContainer = function(curStr) {
    var tCurStr = curStr.trim().toUpperCase();
    return tCurStr.indexOf("CONTAINER") == 0;
}

HtmlGenerator.getObj = function(curStr, rowObj) {
    var srcStr = curStr.trim();
    //var tCurStr = srcStr.toUpperCase();
    var parts = srcStr.split(",");
    var templateName = parts[0].toUpperCase().trim();
    var template = this._templates[templateName];
    var el = $(template);
    if (templateName == "LABEL") {
        el.find(".control.label").text(parts[3]);
    }

    var cols = +parts[1];
    var minCols = +parts[2];
    var elObj = {
        element: el,
        width: cols,
        minColumns: minCols,
        doNotBreak: (parts[parts.length - 1].toUpperCase().trim() == "NBR"),
        grow: templateName != "LABEL"
    };
    rowObj.children.push(elObj);
    return elObj;
}

HtmlGenerator.countSpaces = function(str) {
    try {
        return (str ? str.match(/^\s+/)[0].length : 0);
    } catch (e) {
        return 0;
    }
}

