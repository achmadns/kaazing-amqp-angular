describe('Connection Test', function(){
	var amqpConfig = {
		url: 'wss://sandbox.kaazing.net/amqp091',
		virtualHost: '/',
		credentials: {
			username: 'guest',
			password: 'guest'
		},
		exchange: 'amq.topic',
		queue: 'amqp-test',
		routingKey: 'person'
	};
	beforeEach(module('amqp-091'));
	afterEach(function(){
    	inject(function($rootScope){
    		$rootScope.$apply();
    	});
	});
	it('Should connect successfuly',function(done){
		this.timeout(10000);
		inject(function($rootScope, $timeout, amqp, amqpUtil, AMQP_CONNECTED){
			$rootScope.$on(AMQP_CONNECTED, function () {
				console.log("On global event amqp connected.");
	            amqp.client.openChannel(function (channel) {
	                channel.addEventListener('message', function (event) {
	                    var body = amqpUtil.getBodyAsString(event);
		                event.target.ackBasic({
	    	                deliveryTag: event.args.deliveryTag,
	                        multiple: true
	                    });
	                    console.log("Message" + angular.fromJson(body));
                		done();
	                });
	                channel
	                    .declareQueue({queue: amqpConfig.queue, durable: true})
	                    .bindQueue({queue: amqpConfig.queue, exchange: amqpConfig.exchange, routingKey: amqpConfig.routingKey})
	                    .consumeBasic({queue: amqpConfig.queue, noAck: false, consumerTag: "client" + Math.floor(Math.random() * 100000000)});
	                console.log('Channel initialized!');
	            });
	            amqp.client.openChannel(function (channel) {
	                channel.publishBasic({body: angular.toJson({name:'achmad',age:26}),
	                properties: props, exchange: amqpConfig.exchange, routingKey: amqpConfig.routingKey});
	                console.log("Message sent...");
	            });
            });
	        amqp.connect(amqpConfig).then(function () {
	        	console.log("After connect...");
	        	}, function () {
	        		// throw "Not Connected";
	    	});
			$timeout.flush();
			$rootScope.$apply();
			$rootScope.$digest();
		});
		console.log("Waiting for connection.");
	});
})