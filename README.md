# AngularJS module for Kaazing AMQP 0.9.1 Gateway

Make sure you have these tools before trying out:

- Npm, node package manager. Thanks to [nvm](https://github.com/creationix/nvm) to make `nodejs` installation easier.

- Bower, frontend package manager. Install it using `npm install -g bower`.


The demo use cloud-hosted Kaazing AMQP WebSocket gateway: `wss://sandbox.kaazing.net` (thanks for the amazing work!)

Open `app/index.html` in your browser, e.g.:

 `file:///kaazing-amqp-angular/app/index.html`

![Kaazing AMQP Angular Demo Screenshot](/kaazing-amqp-angular.png "Kaazing AMQP Angular Demo")


### NOTE:

- Maximum row to show in table: 100


## How to develop
It is better to add `./node_modules/.bin` to your `PATH` to shorten command execution.
I use grunt to setup livereload and provide `connect` module to serve the page.
Run `npm install` to resolve all tools needed. 
I still failed to make karma test working due to my lack of knowledge regarding unit test of promise on angular.

To develop with livereload, run 'grunt' to start the `connect` server on [localhost:9009](http://localhost:9009) and start edit your files under `app` folder.

To run functional test:

- `webdriver-manager start` (on another console).

- `npm test` to start the [intern](https://theintern.github.io/intern/#what-is-intern)-runner.

