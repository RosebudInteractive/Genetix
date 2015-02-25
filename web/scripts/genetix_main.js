/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:00
 */
var uccelloClt = null;
var formGuid = "88b9280f-7cce-7739-1e65-a883371cd498";
var form2Guid = "e7613a67-c36c-4ff5-a999-4d143bebc97c";
$(document).ready( function() {
    require(
        ['./lib/uccello/uccelloClt'],
        function(UccelloClt){

            var that = this;
            this.currRoot=null;
            this.rootsGuids=[];
            this.rootsContainers={};

            /**
             * Выбрать контекст
             * @param guid
             */
            this.selectContext = function(params) {
                $("#root-form-container").empty();
                uccelloClt.setContext(params, function(result) {
                    that.setAutoSendDeltas();
                });
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

            this.showLogin = function() {
                require(["text!templates/login.html"], function (loginTemplate) {
                    $("#mainContent").empty();
                    $("#mainContent").append($(loginTemplate));
                    $(".login-enter-btn").click(function () {
                        window.login($("#login").val(), $("#password").val());
                    });
                });
            };

            this.showMainForm = function() {
                require(["text!templates/genetix.html"], function (mainTemplate) {
                    $("#mainContent").empty();
                    $("#mainContent").append($(mainTemplate));

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

                    $('#userContext').change(function(){

                        var currContext = $(this).val();
                        var vc = $(this).find('option[value="'+currContext+'"]').data('ContextGuid');

                        // создавать при выборе контекста
                        var createForm = false;

                        // запросить гуиды рутов
                        uccelloClt.getClient().socket.send({action:"getRootGuids", db:currContext, rootKind:'res', type:'method'}, function(result) {
                            that.rootsGuids = result.roots;
                            that.selectContext({masterGuid: currContext, vc:vc,  side: "server"});
                        });
                    });
                });
            };

            /**
             * Создать серверный контекст
             * @param formGuids массив гуидов ресурсов, который загружается в контекст
             */
            window.createContext = function(formGuids) {
                uccelloClt.createContext('server', formGuids, function(result){
                    that.setAutoSendDeltas();
                    //that.getContexts();
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
                    var user = uccelloClt.getLoggedUser();
                    if (!user)
                        that.showLogin();
                    else {
                        that.showMainForm();
                        window.subscribeRootSys();
                    }
                },
                renderRoot: that.renderRoot,
                config:config
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

            /**
             * Логин
             * @param name
             * @param pass
             */
            window.login = function(name, pass){
                var session = $.cookie('session_'+name)? JSON.parse($.cookie('session_'+name)): {id:uccelloClt.getSession().id, deviceName:'MyComputer', deviceType:'C', deviceColor:'#ff0000'};
                uccelloClt.getClient().authenticate(name, pass, session, function(result){
                    if (result.user) {
                        window.subscribeRootSys();
                        $.cookie('session_'+name, JSON.stringify(session), { expires: 30 });
                        uccelloClt.setSession(result.user.session);
                        uccelloClt.pvt.guids.sysRootGuid = result.user.guid;
                        window.showMainForm();
                    } else {
                        $(".is-login-form .login-l").addClass("has-errors");
                    }
                });
            }

        }
    );
});
