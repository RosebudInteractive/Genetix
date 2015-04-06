/**
 * User: kiknadze
 * Date: 27.02.2015
 * Time: 19:38
 */
define(
    "devices",
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/devices.html', "gPopup"],
    function (template, tpl) {
        var templates = template.parseTemplate(tpl);

        var DevicesControl = Class.extend({

            /**
             * Конструктор
             * @param obj - ожъект сессий
             */
            init: function(obj) {
                this._User = obj || null;
                this._tabsPopup = null;
                this._OpenOnDevicePopup = null;
                this._FormsPopup = null;
                this._CurrentRoot = null;
            },

            currentRoot: function (value) {
                if (value !== undefined) this._CurrentRoot = value;
                return this._CurrentRoot;
            },

            /**
             * Проперти сессии. При установке вызывает перерисовку
             * @param user
             */
            sessions: function(user) {
                console.log(user);
                if (user === undefined)
                    return this._User;
                else {
                    this._User = user;
                    this.render();
                }

            },

            render: function() {
                var mainPanel = $(".is-device-wrapper");
                this._renderTabs(mainPanel);
                this._renderDevices(mainPanel);
            },

            /**
             * Вывод устройств
             * @param mainPanel
             * @private
             */
            _renderDevices: function(mainPanel) {
                // если сессии пустые, то все чистим
                if (!(this._User)) {
                    mainPanel.find(".is-device-icon").remove(":not(#tabs-placeholder)");
                    return;
                }

                var sessions = {};
                var curSessionId = uccelloClt.getSessionGuid();
                var sessionsCount = this._User.countChild("Sessions");
                var curSession = null;
                for (var i = 0; i <sessionsCount; i++) {
                    var sessionObj = this._User.getChild(i, "Sessions");
                    sessions[sessionObj.sessionGuid()] = sessionObj;
                    if (sessionObj.sessionGuid() == curSessionId) curSession = sessionObj;
                }


                // разберемся с текущим девайсом
                var curSessionIcon = mainPanel.find("#" + curSessionId);

                if (curSessionIcon.length == 0) {
                    if (curSession.deviceType() == "C")
                        curSessionIcon = $(templates["pc"]).attr("id", curSessionId);
                    else
                        curSessionIcon = $(templates["tablet"]).attr("id", curSessionId);
                    curSessionIcon.find("svg").css({color: curSession.deviceColor()});
                    curSessionIcon.find(".is-device-text").text(curSession.deviceName());
                    mainPanel.append(curSessionIcon);
                }


                // очистим удаленные устройства
                mainPanel.find(".is-device-icon:not(#tabs-placeholder)").each(function (i) {
                    if (!($(this).attr("id") in sessions)) {
                        $(this).find("svg").css({opacity: 0});
                        $(this).find("is-device-text").css({opacity: 0});
                        var that2 = this;
                        setTimeout(function () {
                            $(that2).remove();
                        }, 500);
                    }
                });

                // добавин новые в конец
                for (var id in sessions) {
                    if (id == curSessionId) continue;
                    var session = sessions[id];
                    var existing = mainPanel.find("#" + id);
                    // если элемент не найден, то добавим
                    if (existing.length == 0) {
                        if (session.deviceType() == "C")
                            existing = $(templates["pc"]);
                        else
                            existing = $(templates["tablet"]);
                        existing.attr("id", session.sessionGuid());
                        // сначала спрячем их
                        // а потом прекрасно покажем
                        existing.find("svg").css({opacity: 0});
                        existing.find("is-device-text").css({opacity: 0});
                        mainPanel.append(existing);
                    }
                    existing.find(".is-device-text").text(session.deviceName());

                    function slowShow(el, s) {
                        setTimeout(function() {
                            if (s.countChild("Connects") != 0) {
                                el.find("svg").css({color: s.deviceColor(), opacity: "1"});
                                el.find(".is-device-text").css({opacity: "1"});
                            }
                            else {
                                el.find("svg").css({color: "#ffffff", opacity: "0.8"});
                                el.find(".is-device-text").css({opacity: "0.8"});
                            }
                        }, 0);
                    }

                    slowShow(existing, session);


                }

                /* перемещение будет с задержкой, чтобы не мешать анимации */
                setTimeout(function() {
                    // переместим неактивные в конец
                    for (var id in sessions) {
                        if (id == curSessionId) continue;
                        var session = sessions[id];
                        if (session.countChild("Connects") != 0) continue;
                        var existing = mainPanel.find("#" + id);
                        existing.appendTo(mainPanel);
                    }
                }, 500);
            },

            /**
             * Вывод верхней кнопки
             * @param mainPanel - панел, куда выводить
             * @private
             */
            _renderTabs: function(mainPanel) {
                if ($("#tabs-placeholder").length == 0) {
                    var that = this;
                    var tabsIcon = $(templates['tabs']).attr('id', 'tabs-placeholder');
                    mainPanel.append(tabsIcon);
                    this._tabsIcon = tabsIcon;
                    var popupDiv = $("<div></div>");
                    $("body").append(popupDiv);
                    this._tabsPopup = popupDiv.genetixPopup({
                        buttonControl: this._tabsIcon,
                        offsetX: 26,
                        click: function (event, data) {
                            var currContext = data.custom.dbGuid;
                            var vc = data.custom.contextGuid;
                            var formGuid = data.custom.formGuid;
                            that._selectContext({masterGuid: currContext, vc:vc,  side: "server", formGuid: formGuid});
                        },
                        righticonclick: function (event, data) {
                            if (data.data.custom.type == "context") {
                                if (that._FormsPopup) {
                                    $("#forms-popup-div").remove();
                                    that._FormsPopup = null;
                                }
                                var formsPopupDiv = $("<div id='forms-popup-div'></div>");
                                popupDiv.append(formsPopupDiv);
                                that._FormsPopup = formsPopupDiv.genetixPopup({
                                    buttonControl: data.button,
                                    title: null,
                                    offsetX: -49,
                                    offsetY: -105,
                                    leftIcons: true,
                                    rightIcons: true,
                                    click: function (event, data2) {
                                        if (data2.custom.type == "form") {
                                            var currContext = data2.custom.dbGuid;
                                            var vc = data2.custom.contextGuid;
                                            var formGuid = data2.custom.formGuid;
                                            that._selectContext({masterGuid: currContext, vc: vc, side: "server", formGuid: formGuid});
                                        } else {
                                            that._openOnDevice(data2);
                                        }
                                    },
                                    righticonclick: function (event, data) {
                                        that._showDevicesPopup(data, formsPopupDiv, -40, -143);
                                    },
                                    hide: function () {
                                        popupDiv.find(".dropdown-menu-item2-b").find(".right-icon").removeClass("is-pressed");
                                    }
                                });

                                var formsData = that._prepareFormsData(data);
                                that._FormsPopup.genetixPopup("show", formsData, data.button);
                            } else
                                that._showDevicesPopup(data, popupDiv);
                        }
                    });


                    tabsIcon.click(function () {
                        var popupData = that._preparePopupData();
                        that._tabsPopup.genetixPopup("show", popupData, null, url("#database"));
                    });
                }
            },

            _showDevicesPopup: function(data, popupDiv, ox, oy) {
                var offsetX = ox || -49;
                var offsetY = oy || -105;
                var that = this;
                if (that._OpenOnDevicePopup) {
                    that._OpenOnDevicePopup = null;
                    $("#open-on-device").remove();
                }

                var devPopupDiv = $("<div id='open-on-device'></div>");
                popupDiv.append(devPopupDiv);
                that._OpenOnDevicePopup = devPopupDiv.genetixPopup({
                    buttonControl: data.button,
                    title: "Open on device",
                    offsetX: offsetX,
                    offsetY: offsetY,
                    leftIcons: true,
                    rightIcons: false,
                    click: function (event, data2) {
                        that._openOnDevice(data2);
                    },
                    hide: function () {
                        popupDiv.find(".dropdown-menu-item2-b").find(".right-icon").removeClass("is-pressed");
                    }
                });
                var oodData = that._prepareOODData(data);
                that._OpenOnDevicePopup.genetixPopup("show", oodData, data.button);
            },

            _openOnDevice: function (data) {
                var formGuids = data.custom.parent.data.custom.formGuid || 'all';
                if (formGuids != 'all') formGuids = [formGuids];
                uccelloClt.getClient().newTab(
                    data.custom.parent.data.custom.contextGuid,
                    data.custom.parent.data.custom.dbGuid,
                    formGuids,
                    data.custom.sessionId
                );
            },

            _prepareOODData: function(parentData, prefix) {
                prefix = prefix || "OODpopup";
                var that = this;
                if (!(this._User)) return;
                var contexts = [];

                var sessions = {};
                var curSessionId = uccelloClt.getSessionGuid();
                var sessionsCount = this._User.countChild("Sessions");
                var curSession = null;
                for (var i = 0; i <sessionsCount; i++) {
                    var sessionObj = this._User.getChild(i, "Sessions");
                    sessions[sessionObj.sessionGuid()] = sessionObj;
                    if (sessionObj.sessionGuid() == curSessionId) curSession = sessionObj;
                }


                // разберемся с текущим девайсом
                var cnt = {
                    id: prefix + "-" + curSessionId,
                    title: curSession.deviceName(),
                    subTree: [],
                    leftIcon: (curSession.deviceType() == "C" ? "/images/Genetix.svg#pc" : "/images/Genetix.svg#tablet"),
                    leftIconColor: curSession.deviceColor(),
                    custom: {
                        type: "device",
                        sessionId: curSessionId,
                        parent: parentData
                    }
                };
                contexts.push(cnt);

                // добавин новые в конец
                for (var id in sessions) {
                    if (id == curSessionId) continue;
                    var session = sessions[id];
                    if (session.countChild("Connects") == 0) continue;
                    var cnt = {
                        id:  prefix + "-" + session.sessionGuid(),
                        title: session.deviceName(),
                        subTree: [],
                        leftIcon: (session.deviceType() == "C" ? "/images/Genetix.svg#pc" : "/images/Genetix.svg#tablet"),
                        leftIconColor: session.deviceColor(),
                        custom: {
                            type: "device",
                            sessionId: session.sessionGuid(),
                            parent: parentData
                        }
                    };
                    contexts.push(cnt);
                }

                return contexts;
            },

            _prepareFormsData: function(parentData) {
                var contextGuid = parentData.data.custom.contextGuid;
                var context = uccelloClt.getSysCM().getByGuid(contextGuid);
                var result = [];
                var contGuid = context.contextGuid();

                for (var f = 0, len5 = context.countChild("Resources"); f < len5; f++) {
                    var resource = context.getChild(f, "Resources");
                    var cnt2 = {
                        id: "OpenFrm-" + resource.resGuid(),
                        title: resource.title(),
                        subTree: [],
                        rightIcon: "/images/controls.svg#hamburger",
                        custom: {
                            type: "form",
                            contextGuid: contGuid,
                            dbGuid: context.dataBase(),
                            formGuid: resource.resGuid()
                        }
                    };
                    result.push(cnt2);
                }

                if (result.length != 0)
                    result.push({
                        type: "separator"
                    });

                var devArray = this._prepareOODData(parentData, "frmOOD");
                result = result.concat(devArray);

                return result;
            },

            /**
             * Вызвращает данные для всплывающего меню устройств
             * @private
             */
            _preparePopupData: function() {
                var contexts = [];
                for (var i = 0, len = uccelloClt.getSysDB().countRoot(); i < len; i++) {
                    var root = uccelloClt.getSysDB().getRoot(i);
                    var obj = root.obj;
                    for (var j = 0, len2 = obj.countCol(); j < len2; j++) {
                        var col = obj.getCol(j);
                        var name = col.getName();
                        if (name == "VisualContext") {
                            for (var k = 0, len3 = col.count(); k < len3; k++) {
                                var item = col.get(k);
                                var contGuid = item.get('ContextGuid');

                                var formGuid = null;
                                //if (contGuid == url("#context"))
                                //    formGuid = this._CurrentRoot;
                                //else
                                if (item.getCol("Resources").count() != 0) {
                                    var resource = item.getCol("Resources").get(0);
                                    formGuid = resource.get("ResGuid");
                                }


                                var cnt = {
                                    id: item.get('DataBase'),
                                    title: item.get('Name'),
                                    subTree: [],
                                    rightIcon: "/images/controls.svg#hamburger",
                                    custom: {
                                        type: "context",
                                        contextGuid: contGuid,
                                        dbGuid: item.get('DataBase'),
                                        formGuid:  formGuid
                                    }
                                };
                                contexts.push(cnt);

                                if (url("#context") == contGuid) {
                                    var rootForm = uccelloClt.getContextCM().getByGuid(this._CurrentRoot);
                                    for (var f = 0, len5 = rootForm.countChild("SubForms"); f < len5; f++) {
                                        var subFrmItem = rootForm.getChild(f, "SubForms");

                                        var cnt2 = {
                                            id: "SubFrm-" + item.get('DataBase'),
                                            title: subFrmItem.name(),
                                            subTree: [],
                                            rightIcon: "/images/controls.svg#hamburger",
                                            custom: {
                                                type: "sub-form",
                                                contextGuid: contGuid,
                                                dbGuid: item.get('DataBase'),
                                                formGuid: subFrmItem.formGuid()
                                            }
                                        };
                                        cnt.subTree.push(cnt2);
                                    }
                                }
                            }


                            return contexts;
                        }
                    }
                }

                return contexts;
            },
            _selectContext: function(params) {
                $("#root-form-container").empty();
                var that = this;

                var formGuids = 'all';
                //if (params.vc == url("#context")) {
                 if (params.formGuid) formGuids = [params.formGuid];
                //}

                if (formGuids == null || formGuids == 'all') {
                    // запросить гуиды рутов
                    uccelloClt.getClient().socket.send({action:"getRootGuids", db:params.masterGuid, rootKind:'res', type:'method', formGuids:formGuids}, function(result) {
                        that.rootsGuids = result.roots;
                        uccelloClt.setContext(params, function(result) {
                            that._setContextUrl(params.vc, formGuids);
                        }, function() { return that._renderRoot() });
                    });
                } else {
                    that.rootsGuids = formGuids;
                    params.formGuids = formGuids;
                    uccelloClt.setContext(params, function(result) {
                        uccelloClt.getClient().socket.send({action:"getRootGuids", db:params.masterGuid, rootKind:'res', type:'method', formGuids:formGuids}, function(result2) {
                            var newFormGuids = [];
                            for(var i in formGuids) {
                                var found = false;
                                for(var j in result2.roots) {
                                    if (result2.roots[j] == formGuids[i])
                                        found = true;
                                }
                                if (!found)
                                    newFormGuids.push(formGuids[i]);
                            }
                            if (newFormGuids.length > 0)
                                uccelloClt.createRoot(newFormGuids, "res");
                        });
                        that._setContextUrl(params.vc, formGuids);
                    }, function() { return that._renderRoot() });
                }
            },
            _setAutoSendDeltas: function() {
                var cm = uccelloClt.getContextCM(currRoot);
                if (cm)
                    cm.autoSendDeltas(true);
            },

            _setContextUrl: function(context, formGuids) {
                if (typeof formGuids == "string")
                    formGuids = [formGuids];
                if (formGuids[0] != "all")
                    this._CurrentRoot = formGuids[0];
                window.isHashchange = false;
                document.location = this._getContextUrl(context, formGuids);
            },

            _getContextUrl: function(context, formGuids) {
                var location = document.location.href;
                location = location.replace(/#.*/, '');
                formGuids = !formGuids || formGuids=='all'?'all':formGuids;
                if (formGuids !='all' && typeof formGuids == "string") formGuids = [formGuids];
                return location+'#context='+context+'&formGuids='+(!formGuids || formGuids=='all'?'all':formGuids.join(','))
            },

            /**
             * Рендер переключателя рута
             * @param rootGuid {string}
             * @returns {object}
             */
            _renderRoot: function(rootGuid){
                this.currentRoot(rootGuid);
                return {rootContainer: "#root-form-container"};
            }
        });

        return DevicesControl;
    }
);