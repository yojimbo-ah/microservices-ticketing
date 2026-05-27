import request from "supertest" ;
import app from "../../app";

jest.mock('../../nats-wrapper') ;

it('returns tickets with status 200' , async() => {
    const cookie = await global.getAuthCookie() ;
    const resposne1 = await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
        title : 'best title' ,
        price : '33.99'
    })
    .expect(201)
    expect(resposne1.body.ticket).toBeDefined() ;

    const resposne2 = await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
        title : 'hello world' ,
        price : '30'
    })
    .expect(201)
    expect(resposne2.body.ticket).toBeDefined() ;

    const resposne3 = await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
        title : 'bye bye world' ,
        price : '10'
    })
    .expect(201)
    expect(resposne3.body.ticket).toBeDefined() ;

    const response4 = await request(app)
    .get('/api/tickets')
    .send({})
    .expect(200)
    expect(response4.body.tickets).toHaveLength(3) ;
})