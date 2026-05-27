import request from "supertest" ;
import app from "../../app" ;


it('returns 200 and sets cookie to null' , async () => {
    const cookie = await getAuthCookie() ;
    expect(cookie).toBeDefined() ;

    const response2 = await request(app) 
    .post('/api/users/signout')
    .send({})
    .expect(200) ;

    // when we set the session to be null at the signout 
    // controller we are really not just putting null
    // we are saving this array that crypts the session
    // as value of nothing and expiry data of 1970 way back
    // http only is because i used not secure in cookie-session config
    // more details in app.js
    expect(response2.get('Set-Cookie')).toEqual([ 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly' ])
})