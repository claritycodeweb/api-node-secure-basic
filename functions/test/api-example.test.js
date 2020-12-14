const request = require('supertest');

const app = require('../app');

describe('GET /api/v1/example with auth key', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/example')
      .set('Accept', 'application/json')
      .set('X-API-KEY', '12345')

      .expect((resp) => {
        resp.body = resp.body.data;
      })
      .expect('Content-Type', /json/)
      .expect(200,
        [
          {
            name: 'king arthur',
            password: 'password1',
            profession: 'king',
            id: 1
          },
          {
            name: 'rob kendal',
            password: 'password3',
            profession: 'code fiddler',
            id: 2
          },
          {
            name: 'teresa may',
            password: 'password2',
            profession: 'brexit destroyer',
            id: 6
          }
        ],
        done);
  });
});

describe('GET /api/v1/example no auth key', () => {
  it('responds with a json message', (done) => {
    request(app)
      .get('/api/v1/example')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403, done);
  });
});
