import request from 'supertest' ;
import app from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import Ticket from '../../models/ticket-model';
jest.mock('../../nats-wrapper') ;

it('returns errors not signed in 401 not Authorized' , async () => {
    // no need to add more details to the request 
    // it is not supposed to pass the auth middleware
    const response = await request(app)
    .patch('/api/tickets/test')
    .send({})
    .expect(401)
})

it('invalid inputs title , returns 404' , async () => {
    const cookie = await global.getAuthCookie() ;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title : 'best title' ,
        price : '33.33'
    })
    expect(201) ;

    const response2 = await request(app)
    .patch(`/api/tickets/${response.body.ticket.id}`)
    .set('Cookie',cookie)
    .send({
        title : 'best' ,
        price : '33.33'
    })
    expect(400) ;
})

it('invalid inputs price , returns 400' , async () => {
    const cookie = await global.getAuthCookie() ;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title : 'best title' ,
        price : '33.33'
    })
    expect(201) ;

    const response2 = await request(app)
    .patch(`/api/tickets/${response.body.ticket.id}`)
    .set('Cookie',cookie)
    .send({
        title : 'great title' ,
        price : '-33.33' 
    })
    expect(400) ;

    const response3 = await request(app)
    .patch(`/api/tickets/${response.body.ticket.id}`)
    .set('Cookie',cookie)
    .send({
        title : 'great title' ,
        price : '33,33' 
    })
    .expect(400) ;
})

it('invalid inputs ticketId , returns 404' , async () => {
    const cookie = await global.getAuthCookie() ;
    const id = new mongoose.Types.ObjectId().toHexString() ;
    await request(app)
    .patch(`/api/tickets/${id}`)
    .set('Cookie',cookie)
    .send({
        title : 'best title' ,
        price : '33.33'
    })
    .expect(404) ;

    await request(app)
    .patch('/api/tickets/jasjdjsd')
    .set('Cookie',cookie)
    .send({
        title : 'best title' ,
        price : '33.33'
    })
    .expect(400) ;
})

it('returns 200 , valid input and with cookie (created and updater) , with existing doc' , async () => {
    const cookie = await global.getAuthCookie() ;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title : 'best title' ,
        price : '10'
    })
    expect(201) ;
    expect(response.body.ticket).toBeDefined() ;
    const response2 = await request(app)
    .patch(`/api/tickets/${response.body.ticket.id}`)
    .set('Cookie' , cookie)
    .send({
        title : 'great title' ,
        price : '55'
    })
    expect(200)

    expect(response2.body.ticket).toBeDefined() ;
    expect(response2.body.ticket.title).toEqual('great title') ;
    expect(response2.body.ticket.price).toEqual(55) ;
})

it ('returns 401 , valid input and cookie but cookie not the same cookie for creator and updater diifrent users' , async () => {
    const cookie1 = await global.getAuthCookie() ;
    const cookie2 = await global.getAuthCookie('hello@test.com','helloworld') ;
    
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie1)
    .send({
        title : 'best title' ,
        price : '33'
    })
    .expect(201) ;
    expect(response.body.ticket).toBeDefined() ;

    const response2 = await request(app)
    .patch(`/api/tickets/${response.body.ticket.id}`)
    .set('Cookie',cookie2)
    .send({
        title : 'great title' ,
        price : '10'
    })
    .expect(401)
})

it('it publishes an event' , async () => {
const cookie = await global.getAuthCookie() ;
    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie',cookie)
    .send({
        title : 'best title' ,
        price : '10'
    })
    expect(201) ;
    expect(response.body.ticket).toBeDefined() ;
    const response2 = await request(app)
    .patch(`/api/tickets/${response.body.ticket.id}`)
    .set('Cookie' , cookie)
    .send({
        title : 'great title' ,
        price : '55'
    })
    expect(200)

    expect(response2.body.ticket).toBeDefined() ;
    expect(response2.body.ticket.title).toEqual('great title') ;
    expect(response2.body.ticket.price).toEqual(55) ;

    expect(natsWrapper.client.publish).toHaveBeenCalled() ;
})

it('returns error 400 cant edit ticket while it is reserved' , async () => {
    const ticket = Ticket.build({
        title : 'great ticket' ,
        price : 34 ,
        userId : 'jsadnajsndnj'
    }) ;
    const orderId = new mongoose.Types.ObjectId().toHexString() ;
    ticket.orderId = orderId ;
    await ticket.save() ;

    const cookie = await global.getAuthCookie() ;
    const response = await request(app)
    .patch(`/api/tickets/:${ticket._id.toString()}`)
    .set(`Cookie`,cookie)
    .send({
        price : 22 ,
        title : 'worst ticket'
    })
    expect(400) ;
})