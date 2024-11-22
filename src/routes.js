import express from "express";

import { TransactionController } from "./transaction/controller.js";
import { authenticateToken } from "./middlewares/authenticate-jwt.js";

const transactionController = new TransactionController();
const router = express.Router()

router.get('/', authenticateToken, transactionController.teste)

router.post('/registerProject', authenticateToken, transactionController.registerProject)
router.get('/listUserProjects', authenticateToken, transactionController.listUserProjects)
router.post('/getProjectById', authenticateToken, transactionController.getProjectById)
router.put('/updateProject', authenticateToken, transactionController.updateProject)
router.delete('/deleteProject/:id', authenticateToken, transactionController.deleteProject)
router.get('/listUserLogs', authenticateToken, transactionController.listUserLogs)


export default router;