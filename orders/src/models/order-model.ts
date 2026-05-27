import mongoose , {Document , Model } from "mongoose";
import { OrderStatus } from "@ahabtickets/common";
import { TicketDocument } from "./ticket-model";
export { OrderStatus } // to have on source of imports

interface OrderAttrs {
    ticket : TicketDocument
    userId : string 
    status : OrderStatus
    expiresAt : Date
}

interface OrderModel extends Model<OrderDocument> {
    build(attrs : OrderAttrs) : OrderDocument
}

interface OrderDocument extends Document {
    ticket : TicketDocument
    userId : string
    status : OrderStatus
    expiresAt : Date
    version : number
}

const orderSchema = new mongoose.Schema ({
    userId : {
        type : String ,
        required : true 
    } ,
    status : {
        type : String ,
        required : true ,
        enum : Object.values(OrderStatus) ,
        default : OrderStatus.Created
    } ,
    ticket : {
        type : mongoose.Schema.Types.ObjectId ,
        required : true ,
        ref : 'Ticket'
    } ,
    expiresAt : {
        type : mongoose.Schema.Types.Date ,
        required : false
    }
} , {
    toJSON : {
        transform (doc , ret : any) {
            ret.id = ret._id ;
            delete ret._id ;
        }
    } ,
    optimisticConcurrency : true
})
orderSchema.set('versionKey' , 'version') ;

orderSchema.statics.build = (attrs : OrderAttrs) => {
    return new Order(attrs) ;
}


const Order = mongoose.model<OrderDocument , OrderModel>('Order' , orderSchema) ;
export default Order  ;
