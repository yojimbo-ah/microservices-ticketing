import request from "supertest" ;
import app from "../../app";
import mongoose from "mongoose";
import Ticket from "../../models/ticket-model";
import Order , {OrderStatus} from "../../models/order-model";
import { natsWrapper } from "../../nats-wrapper";
jest.mock('../../nats-wrapper') ;
// am not gonna do the simple test for now 
// input validation , cookie , etc....

it('returns an error if the ticket doesnt exist' , async () => {
    const cookie = await global.getAuthCookie() ;
    const response = await request(app)
    .post('/api/orders')
    .set('Cookie' , cookie)
    .send({
        ticketId : new mongoose.Types.ObjectId().toHexString() 
    })
    .expect(404)
})

it('returns a error if the ticket is already reserved' , async () => {
    const id = new mongoose.Types.ObjectId().toHexString()
    const ticket1 = Ticket.build({title : 'title1' , price : 33.33 , id}) ;
    await ticket1.save() ;
    const cookie = await global.getAuthCookie() ;

    const expiretion = new Date() ;
    expiretion.setSeconds(expiretion.getSeconds() + 15 * 60) ;
    const order = Order.build({
        status : OrderStatus.Created ,
        userId : 'jasjdsjajd' ,
        ticket : ticket1 ,
        expiresAt : expiretion
    })
    await order.save() ;

    const response2 = await request(app)
    .post('/api/orders')
    .set('Cookie',cookie)
    .send({
        ticketId : ticket1._id.toString()
    })
    .expect(400)
    expect(natsWrapper.client.publish).not.toHaveBeenCalled() ;
}) 

it('it returns sucess and reserves the ticket' , async () => {
    const cookie = await global.getAuthCookie() ;
    const id = new mongoose.Types.ObjectId().toHexString()
    const ticket = Ticket.build({title : 'title1' , price : 33.33 , id}) ;
    await ticket.save() ;
    const response = await request(app)
    .post('/api/orders')
    .set('Cookie',cookie)
    .send({
        ticketId : ticket._id.toString()
    })
    .expect(201)
    expect(response.body.order).toBeDefined() ;
    expect(natsWrapper.client.publish).toHaveBeenCalled() ;
})
