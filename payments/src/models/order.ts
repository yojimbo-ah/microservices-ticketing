import mongoose , {Document , Model } from "mongoose";
import { OrderStatus } from "@ahabtickets/common";
export { OrderStatus } // to have on source of imports

interface OrderAttrs {
    userId : string 
    status : OrderStatus
    version : number 
    price : number
    id : string
}

interface OrderModel extends Model<OrderDocument> {
    build(attrs : OrderAttrs) : OrderDocument
}

interface OrderDocument extends Document {
    userId : string
    status : OrderStatus
    version : number
    price : number
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
    } ,
    price : {
        type : Number ,
        required : true 
    } ,
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
    return new Order({
        _id : attrs.id ,
        price : attrs.price ,
        status : attrs.status ,
        userId : attrs.userId ,
        version : attrs.version
    }) ;
}


const Order = mongoose.model<OrderDocument , OrderModel>('Order' , orderSchema) ;
export default Order  ;
