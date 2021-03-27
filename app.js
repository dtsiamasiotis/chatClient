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
            if(ctrl.activeTabIndex!=0)
                ctrl.addMessageToTextarea(message);

            var jsonMessage = ctrl.buildJsonMessage(message,"sendMessage");
            ctrl.socket.send(jsonMessage);
            $scope.message = '';
        };


        ctrl.socket.onmessage = function (evt) {
            try {
                var jsonObject = JSON.parse(evt.data);

                    if(jsonObject["operation"]==="registrationAnswer")
                    {
                        var content = jsonObject["content"];
                        if(content === "nickname_taken")
                        {
                            $scope.statusOfClient = "NickName in use. Choose an other one!";
                            $scope.$apply();
                        }
                        else
                        {
                            $scope.statusOfClient = "Connected!";
                            $scope.$apply();
                        }
                    }
                    if(jsonObject["operation"]==="listOfClients")
                    {
                        $scope.onlineUsers=[];
                        var listOfClients = JSON.parse(jsonObject["content"]);

                        listOfClients.forEach(function(key, index){
                            $scope.onlineUsers.push(key);
                        });

                        $scope.$apply();
                    }
                    else if(jsonObject["operation"]==="sendMessage")
                    {
                        var sender = jsonObject["sender"];
                        var destination = jsonObject["destination"];
                        var content = jsonObject["content"];
                        ctrl.populateChatMessages(sender,destination,content);
                    }

                return;
            }catch(err){}

        };

        ctrl.populateChatMessages = function (sender,destination,incomingMessage){
            var foundTab = false;

            if(destination=="Main")
            {
                ctrl.tabs[0].chatMessages = ctrl.tabs[0].chatMessages + sender + ":" + incomingMessage + '\n';
                foundTab = true;
                $scope.$apply();
            }
            else {
                ctrl.tabs.forEach(function (key) {
                    if (key.title === sender) {
                        key.chatMessages = key.chatMessages + sender + ":" + incomingMessage + '\n';
                        foundTab = true;
                        $scope.$apply();
                    }

                });
            }

            if(!foundTab)
            {
                ctrl.initiatePrivateChat(sender,incomingMessage);
                $scope.$apply();
            }

        };

        ctrl.setClientName = function (clientName) {
            if(clientName) {
                ctrl.clientName = clientName;
                var jsonMessage = ctrl.buildJsonMessage(ctrl.clientName,"registerClient");
                ctrl.socket.send(jsonMessage);
            }
            else
                $scope.statusOfClient = "Please enter a nickname first!";
        }

        ctrl.addPrivateChat = function(title){
            var newTab = {title:title, chatMessages:''};
            ctrl.tabs.push(newTab);

        }

        ctrl.initiatePrivateChat = function(title,message){
            var newTab = {title:title, chatMessages:title + ":" + message + '\n'};
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

            return jsonMessage;
        }

        ctrl.addMessageToTextarea = function (message){
            ctrl.tabs[ctrl.activeTabIndex].chatMessages = ctrl.tabs[ctrl.activeTabIndex].chatMessages + ctrl.clientName + ":" + message + '\n';
        }

        window.onbeforeunload = function (event) {
            var jsonMessage = ctrl.buildJsonMessage("","removeClient");
            ctrl.socket.send(jsonMessage);
        }

    }

})();