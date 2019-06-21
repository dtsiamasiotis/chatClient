(function(){
    'use strict';

    angular.module('ChatClient',[])
        .controller('ChatClientController',ChatClientController);

    ChatClientController.$inject = ['$scope'];

    function ChatClientController($scope) {
        this.socket = new WebSocket("ws://localhost:8080/chatServer-1.0-SNAPSHOT/actions");
        var ctrl = this;
        $scope.chatMessages = '';
        $scope.statusOfClient = '';
        ctrl.clientName = $scope.clientName;
        ctrl.onlineUsers = [{id:1,value:'client1'}];


        ctrl.sendMessage = function (message) {
            console.log(message);
            ctrl.socket.send(ctrl.clientName + ":" + message);
        };


        ctrl.socket.onmessage = function (evt) {
            ctrl.populateChatMessages(evt.data);
        };

        ctrl.populateChatMessages = function (incomingMessage){

           $scope.chatMessages = $scope.chatMessages + incomingMessage + '\n';
           $scope.$apply();
        };

        ctrl.setClientName = function (clientName) {
            if(clientName) {
                ctrl.clientName = clientName;
                $scope.statusOfClient = "Connected!"
                //onlineUsers.push(ctrl.clientName);
            }
            else
                $scope.statusOfClient = "Please enter a nickname first!";
        }
    }

})();