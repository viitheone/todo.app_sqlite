import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import { hasUncaughtExceptionCaptureCallback } from 'process'

const router = express.Router()

// Register a new user enpoint /auth/register
router.post('/register', (req, res) => {
    const { username, password } = req.body
    //encrypt password
    const hashedPassword = bcrypt.hashSync(password, 10)

    // save the new user and hashed password to the db
    try {
        const insertUser = db.prepare(`INSERT INTO user (username, password) VALUES(?,?)`)
        const result = insertUser.run(username, hashedPassword)

        // add default todo to new user
        const defaultTodo = `Hello! Add your First todo :)`
        const insertTodo = db.prepare(`INSERT INTO todos (user_id, task) VALUES(?, ?)`)
        insertTodo.run(result.lastInsertRowid, defaultTodo)

        // create a token
        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch(err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

//User login endpoint /auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body
    try {
        const getUser = db.prepare(`SELECT * FROM user WHERE username = ?`)
        const user = getUser.get(username)

        // user not found
        if(!user) { return res.status(404).send({ message: "User not found." }) }

        const passwordIsValid = bcrypt.compareSync(password, user.password)
        // if password doesnt match
        if(!passwordIsValid) { return res.status(401).send({ message: "Invalid password" }) }

        //successful auth
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch (err) {
        console.log(err.message)
        res.sendStatus(503)
    }
})

export default router