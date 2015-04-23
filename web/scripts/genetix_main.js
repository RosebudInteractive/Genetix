/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:00
 */
var uccelloClt = null, DEBUG = true;
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
        ["./lib/uccello/config/config", "./deviceHelper"],
        function(Config, DeviceHelper) {
            var device = new DeviceHelper(window.navigator.userAgent.toLowerCase());
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
                    {className:'GenDataEdit', component:'genDataEdit', viewset:true, guid:'567cadd5-7f9d-4cd8-a24d-7993f065f5f9'},
                    {className:'Form', viewset:true},
                    {className:'Container', viewset:true},
                    {className:'CContainer', viewset:true},
                    {className:'HContainer', viewset:true},
                    {className:'VContainer', viewset:true}
                ],
                controlsPath: 'controls/',
                uccelloPath: 'lib/uccello/',
                viewSet: {name: 'simpleview', path:'controls/simpleview/'},
                webSocketServer: {port:8082}
            };
            UCCELLO_CONFIG = new Config(config);

            require(
                ['./lib/uccello/uccelloClt', "devices" ],
                function(UccelloClt, Devices){

                    this.currRoot=null;
                    this.rootsGuids=[];
                    this.devices = new Devices();
                    window.isHashchange = true;
                    var that = this;

                    /**
                     * Выбрать контекст
                     * @param guid
                     */
                    this.selectContext = function(params, cb) {
                        $("#root-form-container").empty();

                        uccelloClt.setContext(params, function(result) {
                            that.setContextUrl(params.vc, params.urlFormGuids?params.urlFormGuids:params.formGuids);
                            that.setAutoSendDeltas(true);
                            that.getContexts();
                            if (cb) cb(result);
                        }, function(rootGuid) { return that.renderRoot(rootGuid) });

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
                                        var isOn = uccelloClt.getSysCM().get(item.getGuid()).isOn();
                                        option.data('ContextGuid', item.get('ContextGuid'));
                                        option.val(item.get('DataBase')).html(item.get('Name')+(isOn?' isOn ':''));
                                        sel.append(option);
                                    }

                                    var masterGuid = uccelloClt.getContext()? uccelloClt.getContext().dataBase(): null;
                                    if (masterGuid) {
                                        var urlGuids = url('#formGuids');
                                        urlGuids = urlGuids==null || urlGuids=='all'?'all':urlGuids.split(',');
                                        that.setContextUrl($(sel.find('option[value='+masterGuid+']')).data('ContextGuid'), urlGuids);
                                    }
                                    sel.val(masterGuid);
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
                        var template = "text!templates/genetix.html";

                        if (device.mobile() || device.tablet())
                            template = "text!templates/genetix.m.html"
                        require([template], function (mainTemplate) {
                            var mainContent = $("#mainContent");
                            mainContent.empty();
                            mainContent.append($(mainTemplate));



                            window.getSessions();
                            that.getContexts();

                            // выведем текущего пользователя
                            var user = uccelloClt.getUser();
                            $("#userName-combo").text(user.name());

                            // подпишемся на клики
                            var toolPos = { my: 'center top', at: 'center bottom', collision: 'none' };
                            $("#documents-menu-item").click(function() {
                                window.createContext([formGuid])
                            }).tooltip().tooltip('option', 'position', toolPos).
                               tooltip('option', 'tooltipClass', 'bottom');
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
                                var vc = $(this).find('option[value="'+masterGuid+'"]').data('ContextGuid');
                                if(masterGuid && vc)
                                    that.selectContext({masterGuid: masterGuid, vc:vc,  side: "server", formGuid: null });
                                else
                                    $("#root-form-container").empty();
                            });


                            that.getContexts();
                            var vc = url('#context');
                            var vcObj = uccelloClt.getSysCM().get(vc);
                            var formGuids = url('#formGuids') ? url('#formGuids').split(',') : null;
                            if (formGuids) {
                                that.selectContext({vc:vc,  side: 'server', formGuids:formGuids}, function(){
                                    uccelloClt.createRoot(formGuids, "res", function (result) {
                                        vcObj.addNewResRoots(formGuids, function (result2) {
                                            that.selectContext({vc: vc, side: 'server', formGuids:formGuids, urlFormGuids:formGuids});
                                        });
                                    }, vcObj);
                                });
                            } else if (vc) {
                                that.selectContext({vc:vc,  side: 'server'});
                            }

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
                            that.selectContext({vc:result.vc, side:result.side, formGuids:result.roots, urlFormGuids:'all'});
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
                        window.open(that.getContextUrl(data.contextGuid, data.resGuids));
                    }

                    uccelloClt = new UccelloClt({
                        //host:"ws://"+url('hostname')+":8082",
                        callback: function(){
                            var user = uccelloClt.getUser();
                            if (!user)
                                that.showLogin();
                            else {
                                that.showMainForm(function () {
                                    uccelloClt.subscribeUser(function(result2) {
                                        if (!result2)
                                            that.showLogin();
                                    });
                                });
                            }
                        },
                        //renderRoot: that.renderRoot,
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

                    this.setContextUrl = function(context, formGuids) {
                        window.isHashchange = false;
                        document.location = that.getContextUrl(context, formGuids);

                    }

                    this.getContextUrl = function(context, formGuids) {
                        var location = document.location.href;
                        location = location.replace(/#.*/, '');
                        formGuids = !formGuids || formGuids=='all'?'all':formGuids;
                        if (formGuids !='all' && typeof formGuids == "string") formGuids = [formGuids];
                        return location+'#context='+context+'&formGuids='+(!formGuids || formGuids=='all'?'all':formGuids.join(','))
                    }

                    $(window).on('hashchange', function() {
                        if (window.isHashchange) {
                            var vc = url('#context');
                            var vcObj = uccelloClt.getSysCM().get(vc);
                            if(vcObj && vc)
                                $('#userContext').val(vcObj.dataBase()).change();
                        }
                        window.isHashchange = true;
                    });
                }
            );
        });
});
