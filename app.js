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
            var jsonMessage = ctrl.buildJsonMessage(message,"sendMessage");
            ctrl.socket.send(jsonMessage);
        };


        ctrl.socket.onmessage = function (evt) {
            try {
                var jsonObject = JSON.parse(evt.data);
                $scope.onlineUsers=[];
                //Object.keys(jsonObject).forEach(function (key) {
                    if(jsonObject["operation"]==="listOfClients")
                    {
                        console.log("here");
                        var listOfClients = JSON.parse(jsonObject["content"]);

                        listOfClients.forEach(function(key, index){
                            $scope.onlineUsers.push(key);
                            console.log($scope.onlineUsers);
                        });

                        $scope.$apply();
                    }
                    else if(jsonObject["operation"]==="sendMessage")
                    {
                        var sender = jsonObject["sender"];
                        console.log(sender);
                        ctrl.populateChatMessages(sender,jsonObject["content"]);
                    }
              //  });
                return;
            }catch(err){}

        };

        ctrl.populateChatMessages = function (sender,incomingMessage){
            tabs.forEach(function (key) {
                if(key.title===sender) {
                    key.chatMessages = key.chatMessages + incomingMessage + '\n';
                    $scope.$apply();
                }

            });
         //  $scope.chatMessages = $scope.chatMessages + incomingMessage + '\n';
         //  $scope.$apply();
        };

        ctrl.setClientName = function (clientName) {
            if(clientName) {
                ctrl.clientName = clientName;
                $scope.statusOfClient = "Connected!";
                var jsonMessage = ctrl.buildJsonMessage(ctrl.clientName,"setNickname");
                ctrl.socket.send(jsonMessage);
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

        ctrl.buildJsonMessage = function(message,operation){
            var messageObj = {sender:"",destination:ctrl.tabs[ctrl.activeTabIndex].title,content:message,operation:operation};
            var destination = ctrl.tabs[ctrl.activeTabIndex].title;
            var content = message;
            var jsonMessage = JSON.stringify(messageObj);
            console.log(jsonMessage);
            return jsonMessage;
        }
    }

})();