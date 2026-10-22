// ============================================================
// public/js/agendamentos.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// Requisitos envolvidos: RF-19 (listar ordenado, com dados de
// tutor e pet) e RF-20 (atualizar data de um agendamento).
//
// Sugestão de estrutura por linha da tabela: cada linha mostra
// os dados do agendamento, e na coluna "Ações" um campo de data
// (input type="date", já preenchido com a data atual do
// agendamento) mais um botão "Salvar" - ao clicar, atualiza
// aquele agendamento. Isso evita precisar de modal/popup.
//
// EXEMPLOS DE APOIO (pasta exemplos/):
//   - exemplo-montar-tela.js : desenhar a tabela e formatar datas
//   - exemplo-fetch.js       : GET, PUT e os demais tipos de fetch
// ============================================================

const corpoTabela = document.getElementById('corpo-tabela-agendamentos');
const tabela = document.getElementById('tabela-agendamentos');
const mensagemAgendamentos = document.getElementById('mensagem-agendamentos');

inicializar();

async function inicializar() {
    await carregarAgendamentos();
}

function escaparHTML(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function paraInputDate(data) {
    return String(data).slice(0, 10);
}

function formatarDataBR(data) {
    return paraInputDate(data).split('-').reverse().join('/');
}

// ------------------------------------------------------------
// RF-19: listar agendamentos ordenados por data, com dados de
// pet e tutor (join)
// ------------------------------------------------------------
async function carregarAgendamentos() {
    try {
        const resposta = await fetch('/api/agendamentos');

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        if (!resposta.ok) {
            throw new Error('Resposta inválida do servidor');
        }

        const agendamentos = await resposta.json();
        renderizarAgendamentos(agendamentos);

    } catch (erro) {
        mensagemAgendamentos.textContent = 'Erro ao carregar agendamentos.';
        mensagemAgendamentos.classList.remove('d-none');
        console.error(erro);
    }
}

function renderizarAgendamentos(agendamentos) {
    if (agendamentos.length === 0) {
        mensagemAgendamentos.textContent = 'Nenhum agendamento encontrado.';
        mensagemAgendamentos.classList.remove('d-none');
        tabela.classList.add('d-none');
        corpoTabela.innerHTML = '';
        return;
    }

    mensagemAgendamentos.classList.add('d-none');
    tabela.classList.remove('d-none');

    corpoTabela.innerHTML = agendamentos.map((ag) => `
        <tr>
            <td>${formatarDataBR(ag.data_agendamento)}</td>
            <td>${escaparHTML(ag.pet_nome)}</td>
            <td>${escaparHTML(ag.pet_especie)}</td>
            <td>${escaparHTML(ag.tutor_nome)}</td>
            <td>${escaparHTML(ag.tutor_telefone)}</td>
            <td>${escaparHTML(ag.observacao)}</td>
            <td class="tabela-acoes">
                <input type="date" value="${paraInputDate(ag.data_agendamento)}" data-id="${ag.id}">
                <button class="btn btn-sm btn-primary btn-salvar" data-id="${ag.id}">Salvar</button>
            </td>
        </tr>
    `).join('');

    corpoTabela.querySelectorAll('.btn-salvar').forEach((botao) => {
        botao.addEventListener('click', () => {
            const id = botao.dataset.id;
            const campoData = corpoTabela.querySelector(`input[type="date"][data-id="${id}"]`);
            atualizarDataAgendamento(id, campoData.value);
        });
    });
}

// ------------------------------------------------------------
// RF-20: atualizar a data de um agendamento
// Chamada pelos botões "Salvar" criados em renderizarAgendamentos()
// ------------------------------------------------------------
async function atualizarDataAgendamento(id, novaData) {
    if (!novaData) {
        alert('Informe uma data válida.');
        return;
    }

    try {
        const resposta = await fetch(`/api/agendamentos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data_agendamento: novaData })
        });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!resposta.ok) {
            const dados = await resposta.json();
            alert(dados.erro || 'Erro ao atualizar data do agendamento.');
            return;
        }

        alert('Data atualizada com sucesso!');
        await carregarAgendamentos();

    } catch (erro) {
        alert('Erro ao atualizar data do agendamento.');
        console.error(erro);
    }
}
