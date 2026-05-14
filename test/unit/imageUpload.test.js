const assert = require('node:assert/strict');
const test = require('node:test');

const endpoints = require('../../server/endpoints.js');

function createResponse() {
    return {
        statusCode: 200,
        body: null,
        status(statusCode) {
            this.statusCode = statusCode;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

function createRequest() {
    return {
        uuid: 'test-request',
    };
}

function createValidImage(overrides = {}) {
    return Object.assign({
        path: 'image.jpg',
        size: 1000,
        type: 'image/jpeg',
    }, overrides);
}

test('image upload rejects requests without a file', () => {
    const res = createResponse();

    endpoints._test.handleParsedImageUpload(createRequest(), res, {}, { imgurClientID: 'client-id' });

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: 'Please choose an image to upload.' });
});

test('image upload reports unavailable service when Imgur is not configured', () => {
    const res = createResponse();

    endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage() }, { imgurClientID: '' });

    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.body, { message: 'Image uploads are temporarily unavailable. Add the image by URL instead.' });
});

test('image upload rejects images over 2.5mb', () => {
    const res = createResponse();
    let requestCalled = false;

    endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage({ size: 2500001 }) }, {
        imgurClientID: 'client-id',
        post() {
            requestCalled = true;
        },
    });

    assert.equal(requestCalled, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: 'Please upload a file less than 2.5mb.' });
});

test('image upload rejects unsupported image types', () => {
    const res = createResponse();
    let requestCalled = false;

    endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage({ type: 'text/plain' }) }, {
        imgurClientID: 'client-id',
        post() {
            requestCalled = true;
        },
    });

    assert.equal(requestCalled, false);
    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: 'Please upload a PNG, JPG, or GIF image.' });
});

test('image upload rejects missing image types', () => {
    const res = createResponse();

    endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage({ type: undefined }) }, {
        imgurClientID: 'client-id',
    });

    assert.equal(res.statusCode, 400);
    assert.deepEqual(res.body, { message: 'Please upload a PNG, JPG, or GIF image.' });
});

test('image upload accepts supported image.type values', () => {
    ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'].forEach((type) => {
        const res = createResponse();

        endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage({ type }) }, {
            imgurClientID: 'client-id',
            createReadStream(imagePath) {
                return { imagePath };
            },
            post(options, callback) {
                callback(null, { statusCode: 200 }, JSON.stringify({ data: { id: 'abc123' }, success: true }));
            },
        });

        assert.equal(res.statusCode, 200);
    });
});

test('image upload accepts supported image.mimetype values', () => {
    const res = createResponse();

    endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage({ type: undefined, mimetype: 'image/png' }) }, {
        imgurClientID: 'client-id',
        createReadStream(imagePath) {
            return { imagePath };
        },
        post(options, callback) {
            callback(null, { statusCode: 200 }, JSON.stringify({ data: { id: 'abc123' }, success: true }));
        },
    });

    assert.equal(res.statusCode, 200);
});

test('image upload returns parsed Imgur JSON on success', () => {
    const res = createResponse();
    let requestOptions;

    endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage() }, {
        imgurClientID: 'client-id',
        createReadStream(imagePath) {
            return { imagePath };
        },
        post(options, callback) {
            requestOptions = options;
            callback(null, { statusCode: 200 }, JSON.stringify({ data: { id: 'abc123' }, success: true }));
        },
    });

    assert.equal(requestOptions.url, 'https://api.imgur.com/3/image');
    assert.equal(requestOptions.headers.Authorization, 'Client-ID client-id');
    assert.equal(requestOptions.formData.type, 'file');
    assert.equal(requestOptions.timeout, 10000);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { data: { id: 'abc123' }, success: true });
});

test('image upload reports upstream request failures', () => {
    const res = createResponse();

    endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage() }, {
        imgurClientID: 'client-id',
        createReadStream(imagePath) {
            return { imagePath };
        },
        post(options, callback) {
            callback(new Error('network failure'));
        },
    });

    assert.equal(res.statusCode, 502);
    assert.deepEqual(res.body, { message: 'The image upload service could not be reached. Please try again later or add the image by URL.' });
});

test('image upload reports invalid upstream JSON', () => {
    const res = createResponse();

    endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage() }, {
        imgurClientID: 'client-id',
        createReadStream(imagePath) {
            return { imagePath };
        },
        post(options, callback) {
            callback(null, { statusCode: 200 }, 'not json');
        },
    });

    assert.equal(res.statusCode, 502);
    assert.deepEqual(res.body, { message: 'The image upload service returned an invalid response. Please try again later or add the image by URL.' });
});

test('image upload reports rejected upstream uploads', () => {
    const res = createResponse();

    endpoints._test.handleParsedImageUpload(createRequest(), res, { image: createValidImage() }, {
        imgurClientID: 'client-id',
        createReadStream(imagePath) {
            return { imagePath };
        },
        post(options, callback) {
            callback(null, { statusCode: 400 }, JSON.stringify({ error: 'bad image' }));
        },
    });

    assert.equal(res.statusCode, 502);
    assert.deepEqual(res.body, { message: 'The image upload service rejected this image. Please try again later or add the image by URL.' });
});
