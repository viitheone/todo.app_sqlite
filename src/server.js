import express from "express"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import authRoutes from './routes/authRoutes.js'
import todoRoutes from './routes/todoRoutes.js'
import authMidware from "./midware/authMidware.js"

const app = express()
const PORT = process.env.PORT || 6969
//get file path from the url of the current module
const __filename = fileURLToPath(import.meta.url)
//get directory name from the file path
const __dirname = dirname(__filename)

//middleware
app.use(express.json())
//tells express to serve all files from public folder as static assets.
app.use(express.static(path.join(__dirname, '../public')))

app.get(`/`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

//Routes
app.use('/auth', authRoutes)
app.use('/todos', authMidware, todoRoutes)
app.listen(PORT, () => {
    console.log(`Server has started on ${PORT}.`)
})
