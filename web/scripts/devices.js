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

            _Sessions: null,
            /**
             * Конструктор
             * @param obj - ожъект сессий
             */
            init: function(obj) {
                this._Sessions = obj || null;
            },

            /**
             * Проперти сессии. При установке вызывает перерисовку
             * @param sessions
             */
            sessions: function(sessions) {
                console.log(sessions);
                if (sessions === undefined)
                    return this._Sessions;
                else {
                    this._Sessions = sessions.sessions;
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
                if (!(this._Sessions)) {
                    mainPanel.find(".is-device-icon").remove(":not(#tabs-placeholder)");
                    return;
                }

                var sessions = {};
                for (var i = 0; i < this._Sessions.length; i++)
                    sessions[this._Sessions[i].id] = this._Sessions[i];

                // очистим удаленные устройства
                mainPanel.find(".is-device-icon:not(#tabs-placeholder)").each(function (i) {
                    if (!($(this).attr("id") in sessions))
                        $(this).remove();
                });

                // добавин новые в конец
                for (var id in sessions) {
                    var session = sessions[id];
                    var existing = mainPanel.find("#" + id);
                    // если элемент не найден, то добавим
                    if (existing.length == 0)
                        existing = $(templates["pc"]).attr("id", id);
                    if (session.connects.length != 0)
                        existing.addClass("is-pressed");
                    else
                        existing.removeClass("is-pressed");
                    existing.find(".is-device-text").text(session.date);
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