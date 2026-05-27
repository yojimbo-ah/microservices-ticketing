import mongoose , {Document , Model } from 'mongoose' ;

interface PaymentAttrs {
    orderId : string 
    stripeId : string
}

interface PaymentDoc extends Document {
    orderId : string 
    stripeId : string
    version : number
}

interface PaymentModel extends Model<PaymentDoc> {
    build (attrs : PaymentAttrs) : PaymentDoc
}

const paymentSchema = new mongoose.Schema({
    orderId : {
        type : String ,
        requried : true
    } ,
    stripeId : {
        type : String ,
        required : true
    } 
}, {
    toJSON : {
        transform (doc , ret : any) {
            ret.id = ret._id ;
            delete ret._id ;
        }
    } ,
    optimisticConcurrency : true
})


paymentSchema.set('versionKey' , 'version') ;

paymentSchema.statics.build = (attrs : PaymentAttrs) => {
    return new Payment(attrs) ;
}

const Payment = mongoose.model<PaymentDoc , PaymentModel>('Payment' , paymentSchema) ;

export default Payment ;
