import express from 'express'
import router from './routes/getLink.js'
import bodyParser from 'body-parser' 

const app = express()

app.use(express.json())
app.use(bodyParser.json())

app.use('/I/want',router)

app.listen(5001,()=>{

         console.log("app istning on port 5001")
})