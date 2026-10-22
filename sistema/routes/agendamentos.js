// ============================================================
// routes/agendamentos.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊS (ALUNO DESENVOLVE).
//
// A estrutura de cada rota (o "molde" com try/catch/finally e a
// conexão com o banco) já está pronta. O que falta em cada uma é
// a lógica específica (marcada com TODO).
//
// Lembrete importante sobre o JOIN (RF-19):
//   O tutor não está diretamente ligado ao agendamento - o
//   caminho é agendamentos -> pets -> tutores. Ou seja, vocês vão
//   precisar de um JOIN passando por DUAS tabelas (pets e tutores)
//   para trazer "todos os dados do tutor e do pet" como pede o
//   requisito.
//   Veja um exemplo de JOIN com múltiplas tabelas em:
//   exemplos/exemplo-join-multiplas-tabelas.sql
//
// Veja o GUIA_DE_DESENVOLVIMENTO.md para um roteiro passo a passo.
// ============================================================

import express from 'express';
import { criarCliente } from '../config/db.js';
import { verificarSessao } from '../middleware/auth-middleware.js';

const router = express.Router();

// ─────────────────────────────────────────
// GET / -> listar agendamentos ordenados por data, com dados
// do pet e do tutor (RF-19)
// ─────────────────────────────────────────
router.get('/', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const resultado = await client.query(`
            SELECT
                a.id,
                to_char(a.data_agendamento, 'YYYY-MM-DD') AS data_agendamento,
                a.observacao,
                p.id        AS pet_id,
                p.nome      AS pet_nome,
                p.especie   AS pet_especie,
                t.id        AS tutor_id,
                t.nome      AS tutor_nome,
                t.telefone  AS tutor_telefone
            FROM agendamentos a
            INNER JOIN pets p    ON p.id = a.pet_id
            INNER JOIN tutores t ON t.id = p.tutor_id
            ORDER BY a.data_agendamento ASC, a.id ASC
        `);

        res.json(resultado.rows);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

// ─────────────────────────────────────────
// PUT /:id -> atualizar a data de um agendamento (RF-20)
// ─────────────────────────────────────────
router.put('/:id', verificarSessao, async (req, res) => {
    const client = criarCliente();
    try {
        await client.connect();

        const { id } = req.params;
        const { data_agendamento } = req.body;

        if (!data_agendamento) {
            return res.status(400).json({ erro: 'Informe a nova data do agendamento.' });
        }

        const resultado = await client.query(
            'UPDATE agendamentos SET data_agendamento = $1 WHERE id = $2 RETURNING *',
            [data_agendamento, id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({ erro: 'Agendamento não encontrado.' });
        }

        res.json(resultado.rows[0]);
    } catch (erro) {
        res.status(500).json({ erro: erro.message });
    } finally {
        await client.end();
    }
});

export default router;
