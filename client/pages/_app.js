import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import { Header } from '../components/header';


 const AppComponent = ({ Component, pageProps , currentUser }) => {
    return <div>
        <Header currentUser={currentUser}/>
        <Component {...pageProps} currentUser={currentUser}/>
    </div>
}


AppComponent.getInitialProps = async ({Component , ctx}) => {
    const {req } = ctx
    const client = buildClient({req}) ;
    const {data} =  await client.get('/api/users/currentUser') ;
    // excutes the getIntialProps for the the components (sub ones)
    let pageProps = {} ;
    if (Component.getInitialProps) {
        pageProps = await Component.getInitialProps(ctx) ;
    }
    console.log(pageProps) ;
    return {currentUser : data.currentUser , pageProps} ;
}
export default AppComponent ;