import express , {Request , Response , NextFunction } from "express" ;
import { NotAuthorizedError, NotFoundError, requireAuth , validateRequest } from "@ahabtickets/common";
import {param} from "express-validator" ;
import mongoose from "mongoose";
import Order , {OrderStatus} from "../models/order-model";
import { natsWrapper } from "../nats-wrapper";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled";

const router = express.Router() ;
router.delete('/api/orders/:orderId' , 
    requireAuth ,
    [
        param('orderId')
        .not()
        .isEmpty()
        .custom((input : string) => {
            return mongoose.Types.ObjectId.isValid(input) ;
        })
        .withMessage('Invalid order id')
    ] ,
    validateRequest ,
    async (req : Request , res : Response , next : NextFunction) => {
        const orderId = req.params.orderId ;
        const order = await Order.findById(orderId).populate('ticket') ;
        if(!order) {
            throw new NotFoundError() ;
        }
        if(order.userId.toString() !== req.currentUser!.id) {
            throw new NotAuthorizedError() ;
        } 

        order.status = OrderStatus.Cancelled ;
        await order.save() ;

        // publush event order:cancelled
        const publisher = new OrderCancelledPublisher(natsWrapper.client) ;
        await publisher.publish({
            id : order._id.toString() ,
            version : order.version ,
            ticket : {
                id : order.ticket._id.toString()
            }
        })
        return res.status(204).json() ;
    }  
)


export {router as deleteOrderRouter} ;