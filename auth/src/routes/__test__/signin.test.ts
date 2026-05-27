import request from "supertest"
import app from "../../app"


it('returs 400 and user not found' , async () => {
    await request(app)
    .post('/api/users/signin')
    .send({
        email : "test@test.com" ,
        passwod : "kakds"
    })
    .expect(400)
})

it('returns 400 creates a accout and falsy sign in info' , async () => {
    const cookie = await getAuthCookie() ;
    expect(cookie).toBeDefined() ;

    const response2 = await request(app)
    .post('/api/users/signin')
    .send({
        email : "test@test.com" ,
        password : "pasjaskd"
    })
    .expect(400)
})

it('retruns 201 creates a accout and signs into it , sets a cookie' , async () => {
    const cookie = await getAuthCookie() ;
    expect(cookie).toBeDefined() ;

    const response2 = await request(app)
    .post('/api/users/signin')
    .send({
        email : "test@test.com" ,
        password : "password"
    })
    .expect(201)
    expect(response2.get('Set-Cookie')).toBeDefined()
})