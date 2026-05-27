import express , {Request , Response , NextFunction } from "express" ;
import { NotAuthorizedError, NotFoundError, requireAuth , validateRequest } from "@ahabtickets/common";
import {param} from "express-validator" ;
import mongoose from "mongoose" ;
import Order from "../models/order-model";
const router = express.Router() ;
router.get('/api/orders/:orderId' , 
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
        if (!order) {
            throw new NotFoundError() ;
        }
        
        if (order.userId.toString() !== req.currentUser!.id) {
            throw new NotAuthorizedError() ;
        }

        res.send({order : order}) ;
    }
)


export {router as showOrderRouter} ;