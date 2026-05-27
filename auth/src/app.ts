import express from "express" ;
import 'express-async-errors';
import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/singup";
import { errorHandler , NotFoundError } from "@ahabtickets/common" ;
import cookieSession from "cookie-session";

const app = express() ;

app.set('trust proxy' , true) ;
app.use(express.json()) ;
app.use(
    cookieSession({
        signed : false ,
        secure : false ,
    })
)
app.use(currentUserRouter) ;
app.use(signInRouter) ;
app.use(signOutRouter) ;
app.use(signUpRouter) ;

app.all('*' , async () => {
    throw new NotFoundError() ;
})
app.use(errorHandler) ; 

export default app ;