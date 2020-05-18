const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/users');
const {
    userOneId,
    userOne,
    setupDatabase
} = require('./fixtures/db');

describe('All Success Scenario [2X response]', () => {
    beforeEach(setupDatabase);

    describe('Registration', () => {
        it('Should signup a new user', async () => {
            const response = await request(app).post('/signup').send({
                name: 'Demo User3',
                email: 'sample3@example.com',
                password: 'Test@1234',
                age: 25
            }).expect(201);

            // Assert that the database was changed correctly
            const user = await User.findById(response.body.user._id);
            expect(user).not.toBeNull();

            // Assertions about the response
            expect(response.body).toMatchObject({
                user: {
                    name: 'Demo User3',
                    email: 'sample3@example.com',
                },
                token: user.tokens[0].token
            });
            expect(user.password).not.toBe('Test@1234');
        });
    });

    describe('Login', () => {
        it('Should login existing user', async () => {
            const response = await request(app).post('/login').send({
                email: userOne.email,
                password: userOne.password
            }).expect(200);
            const user = await User.findById(userOneId);
            expect(response.body.token).toBe(user.tokens[1].token);
        });
    });

    describe('Logout', () => {
        it('Should logout existing user after login', async () => {
            await request(app)
                .post('/logout')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
            const user = await User.findOne({
                email: userOne.email
            });
            const activeTokens = user.tokens.filter((tokens) => {
                return tokens.token === userOne.tokens[0].token;
            });
            const activeTokensSize = activeTokens.length;
            expect(activeTokensSize).toBe(0);
        });

        it('Should logout from all active device', async () => {
            await request(app)
                .post('/logout/all')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
            const user = await User.findOne({
                email: userOne.email
            });
            const tokensSize = user.tokens.length;
            expect(tokensSize).toBe(0);
        });

        it('Should logout from all other active device', async () => {
            await request(app)
                .post('/logout/other')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(200);
            const user = await User.findOne({
                email: userOne.email
            });
            const activeTokens = user.tokens.filter((tokens) => {
                return tokens.token === userOne.tokens[0].token;
            });
            const tokensSize = user.tokens.length;
            expect(tokensSize).toBe(1);
            expect(activeTokens[0].token).toBe(userOne.tokens[0].token)
        });
    });
});

describe('All validation failure scneario [4X response]', () => {
    beforeEach(setupDatabase);

    describe('Registration', () => {
        it('Should not signup if user has invalid email', async () => {
            await request(app).post('/signup').send({
                name: 'Demo User3',
                email: 'sample3@.com',
                password: 'Test@1234',
                age: 25
            }).expect(400);
        });

        it('Should not signup if user provide <password> as password', async () => {
            await request(app).post('/signup').send({
                name: 'Demo User3',
                email: 'sample3@emaple1.com',
                password: 'password',
                age: 25
            }).expect(400);
        })
    })
    describe('Login', () => {
        it('Should not login for incrrect credential', async () => {
            const response = await request(app).post('/login').send({
                email: userOne.email + '.in',
                password: userOne.password
            }).expect(400);
            expect(response.body.error).toBe('unable to login');
        });

        it('Should not login nonexistent user', async () => {
            await request(app).post('/login').send({
                email: userOne.email,
                password: 'thisisnotmypass'
            }).expect(400);
        });
    });
});

describe('All server failure scenario [5X response]', () => {
    describe('Logout', () => {
        it('Should not logout from any active device', async () => {
            await setupDatabase();
            await request(app)
                .post('/logout/testdata')
                .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
                .send()
                .expect(500);
        });
    });
});
