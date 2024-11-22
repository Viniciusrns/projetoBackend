import admin from 'firebase-admin';


export class TransactionRepository {

    findByUserUid(uid) {
        return admin.firestore()
            .collection('transactions')
            .where('user.uid', '==', uid)
            .orderBy('date', 'desc')
            .get()
            .then(snapshot => {
                return snapshot.docs.map(doc => ({
                    ...doc.data(),
                    uid: doc.id
                }))
            })
    }

    teste() {
        return admin.firestore()
            .collection('Teste')
            .get()
            .then(snapshot => {
                return snapshot.docs.map(doc => ({
                    ...doc.data(),
                    uid: doc.id
                }))
            })
            .catch(error => {
                throw {
                    code: 500,
                    message: 'Erro ao buscar todas as transações: ' + error.message
                };
            });
    }
}