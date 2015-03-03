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
                this._currRoot = null;
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

                                uccelloClt.getClient().socket.send({action:"getRootGuids", db:currContext, rootKind:'res', type:'method'}, function(result) {
                            that.rootsGuids = result.roots;
                            that._selectContext({masterGuid: currContext, vc:vc,  side: "server"});
                        });

                        }
                    });

                    tabsIcon.click(function () {
                        var popupData = that._preparePopupData();
                        that._tabsPopup.genetixPopup("show", popupData);
                    });
                }
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
                                var cnt = {
                                    id: item.get('DataBase'),
                                    title: item.get('Name'),
                                    subTree: [],
                                    rightIcon: "/images/controls.svg#hamburger",
                                    custom: {
                                        type: "context",
                                        contextGuid: item.get('ContextGuid')
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
                var that = this;
                $("#root-form-container").empty();
                uccelloClt.setContext(params, function(result) {
                    that._setAutoSendDeltas();
                });
            },
            _setAutoSendDeltas: function() {
                var cm = uccelloClt.getContextCM(currRoot);
                if (cm)
                    cm.autoSendDeltas(true);
            }
        });

        return DevicesControl;
    }
);