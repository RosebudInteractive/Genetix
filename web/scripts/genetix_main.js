/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:00
 */
var uccelloClt = null;
var formGuid = "89f42efa-b160-842c-03b4-f3b536ca09d8";
var form2Guid = "e7613a67-c36c-4ff5-a999-4d143bebc97c";
var form3Guid = "4a4abdb4-3e3b-85a7-09b9-5f15b4b187f9";

var uri = window.location.href;
if (uri.charAt(uri.length - 1) == "/")
    window.history.pushState("", "", uri.substring(0, uri.length - 1));

jQuery.browser = {};
jQuery.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase());
jQuery.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
jQuery.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());
jQuery.browser.chrome = /chrome/.test(navigator.userAgent.toLowerCase());

$(document).ready( function() {
    require(
        ["./lib/uccello/config/config"],
        function(Config) {
            var config = {
                controls: [
                    {className:'DataContact', component:'../DataControls/dataContact', guid:'73596fd8-6901-2f90-12d7-d1ba12bae8f4'},
                    {className:'DataContract', component:'../DataControls/dataContract', guid:'08a0fad1-d788-3604-9a16-3544a6f97721'},
                    {className:'DataCompany', component:'../DataControls/dataCompany', guid:'59583572-20fa-1f58-8d3f-5114af0f2c514'},
                    {className:'DataAddress', component:'../DataControls/dataAddress', guid:'16ec0891-1144-4577-f437-f98699464948'},
                    {className:'DataLead', component:'../DataControls/dataLead', guid:'86c611ee-ed58-10be-66f0-dfbb60ab8907'},
                    {className:'DataIncomeplan', component:'../DataControls/dataIncomeplan', guid:'56cc264c-5489-d367-1783-2673fde2edaf'},
                    {className:'GenLabel', component:'genLabel', viewset:true, guid:'151c0d05-4236-4732-b0bd-ddcf69a35e25'},
                    {className:'GenDataGrid', component:'genDataGrid', viewset:true, guid:'55d59ec4-77ac-4296-85e1-def78aa93d55'},
                    {className:'GenContainer', component:'genContainer', viewset:true, guid:'b75474ef-26d0-4298-9dad-4133edaa8a9c'},
                    {className:'GenButton', component:'genButton', viewset:true, guid:'bf0b0b35-4025-48ff-962a-1761aa7b3a7b'},
                    {className:'DataEdit', viewset:true},
                    {className:'Form', viewset:true}
                ],
                controlsPath: 'controls/',
                uccelloPath: 'lib/uccello/',
                viewSet: {name: 'simpleview', path:'controls/simpleview/'}
            };
            UCCELLO_CONFIG = new Config(config);

            require(
                ['./lib/uccello/uccelloClt', "devices" ],
                function(UccelloClt, Devices){

                    this.currRoot=null;
                    this.rootsGuids=[];
                    this.devices = new Devices();
                    this.hashchange = true;
                    var that = this;

                    /**
                     * Выбрать контекст
                     * @param guid
                     */
                    this.selectContext = function(params) {
                        $("#root-form-container").empty();

                        var formGuids = 'all';
                        var urlGuids = url('#formGuids');
                        if (urlGuids != null) {
                            formGuids = urlGuids.split(',');
                        }

                        // выборочная подписка
                        var selSub = $('#selSub').is(':checked');
                        if (selSub) {
                            formGuids = $('#selForm').val();
                            formGuids = formGuids!=null? formGuids: [];
                        }


                        if (formGuids == null || formGuids == 'all') {
                            // запросить гуиды рутов
                            uccelloClt.getClient().socket.send({action:"getRootGuids", db:params.masterGuid, rootKind:'res', type:'method', formGuids:formGuids}, function(result) {
                                that.rootsGuids = result.roots;
                                uccelloClt.setContext(params, function() {
                                    that.setContextUrl(params.vc, params.masterGuid, formGuids);
                                    that.setAutoSendDeltas(true);
                                });
                            });
                        } else {
                            that.rootsGuids = formGuids;
                            params.formGuids = formGuids;
                            uccelloClt.setContext(params, function() {
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
                                that.setContextUrl(params.vc, params.masterGuid, formGuids);
                                that.setAutoSendDeltas(true);
                            });
                        }

                    }


                    /**
                     * Получить контексты и отобразить в комбо
                     */
                    this.getContexts = function() {
                        var sel = $('#userContext');
                        sel.empty();

                        for (var i = 0, len = uccelloClt.getSysDB().countRoot(); i < len; i++) {
                            var root = uccelloClt.getSysDB().getRoot(i);
                            var obj = root.obj;
                            for (var j = 0, len2 = obj.countCol(); j < len2; j++) {
                                var col = obj.getCol(j);
                                var name = col.getName();
                                if (name == "VisualContext") {
                                    for (var k = 0, len3 = col.count(); k < len3; k++) {
                                        var item = col.get(k);
                                        var option = $('<option/>');
                                        option.data('ContextGuid', item.get('ContextGuid'));
                                        option.val(item.get('DataBase')).html(item.get('Name'));
                                        sel.append(option);
                                    }
                                    sel.val(uccelloClt.getContext()? uccelloClt.getContext().masterGuid(): null);

                                    var masterGuid = uccelloClt.getContext()? uccelloClt.getContext().masterGuid(): null;
                                    if (masterGuid) {
                                        that.setContextUrl($(sel.find('option[value='+masterGuid+']')).data('ContextGuid'), masterGuid, 'all');
                                    }
                                    return;
                                }
                            }
                        }
                    }

                    /**
                     * Рендер переключателя рута
                     * @param rootGuid {string}
                     * @returns {object}
                     */
                    this.renderRoot = function(rootGuid){
                        devices.currentRoot(rootGuid);
                        return {rootContainer: "#root-form-container"};
                    }


                    this.setAutoSendDeltas = function() {
                        var cm = uccelloClt.getContextCM(this.currRoot);
                        if (cm)
                            cm.autoSendDeltas(true);
                    }
                    /**
                     * Логин
                     * @param name
                     * @param pass
                     */
                    window.login = function(name, pass){
                        var session = $.cookie('session_'+name)? JSON.parse($.cookie('session_'+name)): {guid:uccelloClt.getSessionGuid(), deviceName:'MyComputer', deviceType:'C', deviceColor:'#6ca9f0'};
                        uccelloClt.getClient().authenticate({user:name, pass:pass, session:session}, function(result){
                            if (result.user) {
                                $.cookie('session_'+name, JSON.stringify(result.user.session), { expires: 30 });
                                uccelloClt.subscribeUser(function(result2){
                                    if (result2)
                                        that.showMainForm();
                                    else
                                        $(".is-login-form .login-l").addClass("has-errors");
                                });
                            } else {
                                $(".is-login-form .login-l").addClass("has-errors");
                            }
                        });
                    }

                    this.showLogin = function() {
                        require(["text!templates/login.html"], function (loginTemplate) {
                            $("#mainContent").empty();
                            $("#mainContent").append($(loginTemplate));
                            $(".login-enter-btn").click(function () {
                                window.login($("#login-edit").val(), $("#password-edit").val());
                            }).mousedown(function () {
                                $(this).css({"background-color": "#38465a"})
                            }).mouseup(function () {
                                $(this).css({"background-color": ""})
                            }).hover(function (event) {
                                if ((!(jQuery.browser.mozilla) && event.which == 1) || (jQuery.browser.mozilla && event.buttons == 1))
                                    $(this).css({"background-color": "#38465a"});
                                else
                                    $(this).css({"background-color": ""});
                            }, function () {
                                $(this).css({"background-color": ""});
                            });

                            $("#login-edit").focus();
                        });
                    };

                    /**
                     * Получить  получить на клиент от сервера структуру - все сессии с номерами и когда созданы,
                     * все коннекты этих сессий - с номерами и когда созданы
                     */
                    window.getSessions = function() {
                        var user = uccelloClt.getUser();
                        that.devices.sessions(user);
                    }

                    this.showMainForm = function(callback) {
                        require(["text!templates/genetix.html"], function (mainTemplate) {
                            var mainContent = $("#mainContent");
                            mainContent.empty();
                            mainContent.append($(mainTemplate));
                            window.getSessions();
                            that.getContexts();

                            // выведем текущего пользователя
                            var user = uccelloClt.getUser();
                            $("#userName-combo").text(user.name());

                            // подпишемся на клики
                            $("#documents-menu-item").click(function() {
                                window.createContext([formGuid])
                            });
                            $("#crm-menu-item").click(function() {
                                window.createContext([form2Guid])
                            });
                            $("#emk-menu-item").click(function() {
                                window.createContext([form3Guid])
                            });

                            $("#coral-button").click(function() {
                                if ($(this).hasClass("is-pressed")) {
                                    that.getContexts();
                                    $("#context-list-wrapper").show();
                                } else
                                    $("#context-list-wrapper").hide();
                            });
                            $("#process-button").click(function() {
                                window.logout();
                            });

                            $('#userContext').change(function(){
                                var masterGuid = $(this).val();
                                var currContext = $(this).val();
                                var vc = $(this).find('option[value="'+currContext+'"]').data('ContextGuid');
                                if(masterGuid && vc)
                                    that.selectContext({masterGuid: currContext, vc:vc,  side: "server"});
                                else
                                    $("#root-form-container").empty();
                            });


                            // выбрать контекст если указаны параметры
                            var masterGuid = url('#database');
                            var vc = url('#context');
                            if(masterGuid && vc)
                                $('#userContext').val(masterGuid).change();

                            uccelloClt.getController().event.on({
                                type: 'endApplyDeltas',
                                subscriber: this,
                                callback: function(args){
                                    if (args.db.getName() != "System") return;
                                    var user = uccelloClt.getUser();
                                    that.devices.sessions(user);
                                }
                            });


                            if (that._userPopup == null) {
                                var popupDiv = $("<div></div>");
                                $("body").append(popupDiv);
                                that._userPopup = popupDiv.genetixPopup({
                                    buttonControl: $("#userName-combo"),
                                    offsetX: -32,
                                    offsetY: 3,
                                    click: function (event, data) {
                                        if (data.id != "user-info-menu") {
                                            window.logout();
                                        }
                                    },
                                    leftIcons: true,
                                    rightIcons: false,
                                    bigArrowInterval: false,
                                    leftViewBoxSize: 16,
                                    extendedClass: "is-gray-menu",
                                    menuItems: [{
                                        id: "user-info-menu",
                                        title: "User info",
                                        subTree: [],
                                        leftIcon: "/images/Genetix.svg#userInfo",
                                        leftIconColor: "#BCC0C9",
                                        custom: {}
                                    }, {
                                        id: "login-as-menu",
                                        title: "Login as...",
                                        subTree: [],
                                        leftIcon: "/images/Genetix.svg#loginAs",
                                        leftIconColor: "#BCC0C9",
                                        custom: {}
                                    }, {
                                        id: "user-menu-separator",
                                        type: "separator"
                                    }, {
                                        id: "logout-menu",
                                        title: "Logout",
                                        subTree: [],
                                        leftIcon: "/images/Genetix.svg#logout",
                                        leftIconColor: "#BCC0C9",
                                        custom: {}
                                    }, {
                                        id: "logoutAll-menu",
                                        title: "Logout all sessions",
                                        subTree: [],
                                        leftIcon: "/images/Genetix.svg#logoutAll",
                                        leftIconColor: "#BCC0C9",
                                        custom: {}
                                    }]
                                });

                            }
                            $("#userName-combo").parent().parent().click(function () {
                                that._userPopup.genetixPopup("show", null, $("#userName-combo"));
                            });
                            if (callback) callback();
                        });
                    };

                    /**
                     * Создать серверный контекст
                     * @param formGuids массив гуидов ресурсов, который загружается в контекст
                     */
                    window.createContext = function(formGuids) {
                        $("#root-form-container").empty();

                        uccelloClt.createContext('server', formGuids, function(result){
                            that.setAutoSendDeltas();
                            that.getContexts();
                        });
                    }


                    /**
                     * Создать клиентский контекст
                     * @param guid
                     */
                    window.createClientContext = function(formGuids) {
                        if (!formGuids) return;
                        that.clearTabs();
                        uccelloClt.createContext('client', formGuids, function(result){
                            that.setAutoSendDeltas();
                            that.getContexts();
                        });
                    }

                    this.newTab = function(data) {
                        window.open(that.getContextUrl(data.contextGuid, data.dbGuid, data.resGuids));
                    }

                    uccelloClt = new UccelloClt({
                        host:"ws://"+url('hostname')+":8082",
                        callback: function(){
                            var user = uccelloClt.getUser();
                            if (!user)
                                that.showLogin();
                            else {
                                that.showMainForm(function () {
                                    uccelloClt.subscribeUser(function(result2) {
                                        if (result2) {
                                            var masterGuid = url('#database');
                                            var vc = url('#context');
                                            if(masterGuid && vc) {
                                                $('#userContext').val(masterGuid).change();
                                                var formGuids = 'all';
                                                var urlGuids = url('#formGuids');
                                                if (urlGuids != null) {
                                                    formGuids = urlGuids.split(',');
                                                }
                                                if (formGuids != 'all') {
                                                    uccelloClt.getClient().socket.send({action:"getRootGuids", db:masterGuid, rootKind:'res', type:'method', formGuids:formGuids}, function(result) {
                                                        var newFormGuids = [];
                                                        for(var i in formGuids) {
                                                            var found = false;
                                                            for(var j in result.roots) {
                                                                if (result.roots[j] == formGuids[i])
                                                                    found = true;
                                                            }
                                                            if (!found)
                                                                newFormGuids.push(formGuids[i]);
                                                        }
                                                        if (newFormGuids.length > 0)
                                                            uccelloClt.createRoot(newFormGuids, "res");
                                                    });
                                                }
                                            }
                                        }
                                        else
                                            that.showLogin();
                                    });
                                });
                            }
                        },
                        renderRoot: that.renderRoot,
                        newTabCallback: that.newTab
                    });



                    // --------------------------------------------------------------------------------------------------------
                    // --------------------- Глобальные методы для кнопок управления -----------------------------------------
                    // --------------------------------------------------------------------------------------------------------

                    /**
                     * subscribe user
                     */
                    window.subscribeRootSys = function() {
                        // подписываемся на корневой объект контейнера
                        uccelloClt.getSysDB().subscribeRoots(uccelloClt.pvt.guids.sysRootGuid, function(result){
                            //that.getContexts();
                        }, function() {} );
                    }

                    /**
                     * Создать рут ресурсов (не данных)
                     */
                    window.createRoot = function(guids){
                        uccelloClt.createRoot(guids, "res");
                    }

                    window.logout = function(){
                        uccelloClt.deauthenticate(function(result){
                            that.showLogin();
                        });
                    }

                    this.setContextUrl = function(context, database, formGuids) {
                        that.hashchange = false;
                        document.location = that.getContextUrl(context, database, formGuids);

                    }

                    this.getContextUrl = function(context, database, formGuids) {
                        var location = document.location.href;
                        location = location.replace(/#.*/, '');
                        return location+'#database='+database+'&context='+context+'&formGuids='+(!formGuids || formGuids=='all'?'all':formGuids.join(','))
                    }

                    $(window).on('hashchange', function() {
                        if (that.hashchange) {
                            var masterGuid = url('#database');
                            var vc = url('#context');
                            if(masterGuid && vc)
                                $('#userContext').val(masterGuid).change();
                        }
                        that.hashchange = true;
                    });
                }
            );
        });
});
