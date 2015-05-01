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
            var parsedObj = {obj: null};
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
    var curColWidth = windowWidth / curColCount;
    console.log("windowWidth: " + windowWidth + ", curColCount: " + curColCount + ", curColWidth: " + curColWidth);

    for (var i = 0; i < this._rows.length; i++) {
        var rowObj = this._rows[i];
        var rowEl = rowObj.element;
        var rowWidth = rowEl.parent().width();
        rowEl.width(rowWidth);
        var children = rowObj.children;

        // общее ко-во колонок в строке
        var rowColCount = 0;
        for (var j = 0; j < children.length; j++) {
            var childObj = children[j];
            rowColCount += childObj.end - childObj.start + 1
        }

        // реальное ко-во колонок для элемента
        var proportion = curColCount / rowColCount;
        var tookColCount = 0;
        for (var j = 0; j < children.length; j++) {
            var childObj = children[j];
            var wantedColCount = childObj.end - childObj.start + 1;
            var realColCount = Math.floor(wantedColCount * proportion);
            if (realColCount < childObj.minColumns)
                realColCount = childObj.minColumns;
            // если тек. элемент выходит за границы, то расширим пред. до конца строки
            // текущий переместится вниз
            if (realColCount + tookColCount > curColCount) {
                // если есть предыдущий
                if (j - 1 >= 0) {
                    children[j - j].realColCount = children[j - j].realColCount + (curColCount - tookColCount);
                    childObj.realColCount = realColCount;
                    tookColCount = realColCount;
                } else { // иначе уменьшаем текущий
                    childObj.realColCount = curColCount - tookColCount;
                    tookColCount += childObj.realColCount
                }
            } else
                childObj.realColCount = realColCount;

            tookColCount += realColCount;
            //var childPerc = (childObj.end - childObj.start + 1) / rowColCount;
            //childObj.element.width(childPerc * rowWidth);
        }

        var emptyColCount = curColCount - tookColCount;
        for (var j = 0; j < emptyColCount; j++) {
            var childObj = children[j];
            childObj.realColCount++;
        }

        for (var j = 0; j < children.length; j++) {
            var childObj = children[j];
            childObj.element.width(childObj.realColCount * curColWidth);
        }
    }

}

HtmlGenerator.setParameters = function(params) {
    var args = params.split(",");
    this.columnsCount = +(args[0].trim());  // количество колонок
    this.minColWidth = +(args[1].trim());   // минимальная ширина
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
    } else
        row = this.getRow(parentContainer.obj);


    while (indent == levelIndent && nextPos < strings.length) {
        var curObj = this.getObj(curStr, row);
        if (row) {
            row.element.append(curObj);
        } else
            parentContainer.obj = curObj;

        // если конец строки, то добавляем новый row
        var curStrParts = curStr.trim().split(",");
        if (curStrParts[curStrParts.length - 1].toUpperCase().trim() == "BR") {
            row = this.getRow(parentContainer.obj);
        }

        var contEl = null;
        if (this.isContainer(curStr))
            contEl = curObj.find(".c-content");
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
            var upperRes = {obj: contEl};
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
        parent.append(row);
        row.width(row.parent().width());
    }
    var rowObj = {element: row, children: []};
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

    var colsStr = parts[1];
    var colsParts = colsStr.split("-");
    var minCols = +parts[2];
    var elObj = {element: el, start: +colsParts[0], end: +colsParts[1],minColumns: minCols};
    rowObj.children.push(elObj);
    return el;
}

HtmlGenerator.countSpaces = function(str) {
    try {
        return (str ? str.match(/^\s+/)[0].length : 0);
    } catch (e) {
        return 0;
    }
}

