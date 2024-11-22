import { Transaction } from './model.js';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import admin from 'firebase-admin'; // Importando o admin para utilizar o Firebase Admin SDK
import { db } from '../database/connectioDBAdimin.js';

export class TransactionController {


    teste(req, res) {
        try {
            res.json({ msg: "Hello, World!" })
        } catch (error) {
            res.json({ error: "ERROR TESTE" })
            return
        }
    }

    // Rota para listar todos os projetos do usuário autenticado
    async listUserProjects(req, res) {
        try {
            const userId = req.user.uid;

            // Consulta para buscar todos os projetos do usuário
            const projectsQuerySnapshot = await db.collection("Projects").where("userId", "==", userId).get();

            // Se não houver projetos, retornar lista vazia
            const projectsList = [];
            if (!projectsQuerySnapshot.empty) {
                projectsQuerySnapshot.forEach(doc => {
                    projectsList.push({
                        id: doc.id, // ID do documento (projeto)
                        ...doc.data() // Dados do projeto
                    });
                });
            }

            // Retornando a lista de projetos para o cliente
            res.status(200).json({ success: true, projects: projectsList });

        } catch (error) {
            console.error("Erro ao listar projetos: ", error);
            if (!res.headersSent) {
                res.status(500).json({ error: "Erro ao listar projetos. Tente novamente mais tarde." });
            }
        }
    }
    async registerProject(req, res) {
        try {
            const {
                nameProject,
                state,
                city,
                distributor,
                tariffWithTax, // Tarifa com impostos
                powerEachModule,
                annualSunHours,
                areaEachModule,
                weightEachModule,
                averageInstalledkWp,
                account // Conta mensal de energia do usuário
            } = req.body;

            // Verifica se todos os campos obrigatórios estão preenchidos
            if (!nameProject || !state || !city || !distributor) {
                res.status(400).json({ error: "Campos obrigatórios não preenchidos" });
                return; // Garante que o código não continua
            }

            // Verifica se o projeto já existe
            const projectDocRef = db.collection("Projects").doc(`${nameProject}_${req.user.uid}`);
            const projectDoc = await projectDocRef.get();

            if (projectDoc.exists) {
                res.status(400).json({ error: "Já existe um projeto com esse nome para este usuário." });
                return; // Se o projeto já existir, retorna erro
            }

            // Criação do novo projeto
            const newProject = {
                userId: req.user.uid, // Associando o projeto ao usuário autenticado
                nameProject,
                state,
                city,
                distributor,
                tariffWithTax, // Adicionado para salvar a tarifa com impostos
                powerEachModule,
                annualSunHours,
                areaEachModule,
                weightEachModule,
                averageInstalledkWp,
                account, // Conta mensal de energia do usuário
                createdAt: admin.firestore.FieldValue.serverTimestamp() // Timestamp do servidor
            };

            // Salvando no banco de dados - Exemplo usando Firestore do Firebase Admin
            await projectDocRef.set(newProject); // Usando `set()` para criar um novo documento

            // Registrar log de criação do projeto
            await db.collection("ProjectLogs").add({
                userId: req.user.uid,
                projectId: projectDocRef.id,
                projectName: nameProject,
                action: `Projeto '${nameProject}' foi criado.`,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            res.status(201).json({ message: "Projeto registrado com sucesso!" });
        } catch (error) {
            console.error("Erro ao registrar projeto: ", error);
            if (!res.headersSent) {
                res.status(500).json({ error: "Erro ao registrar projeto. Tente novamente mais tarde." });
            }
        }
    }


    async getProjectById(req, res) {
        try {
            // Recebendo o ID do projeto pelo corpo da requisição
            const { id } = req.body;
            console.log("entrei getProjectById  id: ", id)

            // Verificando se o ID foi fornecido
            if (!id) {
                res.status(400).json({ error: "ID do projeto não fornecido." });
                return;
            }

            // Consultar o Firestore pelo ID do projeto
            const projectDoc = await db.collection("Projects").doc(id).get();

            if (!projectDoc.exists) {
                res.status(404).json({ error: "Projeto não encontrado." });
                return;
            }

            // Retornar os dados do projeto
            res.status(200).json({ project: { id: projectDoc.id, ...projectDoc.data() } });

        } catch (error) {
            console.error("Erro ao buscar projeto: ", error);
            if (!res.headersSent) {
                res.status(500).json({ error: "Erro ao buscar projeto. Tente novamente mais tarde." });
            }
        }
    }

    // Rota para editar um projeto pelo ID
    async updateProject(req, res) {
        try {
            // Recebendo o ID do projeto e os novos dados pelo corpo da requisição
            const {
                id,
                nameProject,
                state,
                city,
                distributor,
                powerEachModule,
                annualSunHours,
                areaEachModule,
                weightEachModule,
                averageInstalledkWp,
                tariffWithTax,
                account
            } = req.body;

            // Verificando se o ID foi fornecido
            if (!id) {
                res.status(400).json({ error: "ID do projeto não fornecido." });
                return;
            }

            // Consultar o Firestore pelo ID do projeto
            const projectDocRef = db.collection("Projects").doc(id);
            const projectDoc = await projectDocRef.get();

            if (!projectDoc.exists) {
                res.status(404).json({ error: "Projeto não encontrado." });
                return;
            }

            // Atualizar o documento com os novos dados
            const updatedProject = {
                nameProject,
                state,
                city,
                distributor,
                powerEachModule,
                annualSunHours,
                areaEachModule,
                weightEachModule,
                averageInstalledkWp,
                tariffWithTax,
                account,
                updatedAt: admin.firestore.FieldValue.serverTimestamp() // Adiciona um timestamp para indicar quando foi atualizado
            };

            await projectDocRef.update(updatedProject);

            // Registrar log de atualização do projeto
            const changes = Object.entries(updatedProject)
                .filter(([key, value]) => key !== 'updatedAt' && projectDoc.data()[key] !== value)
                .map(([key, value]) => `${key} = ${value}`)
                .join(", ");

            await db.collection("ProjectLogs").add({
                userId: req.user.uid,
                projectId: id,
                projectName: nameProject,
                action: `Projeto '${nameProject}' foi editado. Alterações: ${changes}`,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            // Retornar sucesso após a atualização
            res.status(200).json({ message: "Projeto atualizado com sucesso!" });

        } catch (error) {
            console.error("Erro ao atualizar projeto: ", error);
            if (!res.headersSent) {
                res.status(500).json({ error: "Erro ao atualizar projeto. Tente novamente mais tarde." });
            }
        }
    }


    // Rota para excluir um projeto pelo ID
    async deleteProject(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                res.status(400).json({ error: "ID do projeto não fornecido." });
                return;
            }

            const projectDocRef = db.collection("Projects").doc(id);
            const projectDoc = await projectDocRef.get();

            if (!projectDoc.exists) {
                res.status(404).json({ error: "Projeto não encontrado." });
                return;
            }

            const projectName = projectDoc.data().nameProject;

            // Excluir o documento do Firestore
            await projectDocRef.delete();

            // Registrar log de exclusão do projeto
            await db.collection("ProjectLogs").add({
                userId: req.user.uid,
                projectId: id,
                projectName: projectName,
                action: `Projeto '${projectName}' foi excluído.`,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            res.status(200).json({ message: "Projeto excluído com sucesso!" });

        } catch (error) {
            console.error("Erro ao excluir projeto: ", error);
            if (!res.headersSent) {
                res.status(500).json({ error: "Erro ao excluir projeto. Tente novamente mais tarde." });
            }
        }
    }

    // Rota para listar todos os logs de um usuário autenticado
    async listUserLogs(req, res) {
        try {
            const userId = req.user.uid;

            // Consulta para buscar todos os logs do usuário e ordenar pelo campo "timestamp" em ordem decrescente
            const logsQuerySnapshot = await db.collection("ProjectLogs")
                .where("userId", "==", userId)
                .get();


            // Montando a lista de logs
            const logsList = [];
            if (!logsQuerySnapshot.empty) {
                logsQuerySnapshot.forEach(doc => {
                    logsList.push({
                        id: doc.id, // ID do documento (log)
                        ...doc.data() // Dados do log
                    });
                });
            }

            logsList.sort((a, b) => {
                const timeA = a.timestamp ? a.timestamp.toDate() : new Date(0);
                const timeB = b.timestamp ? b.timestamp.toDate() : new Date(0);
                return timeB - timeA;
            });

            // Retornando a lista de logs para o cliente
            res.status(200).json({ success: true, logs: logsList });

        } catch (error) {
            console.error("Erro ao listar logs: ", error);
            if (!res.headersSent) {
                res.status(500).json({ error: "Erro ao listar logs. Tente novamente mais tarde." });
            }
        }
    }

}

