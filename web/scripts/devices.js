/**
 * User: kiknadze
 * Date: 27.02.2015
 * Time: 19:38
 */
define(
    "devices",
    ['/scripts/lib/uccello/uses/template.js', 'text!./templates/devices.html'],
    function (template, tpl) {
        var templates = template.parseTemplate(tpl);

        var DevicesControl = Class.extend({

            /**
             * Конструктор
             * @param obj - ожъект сессий
             */
            init: function(obj) {
                this._User = obj || null;
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
                        existing.addClass("is-pressed");
                    else
                        existing.removeClass("is-pressed");
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
                if ($("#tabs-placeholder").length == 0)
                var tabsIcon = $(templates['tabs']).attr('id', 'tabs-placeholder');
                mainPanel.append(tabsIcon);
            }
        });

        return DevicesControl;
    }
);