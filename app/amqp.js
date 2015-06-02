'use strict'
angular.module('amqp-091', [])
    .service('amqpUtil', function () {
        function arrayBufferToString(buf) {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }

        function stringToArrayBuffer(str) {
            var buf = new ArrayBuffer(str.length);
            var bufView = new Uint8Array(buf);
            for (var i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }

        return {
            createMessageBody: function (object) {
                var message = angular.toJson(object);
                if (typeof(ArrayBuffer) === "undefined") {
                    var body = new Kaazing.ByteBuffer();
                    body.putString(message, Kaazing.Charset.UTF8);
                    body.flip();
                    return body;
                }
                else {
                    return stringToArrayBuffer(message);
                }
            },
            getBodyAsString: function (event) {
                if (typeof(ArrayBuffer) === "undefined") {
                    return event.getBodyAsByteBuffer().getString(Kaazing.Charset.UTF8);
                }
                else {
                    return arrayBufferToString(event.getBodyAsArrayBuffer());
                }
            }
        };
    })
    .service('webSocketFactory', function () {
        var webSocketFactory = new Kaazing.Gateway.WebSocketFactory();
        webSocketFactory.setChallengeHandler(new Kaazing.Gateway.BasicChallengeHandler());
        return  webSocketFactory;
    })
    .service('amqpClientFactory', function (webSocketFactory) {
        var amqpClientFactory = new Kaazing.AMQP.AmqpClientFactory();
        amqpClientFactory.setWebSocketFactory(webSocketFactory);
        return  amqpClientFactory;
    })
    .service('amqp', function ($rootScope, $timeout, amqpClientFactory, $q, AMQP_DISCONNECTED, AMQP_CONNECTED, AMQP_ERROR) {
        var DISCONNECTING = 'DISCONNECTING', DISCONNECTED = 'DISCONNECTED', CONNECTING = 'CONNECTING', CONNECTED = 'CONNECTED';
        var status = DISCONNECTED;
        var amqpClient = amqpClientFactory.createAmqpClient();
        amqpClient.addEventListener("close", function () {
            console.log('Amqp disconnected');
            $rootScope.broadcast(AMQP_DISCONNECTED);
        });
        amqpClient.addEventListener('error', function (e) {
            console.log('Amqp connection error because: ' + e);
            $rootScope.$broadcast(AMQP_ERROR, e);
        });
        return {
            client: amqpClient,
            connect: function (amqpConfig) {
                console.log("Connecting");
                var deferred = $q.defer();
                var promise = deferred.promise;
                if (CONNECTED == status) {
                    $timeout(function () {
                        deferred.resolve();
                    }, 0);
                    return promise;
                }
                if (CONNECTING == status) {
                    var unregister = $rootScope.$on(AMQP_CONNECTED, function () {
                        deferred.resolve();
                        unregister();
                    });
                    return  promise;
                }
                if (DISCONNECTING == status) {
                    var unregister = $rootScope.$on(AMQP_DISCONNECTED, function () {
                        deferred.reject();
                        unregister();
                    });
                    return promise;
                }
                status = CONNECTING;
                $timeout(function () {
                    amqpClient.connect(amqpConfig, function () {
                        status = CONNECTED;
                        console.log('Amqp connected');
                        $rootScope.$broadcast(AMQP_CONNECTED, amqpClient);
                        console.log('Broadcasted');
                        deferred.resolve();
                        console.log('Deferred resolved');
                    });
                }, 0);
                return promise;
            },
            disconnect: function () {
                var deferred = $q.defer();
                var promise = deferred.promise;
                if (DISCONNECTED == status) {
                    $timeout(function () {
                        deferred.resolve();
                    }, 0);
                    return promise;
                }
                if (DISCONNECTING == status) {
                    var unregister = $rootScope.$on(AMQP_DISCONNECTED, function () {
                        deferred.resolve();
                        unregister();
                    });
                    return  promise;
                }
                if (CONNECTING == status) {
                    var unregister = $rootScope.$on(AMQP_CONNECTED, function () {
                        deferred.reject();
                        unregister();
                    });
                }
                status = DISCONNECTING;
                $timeout(function () {
                    amqpClient.disconnect();
                    status = DISCONNECTED;
                    $rootScope.$broadcast(AMQP_DISCONNECTED);
                    deferred.resolve();
                }, 0);
                return promise;
            }
        }
    }
)
    .value('AMQP_DISCONNECTED', 'amqp.disconnected')
    .value('AMQP_CONNECTED', 'amqp.connected')
    .value('AMQP_ERROR', 'amqp.error');