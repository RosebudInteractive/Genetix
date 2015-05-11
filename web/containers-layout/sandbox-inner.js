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
    var curColCount = Math.floor(windowWidth/this.minColWidth);
    curColCount = (curColCount > this.columnsCount ? this.columnsCount : curColCount);
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
                        if (j > 0) {
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

HtmlGenerator.extendLineControls = function(rowObj, lastElIdx, curColCount) {
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
    if (found)
        children[lastElIdx].isLineEnd = true;
}

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
        if (curStrParts[curStrParts.length - 1].length > 2 &&
            curStrParts[curStrParts.length - 1].toUpperCase().trim().substr(0,2) == "BR") {
            row = this.getRow(parentContainer, curStrParts[curStrParts.length - 1]);
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

HtmlGenerator.getRow = function(parent, brSign) {
    var row = $(this._templates["row"]);
    if (parent) {
        parent.obj.append(row);
    }
    var grow = brSign && (brSign.toUpperCase().indexOf("(TRUE)") >= 0);

    var rowObj = {
        element: row,
        children: [],
        container: (parent ? parent.container : null),
        grow: grow
    };
    this._rows.push(rowObj);
    return rowObj;
}

HtmlGenerator.isContainer = function(curStr) {
    var tCurStr = curStr.trim().toUpperCase();
    return tCurStr.indexOf("CONTAINER") == 0;
}

HtmlGenerator.getObj = function(curStr, rowObj, pos) {
    var elObj = null;
    if (curStr != "EMPTY") {
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
        var stretch = parts[2];
        elObj = {
            element: el,
            width: cols,
            //minColumns: minCols,
            doNotBreak: (parts[parts.length - 1].toUpperCase().trim() == "NBR"),
            grow: (stretch === "true" ? true : (stretch == "" ? null : false)),
            isEmpty: false
        };
    } else {
        var el = $(this._templates[curStr]);
        rowObj.element.append(el);
        //el.insertAfter(rowObj.children[pos].element);
        elObj = {
            element: el,
            width: 0,
            doNotBreak: false,
            grow: true,
            isEmpty: true
        };
    }
    if (pos !== undefined)
        rowObj.children.splice(pos, 0, elObj);
    else
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

