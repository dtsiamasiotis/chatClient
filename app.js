(function(){
    'use strict';

    angular.module('ChatClient',[])
        .controller('ChatClientController',ChatClientController);

    ChatClientController.$inject = ['$scope'];

    function ChatClientController($scope) {
        this.socket = new WebSocket("ws://localhost:8080/chatServer-1.0-SNAPSHOT/actions");
        var ctrl = this;
        $scope.chatMessages = '';
        ctrl.clientName = $scope.clientName;
        //ctrl.chatMessages = $scope.chatMessages;

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
            ctrl.clientName = clientName;
        }
    }

})();