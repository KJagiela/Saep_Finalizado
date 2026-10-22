// ============================================================
// routes/tutores.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊS (ALUNO DESENVOLVE).
//
// A estrutura de cada rota (o "molde" com try/catch/finally e a
// conexão com o banco) já está pronta, seguindo o mesmo padrão
// usado em routes/auth.js. O que falta em cada uma é a lógica
// específica (marcada com TODO).
//
// Lembretes importantes:
//   - Cada rota abaixo já vem protegida pelo middleware
//     verificarSessao (segundo parâmetro) - vocês não precisam
//     mexer nisso, só saber que é por isso que o sistema exige
//     login para usar essas rotas.
//   - O CPF do tutor deve ser CRIPTOGRAFADO ao salvar/atualizar, e
//     DESCRIPTOGRAFADO ao listar/exibir - use as funções prontas em
//     utils/crypto-utils.js (criptografarCPF / descriptografarCPF)
//
// Veja o GUIA_DE_DESENVOLVIMENTO.md para um roteiro passo a passo
// de cada uma dessas funcionalidades.
// ============================================================

import express from 'express';
import { criarCliente } from '../config/db.js';
import { criptografarCPF, descriptografarCPF } from '../utils/crypto-utils.js';
import { verificarSessao } from '../middleware/auth-middleware.js';

const router = express.Router();


router.get('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const busca = (req.query.busca || '').trim();

        let resultado;
        if (busca) {
            resultado = await client.query(
                "SELECT * FROM tutores WHERE nome ILIKE '%' || $1 || '%' ORDER BY nome",
                [busca]
            );
        } else {
            resultado = await client.query('SELECT * FROM tutores ORDER BY nome');
        }

        const tutores = resultado.rows.map((tutor) => ({
            ...tutor,
            cpf: descriptografarCPF(tutor.cpf)
        }));

        res.json(tutores);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// POST / -> inserir novo tutor (RF-15)
// ─────────────────────────────────────────
router.post('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { nome, cpf, telefone } = req.body;

        if (!nome || !cpf) {
            return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });
        }

        const cpfCriptografado = criptografarCPF(cpf);

        const resultado = await client.query(
            'INSERT INTO tutores (nome, cpf, telefone) VALUES ($1, $2, $3) RETURNING *',
            [nome, cpfCriptografado, telefone]
        );

        const tutor = resultado.rows[0];
        res.status(201).json({ ...tutor, cpf });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// PUT /:id -> editar tutor existente (RF-17)
// ─────────────────────────────────────────
router.put('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { id } = req.params;
        const { nome, cpf, telefone } = req.body;
        
        if (!nome || !cpf) {
            return res.status(400).json({ erro: 'Nome e CPF são obrigatórios.' });
        }

        const cpfCriptografado = criptografarCPF(cpf);

        const resultado = await client.query(
            'UPDATE tutores SET nome = $1, cpf = $2, telefone = $3 WHERE id = $4 RETURNING *',
            [nome, cpfCriptografado, telefone, id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        res.json({ ...resultado.rows[0], cpf });
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// DELETE /:id -> excluir tutor (RF-13)
// ─────────────────────────────────────────
router.delete('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { id } = req.params;

        const resultado = await client.query(
            'DELETE FROM tutores WHERE id = $1',
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Tutor não encontrado.' });
        }

        res.json({ mensagem: 'Tutor removido com sucesso.' });
    } catch (erro) {
        if (erro.code === '23503') {
            return res.status(409).json({
                erro: 'Não é possível excluir: este tutor possui pets cadastrados.'
            });
        }
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

export default router;
