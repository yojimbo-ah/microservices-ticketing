import request from "supertest" ;
import app from "../../app";
import Ticket from "../../models/ticket-model";
import mongoose from "mongoose";

jest.mock('../../nats-wrapper') ;

it('returns validation request error 400 invalid ticket id' , async () => {
    const response = await request(app)
    .get('/api/tickets/jasdh')
    .send({})
    .expect(400)
})

it('returns bad request error 400 , searchs for inexting ticket' , async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    const response = await request(app)
    .get(`/api/tickets/${id}`)
    .send({})
    .expect(404) ;
})

it('returns 200 okay request and returs ticket' , async () => {
    const cookie = await global.getAuthCookie() ;
    const response1 = await request(app)
    .post('/api/tickets')
    .set('Cookie' , cookie)
    .send({
        title : 'best ticket' ,
        price : '34.34'
    })
    .expect(201) ;
    expect(response1.body.ticket).toBeDefined() ;
    const ticket = response1.body.ticket ;
    const response2 = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .send({})
    .expect(200)
    expect(response2.body.ticket).toBeDefined() ;
    expect(response2.body.ticket).toEqual(ticket) ;
})