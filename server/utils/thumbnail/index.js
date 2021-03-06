const crypto = require('crypto');
module.exports = function (url, w, h, g, e) {
	const KEY = '943b421c9eb07c830af81030552c86009268de4e532ba2ee2eab8247c6dahhhh';
	const SALT = '520f986b998545b4785e0defbc4f3c1203f22de2374a3d53cb7a7fe9feahhhh';
	const urlSafeBase64 = (string) => {
		return new Buffer(string).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
	};

	const hexDecode = (hex) => Buffer.from(hex, 'hex');

	const sign = (salt, target, secret) => {
		const hmac = crypto.createHmac('sha256', hexDecode(secret));
		hmac.update(hexDecode(salt));
		hmac.update(target);
		return urlSafeBase64(hmac.digest())
	};

	const resizing_type = 'fit';
	const width = w || 300;
	const height = h || 300;
	const gravity = g || 'no';
	const enlarge = e || 1;
	const extension = 'png';
	const encoded_url = urlSafeBase64(url);
	const path = `/${resizing_type}/${width}/${height}/${gravity}/${enlarge}/${encoded_url}.${extension}`;

	const signature = sign(SALT, path, KEY);
	return `/${signature}${path}`
};