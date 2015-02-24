/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:00
 */
var uccelloClt = null;
var formGuid = "88b9280f-7cce-7739-1e65-a883371cd498";
$(document).ready( function() {
    require(
        ['./lib/uccello/uccelloClt'],
        function(UccelloClt){

            var that = this;

            /**
             * Рендер переключателя рута
             * @param rootGuid {string}
             * @returns {object}
             */
            this.renderRoot = function(rootGuid){
                return {rootContainer: "#root-form-container"};
            }


            this.setAutoSendDeltas = function(check) {
                var cm = uccelloClt.getContextCM(formGuid);
                if (cm)
                    cm.autoSendDeltas(check);
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
                    })
                });
            };

            /**
             * Создать серверный контекст
             * @param formGuids массив гуидов ресурсов, который загружается в контекст
             */
            window.createContext = function(formGuids) {
                uccelloClt.createContext('server', formGuids, function(result){
                    that.setAutoSendDeltas(true);
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
                    that.setAutoSendDeltas(true);
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
