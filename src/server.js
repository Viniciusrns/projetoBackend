import express from 'express';
import cors from 'cors';
import router from './routes.js';



const server = express()
server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))


server.use('/', router)

server.listen(process.env.PORT || 3001 || 80, () => {
    console.log('\n\n ✔️   servidor rodando ✔️\n')
})