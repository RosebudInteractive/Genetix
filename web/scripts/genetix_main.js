/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:00
 */
var uccelloClt = null;
var formGuid = "89f42efa-b160-842c-03b4-f3b536ca09d8";
var form2Guid = "e7613a67-c36c-4ff5-a999-4d143bebc97c";

var uri = window.location.href;
if (uri.charAt(uri.length - 1) == "/")
    window.history.pushState("", "", uri.substring(0, uri.length - 1));

$(document).ready( function() {
    require(
        ['./lib/uccello/uccelloClt', "devices"],
        function(UccelloClt, Devices){

            this.currRoot=null;
            this.rootsGuids=[];
            this.rootsContainers={};
            this.devices = new Devices();
            var that = this;

            /**
             * Выбрать контекст
             * @param guid
             */
            this.selectContext = function(params) {
                $("#root-form-container").empty();

                var formGuids = 'all';
                if (url('#formGuids')) {
                    formGuids = url('#formGuids').split(',');
                }  else {
                    // выборочная подписка
                    var selSub = $('#selSub').is(':checked');
                    if (selSub) {
                        formGuids = $('#selForm').val();
                    }
                }

                if (formGuids == 'all') {
                    // запросить гуиды рутов
                    uccelloClt.getClient().socket.send({action:"getRootGuids", db:params.masterGuid, rootKind:'res', type:'method', formGuids:formGuids}, function(result) {
                        that.rootsGuids = result.roots;
                        uccelloClt.setContext(params, function(result) {
                            that.setContextUrl(params.vc, params.masterGuid, formGuids);
                            that.setAutoSendDeltas(true);
                        });
                    });
                } else {
                    that.rootsGuids = formGuids;
                    params.formGuids = formGuids;
                    uccelloClt.setContext(params, function(result) {
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
                return {rootContainer: "#root-form-container"};
            }


            this.setAutoSendDeltas = function() {
                var cm = uccelloClt.getContextCM(currRoot);
                if (cm)
                    cm.autoSendDeltas(true);
            }
            var config = {
                controls: [
                    {className:'DataContact', component:'../DataControls/dataContact', guid:'73596fd8-6901-2f90-12d7-d1ba12bae8f4'},
                    {className:'DataContract', component:'../DataControls/dataContract', guid:'08a0fad1-d788-3604-9a16-3544a6f97721'},
                    {className:'DataCompany', component:'../DataControls/dataCompany', guid:'59583572-20fa-1f58-8d3f-5114af0f2c514'},
                    {className:'DataAddress', component:'../DataControls/dataAddress', guid:'16ec0891-1144-4577-f437-f98699464948'},
                    {className:'DataLead', component:'../DataControls/dataLead', guid:'86c611ee-ed58-10be-66f0-dfbb60ab8907'},
                    {className:'DataIncomeplan', component:'../DataControls/dataIncomeplan', guid:'56cc264c-5489-d367-1783-2673fde2edaf'},
                    {className:'Container', component:'container', viewsets:['simpleview'], guid:'1d95ab61-df00-aec8-eff5-0f90187891cf'},
                    {className:'Form', component:'form', viewsets:['simpleview'], guid:'7f93991a-4da9-4892-79c2-35fe44e69083'},
                    {className:'DataColumn', component:'dataColumn', guid:'100f774a-bd84-8c46-c55d-ba5981c09db5'},
                    {className:'DataGrid', component:'dataGrid', viewsets:['simpleview'], guid:'ff7830e2-7add-e65e-7ddf-caba8992d6d8'}
                ],
                controlsPath: 'controls/',
                uccelloPath: 'lib/uccello/'
            };

            /**
             * Логин
             * @param name
             * @param pass
             */
            window.login = function(name, pass){
                var session = $.cookie('session_'+name)? JSON.parse($.cookie('session_'+name)): {guid:uccelloClt.getSessionGuid(), deviceName:'MyComputer', deviceType:'C', deviceColor:'#6ca9f0'};
                uccelloClt.getClient().authenticate({user:name, pass:pass, session:session}, function(result){
                    if (result.user) {
                        $.cookie('session_'+name, JSON.stringify(session), { expires: 30 });
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
                    });
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

            this.showMainForm = function() {
                require(["text!templates/genetix.html"], function (mainTemplate) {
                    $("#mainContent").empty();
                    $("#mainContent").append($(mainTemplate));
                    window.getSessions();

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

                        var currContext = $(this).val();
                        var vc = $(this).find('option[value="'+currContext+'"]').data('ContextGuid');

                        // запросить гуиды рутов
                        uccelloClt.getClient().socket.send({action:"getRootGuids", db:currContext, rootKind:'res', type:'method'}, function(result) {
                            that.rootsGuids = result.roots;
                            that.selectContext({masterGuid: currContext, vc:vc,  side: "server"});
                        });
                    });

                    uccelloClt.getController().event.on({
                        type: 'endApplyDeltas',
                        subscriber: this,
                        callback: function(args){
                            if (args.db.getName() != "System") return;
                            var user = uccelloClt.getUser();
                            that.devices.sessions(user);
                        }
                    });

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

            uccelloClt = new UccelloClt({
                host:"ws://"+url('hostname')+":8082",
                container:'#result0',
                callback: function(){
                    var user = uccelloClt.getUser();
                    if (!user)
                        that.showLogin();
                    else {
                        uccelloClt.subscribeUser(function(result2) {
                            if (result2)
                                that.showMainForm();
                            else
                                $(".is-login-form .login-l").addClass("has-errors");
                        });
                    }
                },
                renderRoot: that.renderRoot,
                config:config,
                newTabCallback: that.newTab
            });

            this.newTab = function(data) {
                window.open(that.getContextUrl(data.contextGuid, data.dbGuid, data.resGuids));
            }

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
                document.location = that.getContextUrl(context, database, formGuids);
            }

            this.getContextUrl = function(context, database, formGuids) {
                var location = document.location.href;
                location = location.replace(/#.*/, '');
                return location+'#database='+database+'&context='+context+'&formGuids='+(!formGuids || formGuids=='all'?'all':formGuids.join(','))
            }

            $(window).on('hashchange', function() {
                var masterGuid = url('#database');
                var vc = url('#context');
                if(masterGuid && vc)
                    $('#userContext').val(masterGuid).change();
            });
        }
    );
});
