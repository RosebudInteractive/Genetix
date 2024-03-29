/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:00
 */
var uccelloClt = null, $u=null, DEBUG = true;
var formGuid = "89f42efa-b160-842c-03b4-f3b536ca09d8";
var form2Guid = "d5779b46-5c7e-4537-b25e-a8e5e27fb86f";
var form3Guid = "4a4abdb4-3e3b-85a7-09b9-5f15b4b187f9";
var form4Guid = "cf07df23-abfe-9887-a353-09a00faf99d8";
var form5Guid = "1bf3b1a3-edba-32ca-5033-75e3cf9a709a";
var form6Guid = "4f301ecb-030f-4751-99d0-b19d2d7ce2de";
var form7Guid = "156b663e-8b6f-4464-b3d1-65cac6537108";
var form8Guid = "4112f74d-42cd-4dff-b288-d03f26825715";
var form9Guid = "95a99d2b-73a6-4091-841f-5115b95fb720";
var form10Guid = "46e56f92-cfd9-45c0-9b94-9c7258e68839";
var form11Guid = "cbbf37ac-2b69-4952-984f-5199ebe939b9";
var form12Guid = "5217efe1-4122-462f-98fa-1ee5d9497321";
var form13Guid = "3b5d5222-3471-4770-8126-191517ef084b";
var form14Guid = "305d26ad-22d4-45ee-8da7-d69cfcced2a6";
var $leadEdit = null;

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
                    /*{className:'DataContact', component:'../DataControls/dataContact', guid:'73596fd8-6901-2f90-12d7-d1ba12bae8f4'},
                    {className:'DataContract', component:'../DataControls/dataContract', guid:'08a0fad1-d788-3604-9a16-3544a6f97721'},
                    {className:'DataCompany', component:'../DataControls/dataCompany', guid:'59583572-20fa-1f58-8d3f-5114af0f2c51'},
                    {className:'DataTstCompany', component:'../DataControls/dataTstCompany', guid:'34c6f03d-f6ba-2203-b32b-c7d54cd0185a'},
                    {className:'DataAddress', component:'../DataControls/dataAddress', guid:'16ec0891-1144-4577-f437-f98699464948'},
                    {className:'DataLead', component:'../DataControls/dataLead', guid:'86c611ee-ed58-10be-66f0-dfbb60ab8907'},
                    {className:'DataLeadLog', component:'../DataControls/dataLeadLog', guid:'c4fa07b5-03f7-4041-6305-fbd301e7408a'},
                    {className:'DataOpportunity', component: '../DataControls/dataOpportunity', guid: '5b64caea-45b0-4973-1496-f0a9a44742b7' },
                    {className:'DataIncomeplan', component:'../DataControls/dataIncomeplan', guid:'56cc264c-5489-d367-1783-2673fde2edaf'},
                    {className:'RootAddress', component:'../DataControls/rootAddress', guid:'07e64ce0-4a6c-978e-077d-8f6810bf9386'},
                    {className:'RootCompany', component:'../DataControls/rootCompany', guid:'0c2f3ec8-ad4a-c311-a6fa-511609647747'},
                    {className:'RootTstCompany', component:'../DataControls/rootTstCompany', guid:'c4d626bf-1639-2d27-16df-da3ec0ee364e'},
                    {className:'RootContact', component:'../DataControls/rootContact', guid:'ad17cab2-f41a-36ef-37da-aac967bbe356'},
                    {className:'RootTstContact', component:'../DataControls/rootTstContact', guid:'de984440-10bd-f1fd-2d50-9af312e1cd4f'},
                    {className:'RootContract', component:'../DataControls/rootContract', guid:'4f7d9441-8fcc-ba71-2a1d-39c1a284fc9b'},
                    {className:'RootIncomeplan', component:'../DataControls/rootIncomeplan', guid:'194fbf71-2f84-b763-eb9c-177bf9ac565d'},
                    {className:'RootLead', component:'../DataControls/rootLead', guid:'31c99003-c0fc-fbe6-55eb-72479c255556'},
                    {className:'RootLeadLog', component:'../DataControls/rootLeadLog', guid:'bedf1851-cd51-657e-48a0-10ac45e31e20'},*/
                    {className:'GenLabel', component:'genLabel', viewset:true, guid:'151c0d05-4236-4732-b0bd-ddcf69a35e25'},
                    {className:'GenDataGrid', component:'genDataGrid', viewset:true, guid:'55d59ec4-77ac-4296-85e1-def78aa93d55'},
                    {className:'GenVContainer', component:'genVContainer', viewset:true, guid:'b75474ef-26d0-4298-9dad-4133edaa8a9c'},
                    {className:'GenGContainer', component:'genGContainer', viewset:true, guid:'93ada11b-8c2a-4b06-b5ee-8622d607b0a4'},
                    {className:'GenGColumn', component:'genGColumn', viewset:false, guid:'8d1b679e-4cfe-4faa-aecb-f0c53cf8e35a'},
                    {className:'GenButton', component:'genButton', viewset:true, guid:'bf0b0b35-4025-48ff-962a-1761aa7b3a7b'},
                    {className:'GenDataEdit', component:'genDataEdit', viewset:true, guid:'567cadd5-7f9d-4cd8-a24d-7993f065f5f9'},
                    {className:'GenForm', component:'genForm', viewset:true, guid:'29bc7a01-2065-4664-b1ad-7cc86f92c177'},
                    {className:'Form', viewset:true},
                    {className:'Container', viewset:true},
                    {className:'CContainer', viewset:true},
                    {className:'HContainer', viewset:true},
                    {className:'VContainer', viewset:true},
                    {className:'FContainer', viewset:true},
                    {className:'GContainer', viewset:true},
                    {className:'Toolbar', viewset:true},
                    {className:'ToolbarButton', viewset:true},
                    {className:'ToolbarSeparator', viewset:true},
                    {className:'LayersContainer', viewset:true},
                    {className:'TreeView', viewset:true},
                    {className:'DbTreeView', viewset:true},
                    {className:'Layout', viewset:false},
                    {className:'AdaptiveContainer', viewset:true},
                    {className:'FormDesigner', viewset:true},
                    {className:'DesignerControl', viewset:false}
                ],
                classGuids: {
                    "TaskRequestParameter": "31809e1f-a2c2-4dbb-b653-51e8bdf950a2",
                    "WfeParameter": "9232bbd5-e2f8-466a-877f-5bc6576b5d02",
                    "ProcessVar": "b8fd05dc-08de-479e-8557-dba372e2b4b6",
                    "TaskParameter": "b3746562-946f-46f6-b74f-a50eaff7a771",
                    "TaskStage": "c2f02b7a-1204-4dca-9ece-3400b4550c8d",
                    "MemAddressTest": "14134cb5-7caa-44e2-84ac-9d4c208772f8",
                    "MemContractTest": "dd0addee-bf0f-458e-a360-dbfa1682e6a2",
                    "MemContactTest": "bcbd8862-7bdf-42c9-a4cb-634f8a6019a5",
                    "MemCompanyTest": "1821b56b-7446-4428-93b5-c121c265e4bc",
                    "RootTstCompany": "c4d626bf-1639-2d27-16df-da3ec0ee364e",
                    "DataTstCompany": "34c6f03d-f6ba-2203-b32b-c7d54cd0185a",
                    "RootTstContact": "de984440-10bd-f1fd-2d50-9af312e1cd4f",
                    "DataTstContact": "27ce7537-7295-1a45-472c-a422e63035c7",
                    "RootContract": "4f7d9441-8fcc-ba71-2a1d-39c1a284fc9b",
                    "DataContract": "08a0fad1-d788-3604-9a16-3544a6f97721",
                    "RootAddress": "07e64ce0-4a6c-978e-077d-8f6810bf9386",
                    "DataAddress": "16ec0891-1144-4577-f437-f98699464948",
                    "RootLeadLog": "bedf1851-cd51-657e-48a0-10ac45e31e20",
                    "DataLeadLog": "c4fa07b5-03f7-4041-6305-fbd301e7408a",
                    "RootIncomeplan": "194fbf71-2f84-b763-eb9c-177bf9ac565d",
                    "DataIncomeplan": "56cc264c-5489-d367-1783-2673fde2edaf",
                    "RootOpportunity": "3fe7cd6f-b146-8898-7215-e89a2d8ea702",
                    "DataOpportunity": "5b64caea-45b0-4973-1496-f0a9a44742b7",
                    "RootCompany": "0c2f3ec8-ad4a-c311-a6fa-511609647747",
                    "DataCompany": "59583572-20fa-1f58-8d3f-5114af0f2c51",
                    "RootContact": "ad17cab2-f41a-36ef-37da-aac967bbe356",
                    "DataContact": "73596fd8-6901-2f90-12d7-d1ba12bae8f4",
                    "DataLead": "86c611ee-ed58-10be-66f0-dfbb60ab8907",
                    "RootLead": "31c99003-c0fc-fbe6-55eb-72479c255556"
                },
                controlsPath: 'controls/',
                uccelloPath: 'lib/uccello/',
                viewSet: {name: 'simpleview', path:'controls/simpleview/'},
                webSocketServer: {port:webSocketServerPort?webSocketServerPort:null}
            };
            UCCELLO_CONFIG = new Config(config);

            require(
                ['./lib/uccello/uccelloClt', "devices", './lib/uccello/connection/commClient', './leadEdit'],
                function(UccelloClt, Devices, CommunicationClient, LeadEdit){

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
                            //that.setContextUrl(params.vc, params.urlFormGuids?params.urlFormGuids:params.formGuids);
                            that.setContextUrl(params.vc, result);
                            that.setAutoSendDeltas(true);
                            that.getContexts();
                            if (cb) cb(result && result.guids ? result.guids : null);
                        }, function(rootGuid) { return that.renderRoot(rootGuid) });

                    }


                    /**
                     * Получить контексты и отобразить в комбо
                     */
                    this.getContexts = function() {
                        var sel = $('#userContext');
                        sel.empty();

                        for (var i = 0, len = uccelloClt.getSysCM().countRoot(); i < len; i++) {
                            var root = uccelloClt.getSysCM().getRoot(i);
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

                        //if (device.mobile() || device.tablet())
                        //    template = "text!templates/genetix.m.html"
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
                                window.createContext([form12Guid])
                            }).tooltip().tooltip('option', 'position', toolPos).
                            tooltip('option', 'tooltipClass', 'bottom');
                            $("#crm-menu-item").click(function() {
                                window.createContext([formGuid])
                            });
                            $("#emk-menu-item").click(function() {
                                window.createContext([form11Guid])
                            });
                            $("#edit-menu-item").click(function() {
                                window.createContext([form6Guid])
                            });
                            $("#more-menu-item").click(function() {
                                window.createContext([form13Guid])
                            });
                            $("#more-menu-item2").click(function() {
                                window.createContext([form14Guid])
                            });
                            $("#more-menu-item3").click(function() {
                                window.createContext([form7Guid])
                            });
                            $("#more-menu-item4").click(function() {
                                window.createContext([form8Guid])
                            });
                            $("#empty-menu-item").click(function() {
                                window.createContext([form9Guid])
                            });
                            $("#menu-navigator").click(function() {
                                window.viewNavigator();
                            });


                            //$(".system-toolbar-icon.is-device-close-icon").click(function() {
                            //    setTimeout(function() {
                            //        $(window).trigger("genetix:resize");
                            //    }, 150);
                            //});

                            $(".is-device-bar").bind( 'transitionend', function() {
                                $(window).trigger("genetix:resize");
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
                                that.selectContext({vc:vc,  side: 'server', formGuids:formGuids}, function(formsGuidsCreated){
                                    uccelloClt.createRoot(formsGuidsCreated, "res", null, vcObj);
                                });
                            } else {
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
                    /* window.createContext = function(formGuids) {
                     $("#root-form-container").empty();

                     uccelloClt.createContext('server', formGuids, function(result){
                     that.selectContext({vc:result.vc, side:result.side, formGuids:result.roots, urlFormGuids:result.roots[0]});
                     });
                     }*/

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

                    var commClient = new CommunicationClient.Client(UCCELLO_CONFIG.webSocketClient);
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
                        newTabCallback: that.newTab,
                        commClient: commClient
                    });

                    // глобальная переменная для доступа к методом дебага
                    $u = uccelloClt.getDebugApi();
                    $leadEdit = new LeadEdit(uccelloClt);

                    // --------------------------------------------------------------------------------------------------------
                    // --------------------- Глобальные методы для кнопок управления -----------------------------------------
                    // --------------------------------------------------------------------------------------------------------

                    /**
                     * subscribe user
                     */
                    window.subscribeRootSys = function() {
                        // подписываемся на корневой объект контейнера
                        uccelloClt.getSysCM().subscribeRoots(uccelloClt.pvt.guids.sysRootGuid, function(result){
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


                    // навигатор без объекта
                    that.vNavigator = null;
                    window.viewNavigator = function() {
                        if (!that.vNavigator){
                            require(['./lib/uccello/lib/simpleview/vdbNavigator'], function(VDbNavigator){
                                $('#clientNav').remove();
                                that.vNavigator = VDbNavigator;
                                that.vNavigator.getLid = function(){return 'clientNav';};
                                that.vNavigator.getParent = function(){return null;};
                                that.vNavigator.top = function(){return 5;};
                                that.vNavigator.left = function(){return 3;};
                                that.vNavigator.nlevels = function(){return 3;};
                                that.vNavigator.level = null;
                                that.vNavigator.rootelem = null;
                                that.vNavigator.tabnumber = 0;
                                that.vNavigator.level = function(val){if(val !== undefined) that.vNavigator.level=val; return that.vNavigator.level;};
                                that.vNavigator.dataBase = function(val){if(val !== undefined) that.vNavigator.database=val; return that.vNavigator.database;};
                                that.vNavigator.rootElem = function(val){if(val !== undefined) that.vNavigator.rootelem=val; return that.vNavigator.rootelem;};
                                that.vNavigator.tabNum = function(val){if(val !== undefined) that.vNavigator.tabnumber=val; return that.vNavigator.tabnumber;};
                                that.vNavigator.getControlMgr = function(){ return uccelloClt.getSysCM(); };
                                that.vNavigator.params = {noEvent:true};

                                that.vNavigator.render({rootContainer:'#dbNavigatorForm'});
                                $('#clientNav').find('.dbSelector').change(function(){
                                    that.vNavigator.rootelem = null;
                                    that.vNavigator.render({rootContainer:'#dbNavigatorForm'});
                                });
                                $('#dbNavigatorForm').dialog('open');
                            });
                        } else {
                            that.vNavigator.render({rootContainer:'#dbNavigatorForm'});
                            $('#dbNavigatorForm').dialog('open');
                        }
                    }

                    this.setContextUrl = function(context, result, change) {
                        if (!change)
                            window.isHashchange = false;
                        var formGuids = [];
                        if (result.guids) {
                            for (var i = 0; i < result.guids.length; i++)
                                //if (result.types[i] === UCCELLO_CONFIG.classGuids.Form)
                                formGuids.push(result.guids[i]);
                        }
                        else
                            formGuids = result;

                        document.location = that.getContextUrl(context, formGuids);
                    }


                    this.getContextUrl = function(context, formGuids, timeout) {
                        var location = document.location.href;
                        location = location.replace(/#.*/, '');
                        location = location.replace(/\?runtest=1/, '?runtesttab=1');
                        formGuids = !formGuids || formGuids=='all'?'all':formGuids;
                        if (formGuids !='all' && typeof formGuids == "string") formGuids = [formGuids];
                        formGuids = !formGuids || formGuids=='all'?'all':formGuids.join(',');
                        return location+'#context='+context+(formGuids=='all'?'':'&formGuids='+formGuids)+(timeout?'&timeout='+timeout:'');
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

                    $('#dbNavigatorForm').dialog({
                        title: "Database Navigator",
                        resizable: true,
                        width:1290,
                        height:600,
                        modal: true,
                        autoOpen: false,
                        buttons: {
                        }
                    });


                    // обработка tab и shift+tab
                    $(window).keydown(function(e) {
                        var keyCode = e.keyCode || e.which, control;
                        if (keyCode == 9) {
                            e.preventDefault();
                            var cm=uccelloClt.getContextCM();
                            var form = cm.getRoot(cm.getRootGuids("res")[0]).obj.getForm();
                            var focusControl = form.currentControl()?form.currentControl():form;
                            if (e.shiftKey) {
                                control = focusControl.prev(true);
                            } else {
                                control = focusControl.next(true);
                            }
                            console.log('focus '+control.name() + "(lid=" + control.getLid() + ")", 'currentControl '+focusControl.name());
                            $('#'+control.getLid()).focus();
                            /*e.preventDefault();
                             var cm=uccelloClt.getContextCM(), form = cm.getRoot(cm.getRootGuids("res")[0]).obj;
                             var focusControl = form.currentControl()?form.currentControl():form;
                             if (e.shiftKey) {
                             control = focusControl.prev(true);
                             } else {
                             control = focusControl.next(true);
                             }
                             console.log('focus '+control.name());
                             cm.userEventHandler(control, function(){
                             control.setFocused();
                             });*/
                        } else if (keyCode == 88 && e.altKey) {
                            viewNavigator();
                        }

                    });

                }
            );
        });
});
