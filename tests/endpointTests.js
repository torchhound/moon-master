const test = require('tape');
const request = require('supertest');

const app = require('../index');

test('get /join', assert => {
  request(app)
    .get('/join')
    .expect(200)
    .end((err, res) => {
      const msg = 'should return 200 OK';
      if (err) return assert.fail(msg);
      assert.pass(msg);
      assert.end();
    });
});

test('get /game', assert => {
  request(app)
    .get('/game')
    .expect(200)
    .end((err, res) => {
      const msg = 'should return 200 OK';
      if (err) return assert.fail(msg);
      assert.pass(msg);
      assert.end();
    });
});