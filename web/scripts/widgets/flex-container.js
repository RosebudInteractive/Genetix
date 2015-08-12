/**
 * User: kiknadze
 * Date: 23.06.2015
 * Time: 15:54
 */
define(
    'flex-container',
    function() {

        $.widget( "custom.genetixFlexContainer", {
            options: {
                _isRootFlex: false,
                _isRoot: false,
                _rows: [],
                _childrenGenerators: [],
                _maxColWidth: 0,
                _minColWidth: 0,
                _columnsCount: 0,
                _padding: 0,
                _parentFlex: null,
                _templates: [],
                _lid: null
            },

            _create: function() {
                var that = this;
                this._iscroll = null;
                this._deserializeOptions();
                if (this.options._isRootFlex) {
                    $(window).on("genetix:resize", function () {
                        that._launchInfo.launchPending = true;
                        console.warn("resize heppened");
                        //that.resizeHandler();
                        //that.drawGridHandler();
                    });

                    setTimeout(function () {
                        that.resizeHandler();
                        that._refreshScroll();
                        //setTimeout(function() {that._refreshScroll();}, 1000)
                    }, 0);
                    this._launchInfo = {
                        lastLaunch: Date(),
                        launchPending: false
                    };

                    setInterval(function () {
                        try {
                            if (that._launchInfo.launchPending) {
                                that._launchInfo.lastLaunch = Date();
                                console.warn("resize handler executed");
                                that.resizeHandler();
                                that._refreshScroll();
                                that._launchInfo.launchPending = false;
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }, 200);


                } else if (this.options._isRoot) {
                    var parGen = this.parentFlex();
                    if (parGen) {
                        if (parGen.genetixFlexContainer("getLid") != this.getLid())
                            parGen.genetixFlexContainer("addChildGenerator", this);
                    }
                }

            },

            addChildGenerator: function(generator) {
                this.options._childrenGenerators.push(generator);
            },

            resizeHandler: function(secondIteration) {
                secondIteration = secondIteration || false;
                console.log(this.options);
                //Запомним наличие вертикального скрола у парента
                var parentContent = $("#ext_" + this.getLid()).parent();
                var scrolls = parentContent.hasScrollBar();

                var dBegin = new Date();
                var item = $('#' + this.getLid());
                item.children(".c-content").css("width", "100%");
                var params = this._getGridParameters();
                var windowWidth = params.windowWidth;
                var curColCount = params.curColCount;
                var curColWidth = params.curColWidth;
                var padding = params.padding;
                item.children(".c-content").width(curColCount * curColWidth);

                console.log(params);

                item//.children(".c-content")
                    .children(".control-wrapper.empty.padding").remove();

                for (var i = 0; i < this.options._rows.length; i++) {
                    var rowObj = this.options._rows[i];
                    var rowEl = rowObj.element;
                    //if (rowObj.container) curColCount = rowObj.container.realColCount;

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
                        this._extendLineControls(rowObj, length - 1, curColCount);
                    } else {
                        tookColCount = 0;
                        var j = 0;
                        var breakOnNextLine = true;
                        while (j < length) {
                            var childObj = children[j];
                            // если не помещается
                            if (tookColCount + childObj.width > curColCount) {
                                if (j > 0)
                                    this._extendLineControls(rowObj, j - 1, curColCount);
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
                                this._extendLineControls(rowObj, j, curColCount);
                            } else if (j + 1 != length && childObj.doNotBreak && breakOnNextLine) {
                                // проверим поместится ли след контрол, если нет, то перенесем все на след. строку
                                var nextChild = children[j+1];
                                // Если не помещается, то расширим предыдущий элемент и к обработке след. контрола не переходим.
                                // Повторяем вычисления для этого же контрола
                                if (curColCount - tookColCount < nextChild.width) {
                                    if (j > 0 && !(children[j - 1].isLineEnd)) {
                                        this._extendLineControls(rowObj, j-1, curColCount);
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

                    // выставим ширину и сбросим высоту
                    for (var k = 0; k < children.length; k++) {
                        var childObj = children[k];
                        childObj.element.css({height: "auto"});
                        childObj.element.children().css({height: "auto"});
                        childObj.element.outerWidth(childObj.realColCount * curColWidth);
                    }
                }

                // Если заданы отступы, то добавляем их к корневой строке
                if (padding != 0 && this.options._rows.length > 0) {
                      var rPadObj = this._getObj("PADDING", this.options._rows[0], null, this.options._rows[0].children.length - 1);
                    var lPadObj = this._getObj("PADDING", this.options._rows[0], null, -1);
                    lPadObj.element.width(padding);
                    rPadObj.element.width(padding);
                }

                // пересчитаем дочерние хендлеры
                for (var  i= 0; i < this.options._childrenGenerators.length; i++) {
                    var genObj = this.options._childrenGenerators[i];
                    //genObj.func.call(genObj.context);
                    this.options._childrenGenerators[i].resizeHandler();
                    //this._childrenGenerators[i].drawGridHandler();
                }

                var topMarginEl = $("#top-margin-" + this.getLid());
                topMarginEl.css("min-height", padding + "px");
                var botMarginEl = $("#bottom-margin-" + this.getLid());
                botMarginEl.css("min-height", padding + "px");

                for (var i = this.options._rows.length - 1; i >= 0 ; i--) {
                    var children = this.options._rows[i].children;
                    var maxHeight = 0;
                    for (var m = 0; m < children.length; m++) {
                        var childObj = children[m];
                        var elId = childObj.element.attr("id");
                        if (childObj.element.attr("id") && elId && elId.indexOf("cont-label-") >= 0) {
                            maxHeight = Math.max(maxHeight, childObj.element.height());
                        } else {
                            var h = childObj.element.children().children().children().css("height");
                            if (h) h = h.replace("px", "");
                            maxHeight = Math.max(maxHeight, h);
                        }
                    }

                    // теперь выставим высоту у концов строк
                    for (var m = 0; m < children.length; m++) {
                        var childObj = children[m];
                        if (childObj.isLineEnd)
                            childObj.element.css("height", maxHeight);
                    }
                }

                for (var i = 0; i < this.options._rows.length; i++) {
                    var children = this.options._rows[i].children;

                    var start = 0;
                    var maxHeight = 0;
                    for (var m = 0; m < children.length; m++) {
                        var childObj = children[m];
                        maxHeight = Math.max(maxHeight, childObj.element.height());
                    }

                    // теперь выставим у всех высоту
                    for (var m = 0; m < children.length; m++) {
                        var childObj = children[m];
                        childObj.element.css("height", maxHeight);
                        childObj.element.children().css("height", maxHeight);
                    }
                }

                item.children(".control-wrapper.empty.padding").height(item.height());

                // найдем лейблы и где необходимо выровняем по левому краю
                for (var i = 0; i < this.options._rows.length; i++) {
                    var children = this.options._rows[i].children;

                    for (var m = 0; m < children.length; m++) {
                        var childObj = children[m];
                        if ((childObj.isLabel && childObj.doNotBreak && childObj.isLineEnd) ||
                            (childObj.isLabel && children.length == 1))
                            childObj.element.find(".control.label").css("text-align", "left");
                        else if (childObj.isLabel)
                            childObj.element.find(".control.label").css("text-align", "");
                    }
                }

                var dEnd = new Date();
                console.log("Длительность пересчета: " + (dEnd - dBegin) + " мСек.");
                if (this.options._isRootFlex){
                    this._trigger("recalculated", null);
                    var that = this;
                    // дадим время браузеру отобразить скролы
                    setTimeout(function() {
                        var newScrolls = parentContent.hasScrollBar();
                        if (scrolls.vertical != newScrolls.vertical && !secondIteration) {
                            $(window).trigger("genetix:resize");
                        }
                    }, 0);
                }
            },

            _deserializeOptions: function() {
                if (!this.options._parentFlex && this.options._parentFlexId)
                    this.options._parentFlex = $("#" + this.options._parentFlexId);
                if (this.options._rows) {
                    for (var i = 0; i < this.options._rows.length; i++) {
                        var row = this.options._rows[i];
                        if (!row.element) {
                            row.element = $("#" + row.id);
                        }

                        for (var j = 0; j < row.children.length; j++) {
                            var child = row.children[j];
                            if (!child.element)
                                child.element = $("#" + child.id);
                        }
                    }
                }
            },

            _extendLineControls: function(rowObj, lastElIdx, curColCount) {
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
                    var emptyChild = this._getObj("EMPTY", rowObj, null, lastElIdx);
                    emptyChild.realColCount = curColCount - tookColCount;
                    emptyChild.isLineEnd = true;
                }
                //if (found)
                children[lastElIdx].isLineEnd = true;
            },

            _getGridParameters: function() {
                var windowWidth = Math.floor(this._getRootRow().element.parent().width() - 1);
                var rootWidth = windowWidth;
                var padding = this.padding() || 0;

                if (padding != 0) {
                    padding = Math.floor(windowWidth * padding / 100);
                    rootWidth = rootWidth - (2 * padding);
                }


                // подсчитаем текущее ко-во колонок
                var curColCount = Math.floor(rootWidth/this.minColWidth());
                curColCount = (curColCount > this.columnsCount() ? this.columnsCount() : curColCount);

                if (curColCount == 0) {
                    curColCount = 1;
                    curColWidth = this.minColWidth();
                } else {
                    var curColWidth = Math.floor(rootWidth / curColCount);
                    if (curColWidth > this.maxColWidth()) {
                        curColWidth = this.maxColWidth();
                        curColCount = Math.floor(rootWidth / curColWidth);
                        //if (windowWidth % this.maxColWidth != 0)
                        //    curColCount++;
                        //curColWidth = Math.floor(windowWidth / curColCount);
                    } else if (curColWidth < this.minColWidth()) {
                        curColWidth = this.minColWidth();
                        curColCount = Math.floor(rootWidth / curColWidth);
                    }
                }
                return {
                    windowWidth: windowWidth,
                    windowOuterWidth: this._getRootRow().element.parent().outerWidth(),
                    curColCount: curColCount,
                    curColWidth: curColWidth,
                    padding: padding,
                    totalWidth: windowWidth
                }
            },
            _getRootRow: function() {
                return (this.options._rows.length > 0 ? this.options._rows[0] : null);
            },

            _getObj: function(curStr, rowObj, el, pos) {
                var elObj = null;
                if (curStr != "EMPTY" && curStr != "PADDING") {
                    var srcStr = curStr.trim();
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
                    el = $(this.options._templates[curStr]);
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
                    el = $(this.options._templates[curStr]);
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
            },

            _refreshScroll: function() {
                if (this._iscroll) {
                    this._iscroll.destroy();
                    this._iscroll = null;
                }

                    var parentDivSel = "#mid_" + this.options._lid;
                    var _iscroll = new IScroll(parentDivSel, {
                        snapStepY: 23,
                        scrollX: false,
                        scrollY: true,
                        bottomPadding: 0,
                        topPadding: 0,
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
                    //_iscroll.on('scroll', function () {
                    //    //gr.data("grid").updatePosition(this.y);
                    //    if (this._grid)
                    //        this._grid.grid("updatePosition", this.y);
                    //});
                    _iscroll.on('scrollStart', function() {
                        $(this.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: 1});
                    });
                    _iscroll.on('scrollEnd', function() {
                        $(this.wrapper).find(".iScrollLoneScrollbar").find(".iScrollIndicator").css({opacity: ""});
                    });
                    this._iscroll = _iscroll;
            },

            minColWidth: function(value) {
                if (value !== undefined)
                    this.options._minColWidth = value;
                return this.options._minColWidth;
            },
            maxColWidth: function(value) {
                if (value !== undefined)
                    this.options._maxColWidth= value;
                return this.options._maxColWidth;
            },
            columnsCount: function(value) {
                if (value !== undefined)
                    this.options._columnsCount = value;
                return this.options._columnsCount;
            },
            padding: function(value) {
                if (value !== undefined)
                    this.options._padding = value;
                return this.options._padding;
            },
            parentFlex: function(value) {
                if (value !== undefined) {
                    this.options._parentFlex = value;
                    this.options._parentFlexId = value.attr("id");
                }
                if (!this.options._parentFlex && this.options._parentFlexId) {
                    this.options._parentFlex = $("#" + this.options._parentFlexId);
                }
                return this.options._parentFlex;
            },
            getLid: function(value) {
                if (value !== undefined)
                    this.options._lid = value;
                return this.options._lid;
            }
        });


    });