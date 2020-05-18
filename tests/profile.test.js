const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/users')
const {
    userOneId,
    userOne,
    setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

async function uploadProfilePic() {
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

//get profile- invalid token
test('Should not get profile for invalid user', async () => {
    const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}2009`)
        .send()
        .expect(401);

    expect(response.body.error).toEqual('Authorization failure');
})

//get profile- invalid user
test('Should not get profile for unauthenticate user', async () => {
    const response = await request(app)
        .get('/users/me')
        .send()
        .expect(401);

    expect(response.body.error).toEqual('Authorization failure');
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
    const response = await request(app)
        .delete('/users/me')
        .send()
        .expect(401);

    expect(response.body.error).toEqual('Authorization failure');
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

test('Should not update profile- failed validation', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            age: '9'
        })
        .expect(400)
})

//upload profile photo- invalid user
test('Should not upload avatar image for unauthenticate user', async () => {
    const response = await request(app)
        .post('/users/me/avatar')
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(401);

    expect(response.body.error).toEqual('Authorization failure');
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
    const response = await request(app)
        .delete('/users/me/avatar')
        .expect(401);

    expect(response.body.error).toEqual('Authorization failure');
})

//upload profile photo- invalid file type
test('Should not upload avatar image if file type is not correct', async () => {
    const response = await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/testfile.txt')
        .expect(400);

    expect(response.body.error).toEqual('Please upload an image');
})

//get public profile photo
test('Should get public profile photo', async () => {
    await uploadProfilePic();
    await request(app)
        .get(`/users/${userOneId}/avatar`)
        .expect(200);
})

test('Should get public profile photo for invalid id', async () => {
    await uploadProfilePic();
    await request(app)
        .get(`/users/989090384098390884095890/avatar`)
        .expect(404);
})

//all catch error test