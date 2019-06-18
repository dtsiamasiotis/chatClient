(function(){
    'use strict';

    angular.module('ChatClient',[])
        .controller('ChatClientController',ChatClientController);

    //LunchCheckController.$inject = ['$scope'];

    function ChatClientController(){
        this.socket = new WebSocket("ws://localhost:8080/servlet/actions");

        this.sendMessage = function(message){
            this.socket.send(message);
        };

        this.socket.onmessage = function(){

        };
        

})();