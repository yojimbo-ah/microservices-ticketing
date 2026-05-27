import mongoose from "mongoose" ;
import request from "supertest" ;
import app from "../../app";
import Order, { OrderStatus } from "../../models/order";
import { stripe } from "../../stripe";
jest.mock('../../stripe') ;

const route = '/api/payments' ;

it('returns 401 when the user is not signed in' , async () => {
	await request(app)
	.post(route)
	.send({
		orderId : new mongoose.Types.ObjectId().toHexString() ,
		token : 'tok_123'
	})
	.expect(401) ;
})

it('returns 400 for an invalid request body' , async () => {
	const cookie = await global.getAuthCookie() ;

	await request(app)
	.post(route)
	.set('Cookie' , cookie)
	.send({
		orderId : 'not-an-object-id' ,
		token : ''
	})
	.expect(400) ;
})

it('returns 404 if the order does not exist' , async () => {
	const cookie = await global.getAuthCookie() ;

	await request(app)
	.post(route)
	.set('Cookie' , cookie)
	.send({
		orderId : new mongoose.Types.ObjectId().toHexString() ,
		token : 'tok_123'
	})
	.expect(404) ;
})

it('returns 401 if the order does not belong to the current user' , async () => {
	const cookie = await global.getAuthCookie() ;
	const order = Order.build({
		id : new mongoose.Types.ObjectId().toHexString() ,
		userId : new mongoose.Types.ObjectId().toHexString() ,
		status : OrderStatus.Created ,
		price : 15.99 ,
		version : 0
	}) ;
	await order.save() ;

	await request(app)
	.post(route)
	.set('Cookie' , cookie)
	.send({
		orderId : order._id.toString() ,
		token : 'tok_123'
	})
	.expect(401) ;
})

it('returns 400 if the order has already been cancelled' , async () => {
	const userId = new mongoose.Types.ObjectId().toHexString() ;
	const cookie = await global.getAuthCookie('test@test.com' , userId) ;
	const order = Order.build({
		id : new mongoose.Types.ObjectId().toHexString() ,
		userId ,
		status : OrderStatus.Cancelled ,
		price : 15.99 ,
		version : 0
	}) ;
	await order.save() ;

	await request(app)
	.post(route)
	.set('Cookie' , cookie)
	.send({
		orderId : order._id.toString() ,
		token : 'tok_123'
	})
	.expect(401) ;
})

it('returns 200 with everything okay' , async () => {
	const userId = new mongoose.Types.ObjectId().toHexString() ;
	const cookie = await global.getAuthCookie('test@test.com' , userId) ;
	const order = Order.build({
		id : new mongoose.Types.ObjectId().toHexString() ,
		userId ,
		status : OrderStatus.Created ,
		price : 15.99 ,
		version : 0
	}) ;
	await order.save() ;

	await request(app)
	.post('/api/payments')
	.set('Cookie' , cookie)
	.send({
		orderId : order._id.toString() ,
		token : 'tok_visa'
	})
	.expect(200) ;

	expect(stripe.charges.create).toHaveBeenCalledWith({
		amount : 1599 ,
		currency : 'usd' ,
		source : 'tok_visa'
	}) ;
})