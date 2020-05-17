const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/users')
const Task = require('../../src/models/tasks')

const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Demo User1',
    email: 'sample@example.com',
    password:"Test@1234",
    age: 25,
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.AUTH_TOKEN_KEY)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'Demo User2',
    email: 'sample1@example.com',
    password: 'myhouse099@@',
    age: 23,
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.AUTH_TOKEN_KEY)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    title: "Task1",
    description: 'First task',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    title: "Task2",
    description: 'Second task',
    completed: true,
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    title: "Task3",
    description: 'Third task',
    completed: true,
    owner: userTwo._id
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}