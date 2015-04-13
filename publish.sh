#!/usr/bin/env bash
start_time=$(date +"%T.%N")
for i in {1..1000}
do
	echo '{"name":"anonymous","age":25}' | rabbitmqadmin publish routing_key=person exchange=amq.topic
done
end_time=$(date +"%T.%N")
echo "At $start_time started"
echo "At $end_time ended"