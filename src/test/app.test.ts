import request from 'supertest';
import app from '../server/app';
import { connect, disconnect, getDatabase } from '../model/client';

describe('Testing MongoDB Conenction', () => {
  it('should raise error when not connected', () => {
    expect(() => getDatabase()).toThrow();
  })
})


describe('Testing API', () => {
  // connect to database
  beforeEach(async () => await connect('mongodb://127.0.0.1:27017'));
  afterEach(async () => await disconnect());

  // default http error response body
  const error = { err: expect.any(String) };

  // Routes /products
  describe('GET /products/:productId', () => {
    it('should raise 404 Error when not found', async () => {
      // id 0 does not exit
      const result = await request(app).get('/products/0');
      expect(result.status).toBe(404);
      expect(result.body).toMatchObject(error);
    });

    it('should raise 400 Error when invalid productId', async () => {
      // q is not a valid number for productId
      const result = await request(app).get('/products/q');
      expect(result.status).toBe(400);
      expect(result.body).toEqual({err: 'Product Id is not valid number'});
    });

    it('should raise 500 Error when server-side error happened', async () => {
      // mock server database shut down before the api calls
      await disconnect();

      const result = await request(app).get('/products/1');
      expect(result.status).toBe(500);
      expect(result.body).toMatchObject(error);
    });

    it('should return a json if request succeed', async () => {
      // id 1 does exist
      const result = await request(app).get('/products/1');

      // get the real document
      const collection = getDatabase().collection('products');
      const document = await collection.findOne({ product_id: 1 }, { projection: { _id: 0} });

      expect(result.status).toBe(200);
      expect(result.body).toEqual(document);
    });
  })
})