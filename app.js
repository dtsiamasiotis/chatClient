(function(){
    'use strict';

    angular.module('ChatClient',['ui.bootstrap'])
        .controller('ChatClientController',ChatClientController);

    ChatClientController.$inject = ['$scope'];

    function ChatClientController($scope) {
        this.socket = new WebSocket("ws://localhost:8080/chatServer-1.0-SNAPSHOT/actions");
        var ctrl = this;
        $scope.chatMessages = '';
        $scope.statusOfClient = '';
        ctrl.clientName = $scope.clientName;
        $scope.onlineUsers = [];
        ctrl.activeTabIndex = 0;
        ctrl.tabs = [
            { title:'Main', chatMessages:'' }
        ];


        ctrl.sendMessage = function (message) {
            ctrl.socket.send(ctrl.clientName + ":" + message);
        };


        ctrl.socket.onmessage = function (evt) {
            try {
                var objects = JSON.parse(evt.data);
                $scope.onlineUsers=[];
                objects.forEach(function (key, index) {
                    console.log(key.sessionId);
                    console.log(key.nickName);
                    $scope.onlineUsers.push(key);
                    $scope.$apply();
                });
                return;
            }catch(err){}
            ctrl.populateChatMessages(evt.data);
        };

        ctrl.populateChatMessages = function (incomingMessage){

           $scope.chatMessages = $scope.chatMessages + incomingMessage + '\n';
           $scope.$apply();
        };

        ctrl.setClientName = function (clientName) {
            if(clientName) {
                ctrl.clientName = clientName;
                $scope.statusOfClient = "Connected!";
                ctrl.socket.send("setNickName:"+ctrl.clientName);
            }
            else
                $scope.statusOfClient = "Please enter a nickname first!";
        }

        ctrl.addPrivateChat = function(title){
            var newTab = {title:title, chatMessages:''};
            ctrl.tabs.push(newTab);

        }

        ctrl.selectForPrivate = function(){
            ctrl.addPrivateChat($scope.users.nickName);
        }

        ctrl.setActiveTab = function(index){
            ctrl.activeTabIndex = index;
        }
    }

})();