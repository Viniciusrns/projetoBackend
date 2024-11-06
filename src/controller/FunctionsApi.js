const FunctionsApi = {

    teste: async (req, res) => {
        try {
            res.json({ msg: "Hello, World!" })
        } catch (error) {
            res.json({ error: "ERROR TESTE" })
            return
        }
    },
    teste1: async (req, res) => {
        try {
            res.json({ msg: "TESTE 11111111111111111" })
        } catch (error) {
            res.json({ error: "ERROR TESTE1" })
            return
        }
    },
    teste2: async (req, res) => {
        try {
            res.json({ msg: "TESTE 22222222222222222222222" })
        } catch (error) {
            res.json({ error: "ERROR TESTE2" })
            return
        }
    },
    teste3: async (req, res) => {
        try {
            res.json({ msg: "TESTE 3333333333333333333333" })
        } catch (error) {
            res.json({ error: "ERROR TESTE3" })
            return
        }
    }

}

export default () => FunctionsApi