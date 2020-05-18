const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/tasks')
const {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase,
    deleteUserOne,
    deleteTaskDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

//create task
test('Should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            title: "Sample Task",
            description: 'From my test'
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

//filter task
test('Should fetch all completed user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .query({completed: true})
        .send()
        .expect(200)
    expect(response.body.length).toEqual(1)
})

test('Should fetch user tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)
})

//delete a task - other user
test('Should not delete other users tasks', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

//delete a task
test('Should delete tasks', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const task = await Task.findById(taskOne._id)
    expect(task).toBeNull()
})

//read a task
test('Should read task', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
        expect(response.body.task.title).toEqual(taskOne.title)
})

//read a task - otehr user
test('Should not read other users task', async () => {
    await request(app)
        .get(`/tasks/${taskThree._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

//update task-- locked props
test('Should not update invalid properties', async () => {
    const response = await request(app)
   .patch(`/tasks/${taskOne._id}`)
   .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
   .send({
       title:'Update Title'
   })
   .expect(400)
   expect(response.body.error).toEqual('Invalid updates!!!')
})

test('Should update task', async () => {
    const response = await request(app)
   .patch(`/tasks/${taskOne._id}`)
   .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
   .send({
       description:'Update Description'
   })
   .expect(200)
   expect(response.body.task.description).toEqual('Update Description')
})

test('Should update task of other user', async () => {
    await request(app)
   .patch(`/tasks/${taskOne._id}`)
   .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
   .send({
       description:'Update Description'
   })
   .expect(404);
})

//all catch error test
test('401 response in create task if user not found', async () => {
    await deleteUserOne();
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(401)
})

test('400 response in create task if task db not found', async () => {
    await deleteTaskDatabase();
    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(400)
})