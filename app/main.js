'use strict'
angular.module('app', ['amqp-091', 'smart-table', 'ui.bootstrap'])
    .controller('home', function ($rootScope, $scope, $http, amqpUtil, amqp) {
        var id= '' + Math.floor(Math.random() * 100000000);
        var amqpConfig = {
            url: 'wss://sandbox.kaazing.net/amqp091',
            virtualHost: '/',
            credentials: {
                username: 'guest',
                password: 'guest'
            },
            exchange: 'amq.topic',
            queue: 'amqp-test-' + id,
            routingKey: 'person-test'
        };
        $scope.person = {
            name: 'anonymous', age: 25
        };
        $scope.rowCollection = [
            {name: 'Achmad Nasirudin Sandi', age: 26}
        ];
        $scope.displayedCollection = [].concat($scope.rowCollection);

        $scope.greeting = {};
        $scope.send = function () {
            $scope.$emit('person.send');
        };
        amqp.connect(amqpConfig).then(function () {

            var consumeChannel = amqp.client.openChannel(function (channel) {
                consumeChannel.addEventListener('declarequeue', function () {
                    console.log(amqpConfig.queue + ' declared');
                });
                consumeChannel.addEventListener('bindqueue', function () {
                    console.log('Bound to ' + amqpConfig.exchange);
                });
                consumeChannel.addEventListener('consume', function () {
                    console.log('Consuming');
                });
                consumeChannel.addEventListener('flow', function (e) {
                    console.log('Flow: ' + e);
                });
                consumeChannel.addEventListener('close', function () {
                    console.log('Channel closed');
                });
                consumeChannel.addEventListener('message', function (event) {
                    var body = amqpUtil.getBodyAsString(event);
                    $scope.rowCollection.push(angular.fromJson(body));
                    $scope.$applyAsync();
                    setTimeout(function () {
                        event.target.ackBasic({
                            deliveryTag: event.args.deliveryTag,
                            multiple: true
                        });
                    }, 0);
                });
                consumeChannel
                    .declareQueue({queue: amqpConfig.queue, durable: true})
                    .bindQueue({queue: amqpConfig.queue, exchange: amqpConfig.exchange, routingKey: amqpConfig.routingKey})
                    .consumeBasic({queue: amqpConfig.queue, noAck: false, consumerTag: "client" + Math.floor(Math.random() * 100000000)});
                console.log('Channel initialized!');
            });
            var publishChannel = amqp.client.openChannel(function (channel) {
                publishChannel.addEventListener("declareexchange", function () {
                    console.log("EXCHANGE DECLARED: " + amqpConfig.exchange);
                });
                publishChannel.addEventListener("error", function (e) {
                    console.log("CHANNEL ERROR: Publish Channel - " + e.message);
                });
                publishChannel.addEventListener("close", function () {
                    console.log("CHANNEL CLOSED: Publish Channel");
                });
                $scope.$on('person.send', function () {
                    console.log('Sending ' + angular.toJson($scope.person));
                    var body = amqpUtil.createMessageBody($scope.person);
                    var props = new Kaazing.AMQP.AmqpProperties();
                    publishChannel.publishBasic({body: body, properties: props, exchange: amqpConfig.exchange, routingKey: amqpConfig.routingKey});
                });
            });
            var unregister = $scope.$on('$routeChangeStart', function () {
                console.log('Route changed');
                consumeChannel.closeChannel({});
                publishChannel.closeChannel({});
                unregister();
            });
        }, function () {
        });
    });
