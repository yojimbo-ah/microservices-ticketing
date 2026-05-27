import request from "supertest" ;
import app from "../../app";
import Ticket from "../../models/ticket-model";
import { natsWrapper } from "../../nats-wrapper";
jest.mock('../../nats-wrapper') ;


it('not aothorized acess , sent without cookie' , async () => {
    // sent without a creating a cookie 
    const response = await request(app)
    .post('/api/tickets')
    .send({
        title : 'best ticket' ,
        price : '23.99'
    })
    
    .expect(401)
    console.log(response.body) 


})

it('accessable if the user is signed in' , async () => {
    const cookie = await global.getAuthCookie() ;
    console.log(cookie) ;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
        title : 'best ticket' ,
        price : '23.99'
    })
    .expect(201) ;

})

it('returns error if an invalid title is provided' , async () => {
    const cookie = await global.getAuthCookie() ;
    const reponse = await request(app)
    .post('/api/tickets')
    .set('Cookie' ,cookie)
    .send({
        title : 'jsd' ,
        price : '39,33'
    })
    .expect(400)
})

it('returns error if an invalid price is provided' , async () => {
    const cookie = await global.getAuthCookie() ;
    const reponse = await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
        title : 'best ticket' ,
        price : 'sjdajd'
    })
    .expect(400)

    await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
        title : 'best ticket' ,
        price : '-23,3'
    })
    .expect(400)

})

it('creates a ticker with valid inputs' , async () => {
    // add validation of response body after adding 
    // mongoose schema and all that stuff
    const cookie = await global.getAuthCookie() ;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
        title : 'best ticket' ,
        price : '39.99'
    })
    .expect(201)

    expect(response.body.ticket).toBeDefined() ;
    expect(response.body.ticket.title).toEqual('best ticket') ;
    expect(response.body.ticket.price.toString()).toEqual('39.99') ;
})

it('publishes a event' , async () => {
    const cookie = await global.getAuthCookie() ;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
        title : 'best ticket' ,
        price : '39.99'
    })
    .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled() ;
})