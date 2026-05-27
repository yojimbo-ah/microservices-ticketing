import express from "express" ;
import 'express-async-errors';
import { errorHandler , NotFoundError , currentUser , requireAuth} from "@ahabtickets/common" ;
import cookieSession from "cookie-session";
import { newPaymentRouter } from "./routes/new";


const app = express() ;

app.set('trust proxy' , true) ;
app.use(express.json()) ;

app.use(
    cookieSession({
        signed : false ,
        secure : false ,
    })
)

app.use(currentUser) ;
app.use(newPaymentRouter) ;


app.all('*' , async () => {
    throw new NotFoundError() ;
})
app.use(errorHandler) ; 

export default app ;