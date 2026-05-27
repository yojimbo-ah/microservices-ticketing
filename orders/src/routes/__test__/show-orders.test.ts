import request from "supertest";
import app from "../../app";
import Ticket from "../../models/ticket-model";
import Order , {OrderStatus} from "../../models/order-model";
import mongoose from "mongoose";

jest.mock('../../nats-wrapper') ;


// am not going to do the simple tests for now

it('returns success with orders populated with tickets' , async () => {
    const id1 = new mongoose.Types.ObjectId().toHexString()
    const id2 = new mongoose.Types.ObjectId().toHexString()
    const ticket1 = Ticket.build({title : 'ticket1' , price : 11 , id : id1}) ;
    const ticket2 = Ticket.build({title : 'ticket2' , price : 12 , id : id2}) ;
    const expiretion = new Date() ;
    expiretion.setSeconds(expiretion.getSeconds() + 15 * 60) ;
    await ticket1.save() ;
    await ticket2.save() ;
    const order1 = Order.build({
        expiresAt : expiretion ,
        userId : 'jasjdsjajd' ,
        ticket : ticket1 ,
        status : OrderStatus.Created
    })
    const order2 = Order.build({
        expiresAt : expiretion ,
        userId : 'jasjdsjajd' ,
        ticket : ticket2 ,
        status : OrderStatus.Created
    })
    await order1.save() ;
    await order2.save() ;
    const cookie = await global.getAuthCookie() ;
    const response = await request(app)
    .get('/api/orders')
    .set('Cookie',cookie)
    .send({})
    .expect(200)
    expect(response.body.orders.length).toEqual(2)
})