/**
 * Created by kiknadze on 14.03.2016.
 */

define(
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/formDesigner.html'
        , '/scripts/controls/simpleview/vbase.js'],
    function(template, tpl, Base) {
        var KEYCODE_ESC = 27;
        var vDesigner = {};
        var ToolbarModes = { pointer: 0, vertical: 1, horizontal: 2, layer: 3, control: 4, existingControl: 5, layout: 6, changeLayout: 7};
        var MARGIN_TOP = 20;
        var MARGIN_BUT = 7;
        var MARGIN_SIDE = 7;
        var autoHeight = 150;
        for (var i in Base)
            vDesigner[i] = Base[i];

        vDesigner._templates = template.parseTemplate(tpl);
        vDesigner.render = function(options) {
            var that = this;
            var item = $('#' + this.getLid());
            var cont = null;
            if (item.length == 0) {
                that._toolbarMode = ToolbarModes.pointer;
                this._renderInfo = {};
                // обйъект контенера
                var pItem = $(vDesigner._templates['container']).attr('id', "mid_" + this.getLid());
                item = pItem.children(".control").attr('id', this.getLid());
                // добавляем в парент
                var parent = this.getParentComp()? '#ch_' + this.getLid(): options.rootContainer;
                $(parent).append(pItem);
                cont = item.children(".c-content");
                cont.attr("tabIndex", "1");

                pItem.height($(parent).height());
                this._snap = Snap(cont.find("svg")[0]);
                this._global = this._snap.group();
                cont.bind("keydown", function(e) {
                    vDesigner._onKeyPress.call(that, e);
                });

                vDesigner._setToolbarEvents.call(this);

                var pComp = that.getParentComp();
                var children = pComp.getCol("Children");
                /*if (!that._getModel()) {
                    setTimeout(function() {
                        that.getControlMgr().userEventHandler(that, function () {
                            var db = that.getDB();
                            var sObj = JSON.parse(vDesigner._templates["model"]);
                            var newObj = sObj;
                            var colName = "Children";
                            var p = {
                                colName: colName,
                                obj: pComp
                            };

                            var resObj = db.deserialize(sObj, p, db.pvt.defaultCompCallback);

                            // Логгируем добавление поддерева
                            var mg = pComp.getGuid();
                            var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                            pComp.getLog().add(o);
                            pComp.logColModif("add", colName, resObj);
                            that.getControlMgr().allDataInit(resObj);
                            pComp._isRendered(false);
                        });
                    }, 0);
                }*/

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

            if (this.height() == "auto")
                item.css({height: "auto"});

            if (this.getParentComp() && !this.getParentComp().getParentComp()) {
                if (this.getParentComp().isCentered() === undefined || !this.getParentComp().isCentered()) {
                    var cont2 = item.children(".c-content");
                    cont2.css("padding", "0");
                }
                item.addClass("m-container")
            }

            // создаем врапперы для разметок
            var curLayout = this.currentLayout();
            vDesigner._renderLayout.call(this, curLayout);

            $(window).on("genetix:resize", function () {
                var p = that.getParentComp()? '#ch_' + that.getLid(): options.rootContainer;
                $(p).css("height", "");
                $(p).css("height", $(p).parent().height());
                var pp = $("#mid_" + that.getLid());
                pp.css("height", "");
                pp.css("height", $(p).height());

                vDesigner._renderLayout.call(that, that.currentLayout());
            });
            vDesigner._setVisible.call(this);
            vDesigner._genEventsForParent.call(this);
            var layout = this.currentLayout();
            vDesigner._handleResize.call(this, layout);
            vDesigner._renderPropEditor.call(this);
            vDesigner._renderToolbar.call(this);

            for (var i in this._renderInfo) {
                var info = this._renderInfo[i];
                if (!vDesigner._isInCurrentLayout.call(this, info.control ? info.control : info.layout)) {
                    info.group.remove();
                    delete this._renderInfo[i];
                }
            }

            var cont2 = item.children(".c-content").children(".gen-form").children(".control.v-container.container").children(".c-content");
            var childs = this.getCol('Children');
            for(var i=0; i<childs.count();i++) {
                var child = this.getControlMgr().get(childs.get(i).getGuid());
                if (!child.left) continue;
                var div = $('#ext_'+child.getLid());
                if (div.length == 0) {
                    div = $('<div class="control-wrapper"><div class="control-separator"/><div class="mid-wrapper"></div></div>').attr('id', 'ext_' + child.getLid());
                    div.children(".mid-wrapper").attr('id', 'ch_' + child.getLid());
                    cont2.append(div);
                    div.on("genetix:childPropChanged", function(event, data) {
                        vContainer.handleChildChanged.call(that, event, data);
                        return false;
                    });
                }

                div.css({width: "100%", height: "100%"});
            }

            // убираем удаленные объекты
            var del = this.getLogCol('Children') && 'del' in this.getLogCol('Children')? this.getLogCol('Children').del: {};
            for (var guid in del)
                $('#ext_' + del[guid].getLid()).remove();
        };

        vDesigner._renderToolbar = function() {
            var item = $("#" + this.getLid());
            var sel = item.children(".designer-toolbar").children("[role='existingControls']").find("select");
            var curControlLid = sel.val();
            var found = false;
            sel.empty();

            var controls = this.getCol("Controls");
            for (var i = 0; i < controls.count(); i++) {
                var control = controls.get(i);
                if (!vDesigner._isInCurrentLayout.call(this, control)) {
                    var opt = $("<option value='" + control.getGuid() + "'>" + control.resElemName() + "</option>");
                    sel.append(opt);
                    if (control.getLid() == curControlLid) found = true;
                }

            }

            if (found) sel.val(curControlLid);

            sel = item.children(".designer-toolbar").find("[role='changeLayout']").find("select");
            sel.empty();

            var opt = $("<option value='-1'>(Нет)</option>");
            sel.append(opt);
            var layouts = this.getCol("Layouts");
            for (var i = 0; i < layouts.count(); i++) {
                var layout = layouts.get(i);
                opt = $("<option value='" + layout.getGuid() + "'>" + layout.resElemName() + "</option>");
                sel.append(opt);
            }

            sel.val(this.currentLayout() ? this.currentLayout().getGuid() : "-1");
        }

        vDesigner._isInCurrentLayout = function(control) {
            if (!this.currentLayout()) return false;
            var info = this._renderInfo[control.getLid()];
            if (!info) return false;
            var colName = control.pvt.colName;
            var p = control.getParentComp();
            if (p.getCol(colName).indexOf(control) === undefined) return false;
            if (info.control) return vDesigner._layoutHasRefOn.call(this, this.currentLayout(), control);
            else {
                var l = info.layout;
                while (l.getParentComp() != this)
                    l = l.getParentComp();
                return l == this.currentLayout();
            }
        }

        vDesigner._layoutHasRefOn = function(layout, control) {
            if (layout.control() == control) return true;
            else {
                var col = layout.getCol("Layouts");
                var res = false;
                for (var i = 0; i < col.count(); i++) {
                    var l = col.get(i);
                    var res = vDesigner._layoutHasRefOn.call(this, l, control);
                    if (res) break;
                }
                return res;
            }
        }

        vDesigner._setToolbarEvents = function() {
            var item = $("#" + this.getLid());
            var that = this;
            item.children(".designer-toolbar").find(".button").click(function() {
                if ($(this).attr("role") == "layout") {
                    var dir = "vertical";
                    var newGuid = Utils.guid();
                    var sObj = {
                        "$sys": {
                            "guid": newGuid,
                            "typeGuid": UCCELLO_CONFIG.classGuids.Layout
                        },
                        "fields": {
                            "Id": newGuid,
                            "Name": newGuid,
                            "Width": "100%",
                            "Height": "100%",
                            "ResElemName": newGuid,
                            "Direction": dir
                        }
                    };

                    var colName = "Layouts";
                    var parent = {
                        colName: colName,
                        obj: that
                    };
                    var mg = that.getGuid();

                    that.getControlMgr().userEventHandler(that, function () {
                        var db = that.getDB();
                        var resObj = db.deserialize(sObj, parent, db.pvt.defaultCompCallback);

                        // Логгируем добавление поддерева
                        var newObj = sObj;
                        var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                        that.getLog().add(o);
                        that.logColModif("add", colName, resObj);
                        that.currentLayout(resObj);
                        that._isRendered(false);
                    });

                } else if ($(this).attr("role") == "refresh") {
                    that.getControlMgr().userEventHandler(that, function () {
                        that.generateFrom();
                        that._isRendered(false);
                    });
                } else if ($(this).attr("role") == "load-model") {
                    if (!that._getModel()) {
                        var pComp = that.getParentComp();
                        that.getControlMgr().userEventHandler(that, function () {
                            var db = that.getDB();
                            var sObj = JSON.parse(vDesigner._templates["model"]);
                            var newObj = sObj;
                            var colName = "Children";
                            var p = {
                                colName: colName,
                                obj: pComp
                            };

                            var resObj = db.deserialize(sObj, p, db.pvt.defaultCompCallback);

                            // Логгируем добавление поддерева
                            var mg = pComp.getGuid();
                            var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                            pComp.getLog().add(o);
                            pComp.logColModif("add", colName, resObj);
                            that.getControlMgr().allDataInit(resObj);
                            pComp._isRendered(false);
                        });
                    }
                } else if ($(this).attr("role") != "delete") {
                    var toolbar = $(this).parent();
                    var active = true;
                    if ($(this).hasClass("active")) {
                        active = false;
                        that._toolbarMode = ToolbarModes.pointer;
                    }

                    if (active) {
                        toolbar.children().each(function () {
                            $(this).removeClass("active");
                        });
                        $(this).addClass("active");
                        that._toolbarMode = ToolbarModes[$(this).attr("role")];
                    } else
                        $(this).removeClass("active");
                } else if (that.cursor()) {
                    var cur = that.cursor();
                    var info = that._renderInfo[cur.getLid()];
                    if (info.control) {
                        that.getControlMgr().userEventHandler(that, function () {
                            info.layout.control(null);
                            that.cursor(info.layout);
                            //info.group.remove();
                            //delete that._renderInfo[cur.getLid()];
                            that._isRendered(false);
                        });
                    } else {
                        that.getControlMgr().userEventHandler(that, function () {
                            var par = info.layout.getParentComp();
                            var col = par.getCol("Layouts");
                            col._del(info.layout);
                            if (info.layout == that.currentLayout()) {
                                that.currentLayout(null);
                                that.cursor(null);
                            } else {
                                var par = info.layout.getParentComp();
                                that.cursor(par);
                            }
                            //info.group.remove();
                            //delete that._renderInfo[info.layout.getLid()];
                            that._isRendered(false);
                        });
                    }
                }
            });

            item.children(".designer-toolbar").find("[role='changeLayout']").find("select").change(function() {
                var val = $(this).val();
                that.getControlMgr().userEventHandler(that, function () {
                    that.currentLayout(val == -1 ? null : val);
                    that.cursor(null);
                    that._isRendered(false);
                });
            });
        };

        vDesigner._onKeyPress = function(e) {
            if (e.which == KEYCODE_ESC) {
                if (this.cursor()) {
                    var curLayout = this.cursor();
                    var parent = curLayout.getParentComp();
                    if (parent != this)
                        vDesigner._moveCursor.call(this, this._renderInfo[parent.getLid()]);
                    e.preventDefault();
                    return false;
                }
            }
        };

        vDesigner._renderLayout = function(layout) {
            if (!layout) return;
            var info = this._renderInfo[layout.getLid()];
            var parentGrp = this._global;
            var pComp = layout.getParentComp();
            if (pComp != this) parentGrp = this._renderInfo[pComp.getLid()].group;
            if (!info) {
                info = {};
                this._renderInfo[layout.getLid()] = info;
                info.group = this._snap.group();
                info.group.attr({id: layout.getLid()});
                info.invisible = this._snap.rect();
                info.invisible.addClass("invisible");
                info.border = this._snap.rect();
                info.border.addClass("border");
                info.label = this._snap.text(MARGIN_SIDE, MARGIN_TOP - 5, "");
                info.label.addClass("layer-header-text").addClass("black");
                info.group.add(info.border, info.label, info.invisible);
                info.layout = layout;
                parentGrp.add(info.group);

                vDesigner._setEvents.call(this, info);
            }

            info.label.attr({text: layout.resElemName()});
            var dims = vDesigner._getLayoutDimensions.call(this, layout);
            info.dim = dims;

            info.group.attr({
                transform: "translate(" + dims.x + "," + dims.y + ")"
            });
            info.border.attr({width: dims.w, height: dims.h});
            info.invisible.attr({width: dims.w, height: dims.h});

            if (this.cursor() == layout) info.group.addClass("cursor");
            else info.group.removeClass("cursor");

            // если парент слоенный, то показываем только текущую закладку
            if (pComp != this && pComp.direction() == "layer") {
                var tabNum = pComp.tabNumber();
                var col = pComp.getCol("Layouts");
                if (col.indexOf(layout) == tabNum || (!tabNum && col.indexOf(layout) == 0)) {
                    info.group.attr({display: ""});
                } else {
                    info.group.attr({display: "none"});
                }
            }


            if (layout.control()) {
                vDesigner._renderControl.call(this, layout);
            } else {
                var children = layout.getCol('Layouts');
                for (var i = 0; i < children.count(); i++) {
                    var child = children.get(i);
                    vDesigner._renderLayout.call(this, child)
                }
            }

            // если разметка слоенная, то поверх разметок рисуем табы
            if (layout.direction() == "layer") {
                if (!info.tabs) {
                    info.tabs = {};
                    info.tabs.group = this._snap.group();
                    info.tabs.headers = {};
                    info.group.add(info.tabs.group);
                }

                var layouts = layout.getCol("Layouts");
                for (var i = 0; i < layouts.count(); i++) {
                    var l = layouts.get(i);
                    var header = info.tabs.headers[l.getGuid()];
                    if (!header) {
                        header = {};
                        info.tabs.headers[l.getGuid()] = header;
                        header.rect = this._snap.rect(i * 20, y = 0, 20, 20);
                        header.rect.addClass("layer-header");
                        header.text = this._snap.text(6 + i * 20, 15, i);
                        header.text.addClass("layer-header-text");
                        header.invisible = this._snap.rect(i * 20, y = 0, 20, 20);
                        header.invisible.addClass("invisible");
                        info.tabs.group.add(header.rect, header.text, header.invisible);

                        vDesigner._setTabHeaderEvent.call(this, info, l);
                    }
                    if (layout.tabNumber() == i || (!layout.tabNumber() && i == 0)) header.rect.addClass("active");
                    else header.rect.removeClass("active");
                    header.text.attr({text: i});
                }

                for (var it in info.tabs.headers) {
                    if (layouts.indexOfGuid(it) === undefined) {
                        var header = info.tabs.headers[it];
                        header.rect.remove();
                        header.text.remove();
                        header.invisible.remove();
                    }
                }

                var bb = info.tabs.group.getBBox();
                var bbP = info.group.getBBox();

                info.tabs.group.attr({
                    transform: "translate(" + (bbP.width - bb.width) + ", 0)"
                });
            } else if (info.tabs) {
                info.tabs.group.remove();
                delete info.tabs;
            }

        };

        vDesigner._setTabHeaderEvent = function(info, layout) {
            var that = this;
            var header = info.tabs.headers[layout.getGuid()];
            header.invisible.click(function () {
                that.getControlMgr().userEventHandler(that, function () {
                    var col = info.layout.getCol("Layouts");
                    var i = col.indexOf(layout);
                    info.layout.tabNumber(i);
                    that._isRendered(false);
                });
            });
        }

        vDesigner._renderControl = function(layout) {
            var control = layout.control();
            if (!control) return;
            var info = this._renderInfo[control.getLid()];
            if (!info) {
                info = {};
                info.group = this._snap.group();
                info.group.attr({id: control.getLid()});
                info.invisible = this._snap.rect();
                info.invisible.addClass("invisible");
                info.border = this._snap.rect();
                info.border.addClass("border");
                info.icon = this._snap.image("/images/form-32.png", 0, 0, 32, 32, null);
                info.group.add(info.border, info.icon, info.invisible);
                info.layout = layout;
                info.control = control;
                var parentGrp = this._renderInfo[layout.getLid()].group;
                parentGrp.add(info.group);

                this._renderInfo[control.getLid()] = info;
                vDesigner._setControlEvents.call(this, info)
            } else if (info.layout.control() != layout.control()) {
                var lInfo = this._renderInfo[layout.getLid()];
                lInfo.group.add(info.group);
                info.layout = layout;
            }

            var dims = vDesigner._getControlDimensions.call(this, layout);
            info.dim = dims;

            info.group.attr({
                transform: "translate(" + dims.x + "," + dims.y + ")"
            });
            info.border.attr({width: dims.w, height: dims.h});
            info.invisible.attr({width: dims.w, height: dims.h});

            if (this.cursor() == control) info.group.addClass("cursor");
            else info.group.removeClass("cursor");
        };

        vDesigner._setControlEvents = function(info) {
            var control = info.control;
            if (!control) return;

            var that = this;

            info.invisible.click(function(e) {
                vDesigner._moveCursor.call(that, info);

                //e.stopPropagation();
                //e.preventDefault();
                //return false;
            }).mousemove(function(event) {
                if (!that._resizeData) {
                    that._resizeData = {
                        resizeStarted: false,
                        deltaX: 0,
                        deltaY: 0
                    };
                }
            }).mouseout(function (event) {
                if(that._resizeData && !that._resizeData.resizeStarted) {
                    that._resizeData = null;
                }
            }).drag(function (deltaX, deltaY, x, y, event) {
                //event.stopPropagation();
                //event.preventDefault();
                if (!that._resizeData) return false;
                that._resizeData.resizeStarted = true;
                info.group.attr({
                    transform: "translate(" + (info.dim.x + deltaX) + "," + (info.dim.y + deltaY) + ")"
                });
                that._resizeData.deltaX = deltaX;
                that._resizeData.deltaY = deltaY;
                //return false;
            }, function(x, y, event) {
                console.log("Drag start");
                //event.stopPropagation();
                //event.preventDefault();
                //return false;
            }, function (event) {
                console.log("Drag end");
                var p = info.layout;

                info.group.attr({display: "none"});
                var dropEl = Snap.getElementByPoint(event.clientX, event.clientY);
                info.group.attr({display: ""});
                var dropGrp = dropEl.parent();
                var dropLid = dropGrp.attr("id");
                var dropInfo = that._renderInfo[dropLid];
                if (dropInfo.layout != p) {
                    that.getControlMgr().userEventHandler(that, function () {
                        dropInfo.layout.control(info.control);
                        p.control(null);
                        that._isRendered(false);
                    });
                } else
                    that._isRendered(false);

                //event.stopPropagation();
                //event.preventDefault();
                if (!that._resizeData) return;// false;
                that._resizeData = null;
                //return true;
            });

        }

        vDesigner._getControlDimensions = function(layout) {
            var info = this._renderInfo[layout.getLid()];
            var res = {
                x: MARGIN_SIDE, y: MARGIN_TOP,
                w: info.dim.w - MARGIN_SIDE*2,
                h: info.dim.h - (MARGIN_TOP + MARGIN_BUT)
            };
            return res;
        }

        vDesigner._setEvents = function(info) {
            var that = this;
            info.invisible.click(function(e) {
                if (that._toolbarMode == ToolbarModes.pointer) {
                    vDesigner._moveCursor.call(that, info);
                } else {
                    var item = $("#" + that.getLid());
                    var toolbar = item.find(".designer-toolbar");

                    if (that._toolbarMode == ToolbarModes.existingControl) {
                        that.getControlMgr().userEventHandler(that, function () {
                            var item = $("#" + that.getLid());
                            var sel = item.children(".designer-toolbar").children("[role='existingControls']").find("select");
                            var guid = sel.val();
                            info.layout.control(guid);
                            that._isRendered(false);
                        });
                    } else {

                        var cm = that.getControlMgr();
                        var newGuid = Utils.guid();
                        var sObj, parent, colName, mg;
                        if (that._toolbarMode == ToolbarModes.control) {
                            var sel = toolbar.find("[role='controls']").find("select");
                            var ctrlGuid = sel.val();
                            sObj = {
                                "$sys": {
                                    "guid": newGuid,
                                    "typeGuid": UCCELLO_CONFIG.classGuids.DesignerControl
                                },
                                "fields": {
                                    "Id": newGuid,
                                    "Name": newGuid,
                                    "ResElemName": newGuid,
                                    "TypeGuid": ctrlGuid
                                }
                            };

                            colName = "Controls";
                            parent = {
                                colName: colName,
                                obj: that
                            };
                            mg = that.getGuid();
                        } else {
                            var dir;
                            switch (that._toolbarMode) {
                                case ToolbarModes.horizontal:
                                    dir = "horizontal";
                                    break;
                                case ToolbarModes.vertical:
                                    dir = "vertical";
                                    break;
                                case ToolbarModes.layer:
                                    dir = "layer";
                                    break;
                                default:
                                    dir = "vertical";
                            }

                            sObj = {
                                "$sys": {
                                    "guid": newGuid,
                                    "typeGuid": UCCELLO_CONFIG.classGuids.Layout
                                },
                                "fields": {
                                    "Id": newGuid,
                                    "Name": newGuid,
                                    "Width": "100%",
                                    "Height": "100%",
                                    "ResElemName": newGuid,
                                    "Direction": dir
                                }
                            };

                            colName = "Layouts";
                            if (e.ctrlKey && info.layout.getParentComp() != that) {
                                parent = {
                                    colName: colName,
                                    obj: info.layout.getParentComp()
                                };
                                mg = info.layout.getParentComp().getGuid();
                            } else {
                                parent = {
                                    colName: colName,
                                    obj: info.layout
                                };
                                mg = info.layout.getGuid();
                            }
                        }

                        that.getControlMgr().userEventHandler(that, function () {
                            var db = info.layout.getDB();
                            var resObj = db.deserialize(sObj, parent, db.pvt.defaultCompCallback);

                            // Логгируем добавление поддерева
                            var newObj = sObj;
                            var o = {adObj: newObj, obj: resObj, colName: colName, guid: mg, type: "add"};
                            info.layout.getLog().add(o);
                            info.layout.logColModif("add", colName, resObj);

                            if (that._toolbarMode == ToolbarModes.control) {
                                info.layout.control(resObj);
                            }

                            that._isRendered(false);
                        });

                    }
                    toolbar.children().each(function() {
                        $(this).removeClass("active");
                    });
                    that._toolbarMode = ToolbarModes.pointer;

                }
                //e.stopPropagation();
                //e.preventDefault();
                //return false;
            }).mousemove(function(event) {
                if (!that._resizeData) {
                    that._resizeData = {
                        resizeStarted: false,
                        deltaX: 0,
                        deltaY: 0
                    };
                }
            }).mouseout(function (event) {
                if(that._resizeData && !that._resizeData.resizeStarted) {
                    that._resizeData = null;
                }
            }).drag(function (deltaX, deltaY, x, y, event) {
                //event.stopPropagation();
                //event.preventDefault();
                if (!that._resizeData) return false;
                that._resizeData.resizeStarted = true;
                console.log("Drag");
                info.group.attr({
                    transform: "translate(" + (info.dim.x + deltaX) + "," + (info.dim.y + deltaY) + ")"
                });
                that._resizeData.deltaX = deltaX;
                that._resizeData.deltaY = deltaY;
                //return false;
            }, function(x, y, event) {
                console.log("Drag start");
                //event.stopPropagation();
                //event.preventDefault();
                //return false;
            }, function (event) {
                console.log("Drag end");
                var p = info.layout.getParentComp();

                if (p == that) {
                    that.getControlMgr().userEventHandler(that, function () {
                        that._isRendered(false);
                    });
                    //return false;
                } else {
                    info.group.attr({display: "none"});
                    var dropEl = Snap.getElementByPoint(event.clientX, event.clientY);
                    info.group.attr({display: ""});
                    var dropGrp = dropEl.parent();
                    var dropLid = dropGrp.attr("id");
                    var dropInfo = that._renderInfo[dropLid];
                    if (event.ctrlKey && dropInfo.layout.getParentComp() != that && !dropInfo.control) {
                        dropLid = dropInfo.layout.getParentComp().getLid();
                        dropInfo = that._renderInfo[dropLid];
                    }

                    if (dropInfo.layout != p && !dropInfo.control) {
                        that.getControlMgr().userEventHandler(that, function () {
                            var db = info.layout.getDB();
                            var ser = db.serialize(info.layout);
                            p.getCol("Layouts")._del(info.layout);
                            //delete that._renderInfo[info.layout.getLid()];
                            //info.invisible.unclick().unmousemove().unmouseout().undrag();
                            //info.group.remove();

                            var resObj = db.deserialize(ser, {
                                colName: "Layouts",
                                obj: dropInfo.layout
                            }, db.pvt.defaultCompCallback);

                            // Логгируем добавление поддерева
                            var mg = dropInfo.layout.getGuid();
                            var newObj = ser;
                            var o = { adObj: newObj, obj: resObj, colName: "Layouts", guid: mg, type: "add" };
                            dropInfo.layout.getLog().add(o);
                            dropInfo.layout.logColModif("add", "Layouts", resObj);

                            that._isRendered(false);
                        });
                    } else
                        that._isRendered(false);
                }

                //event.stopPropagation();
                //event.preventDefault();
                if (!that._resizeData) return;// false;
                that._resizeData = null;
                //return true;
            });
        }

        vDesigner._moveCursor = function (info) {
            var that = this;
            that.getControlMgr().userEventHandler(that, function () {
                if (that.cursor()) {
                    var oldInfo = that._renderInfo[that.cursor().getLid()];
                    if (oldInfo)
                        oldInfo.group.removeClass("cursor");
                }

                that.cursor(info.control ? info.control : info.layout);
                info.group.addClass("cursor");
            });
        }

        vDesigner._renderPropEditor = function() {
            var that = this;
            var changeHandler = function(obj, funcName, inpt) {
                return function (e) {
                    that.getControlMgr().userEventHandler(that, function () {
                        var value = inpt.val();
                        obj[funcName](value);
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    });
                }
            }
            var item = $("#" + this.getLid());
            var tbl = item.find(".prop-edit-body").find("table");
            var tb = tbl.find("tbody");
            tb.empty();
            if (this.cursor()) {
                var curr = this.cursor();
                var tmpl = vDesigner._templates["property"];
                var propNames = curr.pvt.objType.pvt.fieldsArr;
                for (var i = 0; i < propNames.length; i++) {
                    var propName = propNames[i];
                    var funcName = propName.charAt(0).toLowerCase() + propName.slice(1);
                    var val = curr[funcName]();
                    var tr = $(tmpl);
                    tr.find(".name").text(propName);
                    var inpt = tr.find(".value").find("input");
                    inpt.val(val);
                    tb.append(tr);
                    $.data(inpt[0], "propName", propName);
                    inpt.change(changeHandler(this.cursor(), funcName, inpt));
                }
            }
        }

        vDesigner._getLayoutDimensions = function(layout) {
            var pComp = layout.getParentComp();
            var result = {};
            if (pComp == this) {
                result.x = 0;
                result.y = 0;

                var item = $("#" + this.getLid());
                var cont = item.children(".c-content").children(".designer-content");

                result.w = cont[0].clientWidth;
                result.h = cont[0].clientHeight;
            } else {
                var takedSize = 0;
                var r = this._renderInfo[pComp.getLid()];
                var pDims = r.dim;
                var pDir = pComp.direction();
                if (pDir == "layer") {
                    result.x = MARGIN_SIDE;
                    result.y = MARGIN_TOP;
                    result.w = pDims.w - MARGIN_SIDE*2;
                    result.h = pDims.h - (MARGIN_TOP + MARGIN_BUT);
                } else {
                    var allSize = pDims.w;
                    var sizeName = pDir == "vertical" ? "height" : "width";
                    if (pDir == "vertical") allSize = pDims.h;
                    var lSize = layout[sizeName]() || 0;
                    if (lSize == "auto") lSize = autoHeight;
                    var siblings = pComp.getCol("Layouts");
                    if ($.isNumeric(lSize) || String(lSize).indexOf("px") >= 0) {
                        if (String(lSize).indexOf("px") >= 0) lSize = lSize.replace("px", "");
                        if (pDir == "vertical") {
                            result.x = MARGIN_SIDE;
                            result.y = MARGIN_TOP;
                            result.h = +lSize - (MARGIN_TOP + MARGIN_BUT);
                            result.w = pDims.w - MARGIN_SIDE*2;
                        } else {
                            result.x = MARGIN_SIDE;
                            result.y = MARGIN_TOP;
                            result.w = +lSize -  MARGIN_SIDE*2;
                            result.h = pDims.h - (MARGIN_TOP + MARGIN_BUT);
                        }
                    } else if (String(lSize).indexOf("%") >= 0) {
                        lSize = +(lSize.replace("%", ""));
                        var fixedSize = 0;
                        var percSize = 0;
                        for (var i = 0; i < siblings.count(); i++) {
                            var sib = siblings.get(i);
                            var sibSize = sib[sizeName]() || 0;
                            if (sibSize == "auto") sibSize = autoHeight;
                            if ($.isNumeric(sibSize) || String(sibSize).indexOf("px") >= 0) {
                                if (String(sibSize).indexOf("px") >= 0) sibSize = sibSize.replace("px", "");
                                fixedSize += +sibSize;
                            }  else if (String(sibSize).indexOf("%") >= 0) {
                                sibSize = +(sibSize.replace("%", ""));
                                percSize += sibSize;
                            }
                        }

                        var restSize = allSize - fixedSize;
                        var size;
                        if (restSize <= 0) size = 0;
                        else size = (restSize / percSize) * lSize;
                        if (pDir == "vertical") {
                            result.h = size - (MARGIN_TOP + MARGIN_BUT);
                            result.w = pDims.w - MARGIN_SIDE*2;
                        } else {
                            result.w = size - MARGIN_SIDE*2;
                            result.h = pDims.h - (MARGIN_TOP + MARGIN_BUT);
                        }
                    }
                    for (var i = 0; i < siblings.count(); i ++) {
                        var sib = siblings.get(i);
                        var rSib = this._renderInfo[sib.getLid()];
                        if (sib == layout) break;
                        takedSize += ((pDir == "vertical") ? (rSib.dim.h + MARGIN_TOP + MARGIN_BUT) : (rSib.dim.w + MARGIN_SIDE*2));
                        if (takedSize >= allSize) {
                            takedSize = 0;
                            break;
                        }
                    }

                    if (pDir == "vertical") {
                        result.y = takedSize + MARGIN_TOP;
                        result.x = MARGIN_SIDE;
                        if (result.y + result.h > allSize) result.h = allSize - result.y - (MARGIN_TOP + MARGIN_BUT);
                    } else {
                        result.x = takedSize + MARGIN_SIDE;
                        result.y = MARGIN_TOP;
                        if (result.x + result.w > allSize) result.w = allSize - result.x - MARGIN_SIDE*2;
                    }
                }
            }

            if (result.w < 0) result.w = 0;
            if (result.h < 0) result.h = 0;

            return result;
        }

        /**
         * Оповещение парента об изменениях пропертей
         * @private
         */
        vDesigner._genEventsForParent = function() {
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

            if (genEvent) {
                $('#ext_' + this.getLid()).trigger("genetix:childPropChanged", {
                    control: this,
                    properties: changedFields
                });
            }
        }

        vDesigner._handleResize = function(layout) {
            if (!layout) return;
            var p = '#ch_' + layout.getLid();
            $(p).css("height", "");
            $(p).css("height", $(p).parent().height());
            var pp = $("#mid_" + layout.getLid());
            pp.css("height", "");
            pp.css("height", $(p).height());

            var children = layout.getCol("Layouts");
            for (var i = 0; i < children.count(); i++) {
                var child = children.get(i);
                vDesigner._handleResize.call(this, child);
            }
        }

        return vDesigner;

    }
);
