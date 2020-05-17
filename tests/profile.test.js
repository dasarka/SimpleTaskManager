const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/users')
const { userOneId, userOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

async function uploadProfilePic(){
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);
}

//get profile- valid user
test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

//get profile- invalid user
test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

//delete profile- valid user
test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

//delete profile- invalid user
test('Should not delete account for unauthenticate user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

//upload profile photo- valid user
test('Should upload avatar image', async () => {
    await uploadProfilePic();
    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

//update profile - valid user
test('Should update valid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Test User1'
        })
        .expect(200)
    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Test User1')
})

//update profile - invalid user fields
test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            email: 'test@sample.com'
        })
        .expect(400)
})

//upload profile photo- invalid user
test('Should not upload avatar image for unauthenticate user', async () => {
    await request(app)
        .post('/users/me/avatar')
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(401)
})

//delete profile photo - valid user
test('Should delete avatar image', async () => {
    await uploadProfilePic();
    await request(app)
        .delete('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .expect(200);
})

//delete profile photo - invalid user
test('Should not delete avatar image for unauthenticate user', async () => {
    await uploadProfilePic();
    await request(app)
        .delete('/users/me/avatar')
        .expect(401)
})
