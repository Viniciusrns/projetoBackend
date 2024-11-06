import express from "express";

import functionsApi from "./controller/FunctionsApi.js"

const FunctionsApi = functionsApi();
const router = express.Router()

router.get('/', FunctionsApi.teste)
router.get('/teste1', FunctionsApi.teste1)
router.get('/teste2', FunctionsApi.teste2)
router.get('/teste3', FunctionsApi.teste3)


export default router;