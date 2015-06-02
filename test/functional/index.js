define([
	'intern!object',
	'intern/chai!assert',
	'require'
], function (registerSuite, assert, require) {
	registerSuite({
		name: 'index',

		'add a person should success': function () {
			return this.remote
				.get(require.toUrl('app/index.html'))
				.setFindTimeout(5000)
				.findById('name')
					.click().clearValue()
					.type('Sandi')
					.end()
				.findById('age')
					.click().clearValue()
					.type('35')
					.end()
				.findById('send-person')
					.click()
					.end()
				// .findByCssSelector('#person-table tr')
				// .getSize().then(function (size) {
				// 	assert.isAbove(0, size, "Rows should be more than one");
				// })
				;
		}
	});
});
