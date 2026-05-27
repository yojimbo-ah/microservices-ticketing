import request from "supertest" ;
import app from "../../app";
import Ticket from "../../models/ticket-model";
import Order , {OrderStatus} from "../../models/order-model";
import mongoose from "mongoose" ;
jest.mock('../../nats-wrapper') ;
// am not going to do the simple tests for now

it('returns error not authorized not the same order creator' , async () => {
    const cookie = await global.getAuthCookie() ;
    const id = new mongoose.Types.ObjectId().toHexString()
    const ticket1 = Ticket.build({title : 'title1' , price : 10 , id}) ;
    await ticket1.save() ;
    const expiretion = new Date() ;
    expiretion.setSeconds(expiretion.getSeconds() + 15 * 60) ;
    const order = Order.build({
        ticket : ticket1 ,
        status : OrderStatus.Created ,
        userId : 'jasjdsjajd' ,
        expiresAt : expiretion
    })
    await order.save() ;
    const cookie2 = await global.getAuthCookie('test2@test.com','ajsjdsnjadn') ;
    const response1 = await request(app)
    .get(`/api/orders/${order._id.toString()}`)
    .set('Cookie',cookie2)
    .send({})
    .expect(401)
})

it('returns error orderId not valid' , async () => {
    const cookie = await global.getAuthCookie() ;
    const id = new mongoose.Types.ObjectId().toHexString()
    const response = await request(app)
    .get(`/api/orders/${id}`)
    .set('Cookie' , cookie)
    .send({})
    .expect(404)
})

it('returns success with the order' , async () => {
    const cookie = await global.getAuthCookie()
    const id = new mongoose.Types.ObjectId().toHexString()
    const ticket1 = Ticket.build({title : 'title1' , price : 10 , id}) ;
    await ticket1.save() ;
    const expiretion = new Date() ;
    expiretion.setSeconds(expiretion.getSeconds() + 15 * 60) ;
    const order = Order.build({
        ticket : ticket1 ,
        status : OrderStatus.Created ,
        userId : 'jasjdsjajd' ,
        expiresAt : expiretion
    })
    await order.save() ;
    const response = await request(app)
    .get(`/api/orders/${order._id.toString()}`)
    .set('Cookie' , cookie)
    .send({})
    .expect(200)
    expect(response.body.order).toBeDefined() ;
})