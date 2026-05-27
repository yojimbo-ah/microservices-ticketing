import express , {Request , Response , NextFunction } from "express" ;
import { requireAuth , validateRequest } from "@ahabtickets/common";
import Order from "../models/order-model";


const router = express.Router() ;
router.get('/api/orders' , 
    requireAuth ,
    async (req : Request , res : Response , next : NextFunction) => {
        const orders = await Order.find({userId : req.currentUser!.id}).populate('ticket') ;
        res.status(200).json({orders : orders}) ;
    }
)


export {router as showOrdersRouter} ;