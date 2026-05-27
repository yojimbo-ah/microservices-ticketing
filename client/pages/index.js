import axios from "axios";
import buildClient from "../api/build-client";
const LandingPage = ({currentUser}) => {

    console.log(currentUser) ;
    if (currentUser) {
        return <div>
            you are signed in
        </div>
    }

    return <div>
        you have to sign in 
    </div>
}

LandingPage.getInitialProps = async ({req}) => {
    console.log('currently at server side')
    
}

export default LandingPage ;