/**
 * User: kiknadze
 * Date: 23.02.2015
 * Time: 15:00
 */
var uccelloClt = null;
$(document).ready( function() {
    require(
        ['./uccello/uccelloClt'],
        function(UccelloClt){

            var that = this;

            /**
             * Рендер переключателя рута
             * @param rootGuid {string}
             * @returns {object}
             */
            this.renderRoot = function(rootGuid){
                console.error("renderRoot");
                return {rootContainer: "#result"+0};
            }


            var config = {
                controls: [
                    {className:'Container', component:'container', viewsets:[], guid:'1d95ab61-df00-aec8-eff5-0f90187891cf'}
                ],
                controlsPath: '../scripts/controls/',
                uccelloPath: 'Uccello/'
            };

            this.showLogin = function() {
                require(["text!./../templates/login.html"], function (loginTemplate) {
                    $("#mainContent").empty();
                    $("#mainContent").append($(loginTemplate));
                    $(".login-enter-btn").click(function () {
                        window.login($("#login").val(), $("#password").val());
                    });
                });
            };

            this.showMainForm = function() {
                require(["text!./../templates/genetix.html"], function (mainTemplate) {
                    $("#mainContent").empty();
                    $("#mainContent").append($(mainTemplate));
                });
            };

            uccelloClt = new UccelloClt({
                host:"ws://"+url('hostname')+":8081",
                container:'#result0',
                callback: function(){
                    var user = uccelloClt.getLoggedUser();
                    if (!user)
                        that.showLogin();
                    else {
                        that.showMainForm();
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
