import { authAdmin } from "../database/connectioDBAdimin.js"

export async function authenticateToken(req, res, next) {
    console.log("entrei authenticateToken")

    const jwt = req.headers.authorization?.split(" ")[1]; // Extrai o token do formato "Bearer TOKEN"
    if (!jwt) {
        res.status(401).json({ message: "Usuário não autorizado" });
        return;
    }

    try {
        const decodedIdToken = await authAdmin.verifyIdToken(jwt, true);
        req.user = { uid: decodedIdToken.sub };
        next();
    } catch (e) {
        console.error("Erro ao verificar token:", e);
        res.status(401).json({ message: "Usuário não autorizado" });
    }
}
