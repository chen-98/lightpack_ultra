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
        send(body) {
            this.body = body;
            return this;
        },
    };
}

function createRequest(body) {
    return {
        body,
        uuid: 'test-request',
    };
}

test('saveLibrary returns success only after the database save succeeds', () => {
    const savedUsers = [];
    endpoints._test.setDb({
        users: {
            save(user, callback) {
                savedUsers.push(JSON.parse(JSON.stringify(user)));
                callback(null);
            },
        },
    });

    const user = { username: 'alice', syncToken: 0, library: {} };
    const res = createResponse();
    endpoints._test.saveLibrary(createRequest({
        username: 'alice',
        syncToken: 0,
        data: JSON.stringify({ lists: [{ name: 'Saved List' }] }),
    }), res, user);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { message: 'success', syncToken: 1 });
    assert.equal(savedUsers.length, 1);
    assert.equal(savedUsers[0].syncToken, 1);
    assert.deepEqual(savedUsers[0].library, { lists: [{ name: 'Saved List' }] });
});

test('saveLibrary returns a server error when the database save fails', () => {
    endpoints._test.setDb({
        users: {
            save(user, callback) {
                callback(new Error('database unavailable'));
            },
        },
    });

    const user = { username: 'alice', syncToken: 0, library: {} };
    const res = createResponse();
    endpoints._test.saveLibrary(createRequest({
        username: 'alice',
        syncToken: 0,
        data: JSON.stringify({ lists: [{ name: 'Unsaved List' }] }),
    }), res, user);

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { message: 'An error occurred while saving your data. Please try again.' });
});

test('saveLibrary rejects stale sync tokens without saving', () => {
    let saveCalled = false;
    endpoints._test.setDb({
        users: {
            save() {
                saveCalled = true;
            },
        },
    });

    const user = { username: 'alice', syncToken: 2, library: {} };
    const res = createResponse();
    endpoints._test.saveLibrary(createRequest({
        username: 'alice',
        syncToken: 1,
        data: JSON.stringify({ lists: [] }),
    }), res, user);

    assert.equal(res.statusCode, 400);
    assert.equal(saveCalled, false);
});
