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
                var that = this;
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
                    if (!($(this).attr("id") in sessions))
                        $(this).remove();
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
                    }
                    if (session.countChild("Connects") != 0)
                        existing.find("svg").css({color: session.deviceColor()});
                    else
                        existing.find("svg").css({color: "#ffffff"});
                    existing.find(".is-device-text").text(session.deviceName());
                    mainPanel.append(existing);
                }

                // клик на девайсы пока что их рефрешит
                $(".is-device-icon.is-device").off().click(function () {
                    var user = uccelloClt.getUser();
                    that.sessions(user);
                });

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
                            var currContext = data.id;
                            var vc = data.custom.contextGuid;
                            var formGuid = data.custom.formGuid;
                            that._selectContext({masterGuid: currContext, vc:vc,  side: "server", formGuid: formGuid});

                        },
                        righticonclick: function (event, data) {
                            if (!that._OpenOnDevicePopup) {
                                var devPopupDiv = $("<div></div>");
                                popupDiv.append(devPopupDiv);
                                that._OpenOnDevicePopup = devPopupDiv.genetixPopup({
                                    buttonControl: data.button,
                                    title: "Открыть на устройстве",
                                    offsetX: -52,
                                    offsetY: 6,
                                    leftIcons: true,
                                    rightIcons: false,
                                    click: function (event, data) {
                                        that._openOnDevice(data);
                                    }
                                });
                            } else {
                                that._OpenOnDevicePopup.genetixPopup("buttonControl", data.button);
                            }
                            var oodData = that._prepareOODData(data);
                            that._OpenOnDevicePopup.genetixPopup("show", oodData);
                        }
                    });


                    tabsIcon.click(function () {
                        var popupData = that._preparePopupData();
                        that._tabsPopup.genetixPopup("show", popupData);
                    });
                }
            },

            _openOnDevice: function (data) {
                var formGuids = 'all';
                uccelloClt.getClient().newTab(data.custom.parent.data.custom.contextGuid, url('#database'), formGuids, data.custom.sessionId);
            },

            _prepareOODData: function(parentData) {
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
                    id: "OODpopup-" + curSessionId,
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
                    var cnt = {
                        id: "OODpopup-" + session.sessionGuid(),
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

                                var cnt = {
                                    id: item.get('DataBase'),
                                    title: item.get('Name'),
                                    subTree: [],
                                    rightIcon: "/images/controls.svg#hamburger",
                                    custom: {
                                        type: "context",
                                        contextGuid: contGuid,
                                        formGuid: (contGuid == url("#context") ? this._CurrentRoot : null)
                                    }
                                };
                                contexts.push(cnt);
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
                if (params.vc == url("#context")) {
                    if (params.formGuid) formGuids = [params.formGuid];
                }

                /*if (url('#formGuids')) {
                    formGuids = url('#formGuids').split(',');
                }  else {
                    // выборочная подписка
                    var selSub = $('#selSub').is(':checked');
                    if (selSub) {
                        formGuids = $('#selForm').val();
                    }
                }*/

                if (formGuids == 'all') {
                    // запросить гуиды рутов
                    uccelloClt.getClient().socket.send({action:"getRootGuids", db:params.masterGuid, rootKind:'res', type:'method', formGuids:formGuids}, function(result) {
                        that.rootsGuids = result.roots;
                        uccelloClt.setContext(params, function(result) {
                            that._setContextUrl(params.vc, params.masterGuid, formGuids);
                            that._setAutoSendDeltas(true);
                        });
                    });
                } else {
                    that.rootsGuids = formGuids;
                    params.formGuids = formGuids;
                    uccelloClt.setContext(params, function(result) {
                        that._setContextUrl(params.vc, params.masterGuid, formGuids);
                        that._setAutoSendDeltas(true);
                    });
                }
            },
            _setAutoSendDeltas: function() {
                var cm = uccelloClt.getContextCM(currRoot);
                if (cm)
                    cm.autoSendDeltas(true);
            },
            _setContextUrl: function(context, database, formGuids) {
                document.location = this._getContextUrl(context, database, formGuids);
            },

            _getContextUrl: function(context, database, formGuids) {
                var location = document.location.href;
                location = location.replace(/#.*/, '');
                return location+'#database='+database+'&context='+context+'&formGuids='+(!formGuids || formGuids=='all'?'all':formGuids.join(','))
            }
        });

        return DevicesControl;
    }
);