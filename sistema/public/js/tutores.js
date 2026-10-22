// ============================================================
// public/js/tutores.js
// ============================================================
// ESTE ARQUIVO É COM VOCÊ (ALUNO DESENVOLVE).
//
// A estrutura abaixo (elementos, eventos já conectados, nomes de
// função) já está pronta para vocês seguirem o mesmo padrão usado
// em outros projetos do curso (inicializar() no topo, funções
// carregarX() e renderizarX() separadas). O que falta é o conteúdo
// de cada função marcada com TODO.
//
// EXEMPLOS DE APOIO (pasta exemplos/):
//   - exemplo-montar-tela.js : desenhar a tabela, botões Editar e
//                              Excluir, levar os dados para o formulário
//   - exemplo-fetch.js       : todos os tipos de fetch (GET, busca,
//                              POST, PUT e DELETE)
//
// Requisitos envolvidos neste arquivo: RF-12, RF-13, RF-14, RF-15, RF-17
// ============================================================

const corpoTabela = document.getElementById('corpo-tabela-tutores');
const tabela = document.getElementById('tabela-tutores');
const mensagemTutores = document.getElementById('mensagem-tutores');

const inputBusca = document.getElementById('input-busca');
const btnBuscar = document.getElementById('btn-buscar');

const formTutor = document.getElementById('form-tutor');
const tutorIdInput = document.getElementById('tutor-id');
const tutorNomeInput = document.getElementById('tutor-nome');
const tutorCpfInput = document.getElementById('tutor-cpf');
const tutorTelefoneInput = document.getElementById('tutor-telefone');
const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');

let listaTutores = [];

inicializar();

async function inicializar() {
    await carregarTutores();
}

function escaparHTML(texto) {
    return String(texto ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ------------------------------------------------------------
// RF-12: listar tutores
// RF-14: também é usada para a busca (aceita um termo opcional)
// ------------------------------------------------------------
async function carregarTutores(termoBusca = '') {
    try {
        let url = '/api/tutores';
        if (termoBusca) {
            url += '?busca=' + encodeURIComponent(termoBusca);
        }

        const resposta = await fetch(url);

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }
        if (!resposta.ok) {
            throw new Error('Resposta inválida do servidor');
        }

        const tutores = await resposta.json();
        listaTutores = tutores;
        renderizarTutores(tutores);

    } catch (erro) {
        mensagemTutores.textContent = 'Erro ao carregar tutores.';
        mensagemTutores.classList.remove('d-none');
        console.error(erro);
    }
}

// ------------------------------------------------------------
// Desenha a tabela de tutores na tela
// ------------------------------------------------------------
function renderizarTutores(tutores) {
    if (tutores.length === 0) {
        mensagemTutores.textContent = 'Nenhum tutor encontrado.';
        mensagemTutores.classList.remove('d-none');
        tabela.classList.add('d-none');
        corpoTabela.innerHTML = '';
        return;
    }

    mensagemTutores.classList.add('d-none');
    tabela.classList.remove('d-none');

    corpoTabela.innerHTML = tutores.map((tutor) => `
        <tr>
            <td>${escaparHTML(tutor.nome)}</td>
            <td>${escaparHTML(tutor.cpf)}</td>
            <td>${escaparHTML(tutor.telefone)}</td>
            <td class="tabela-acoes">
                <button class="btn btn-sm btn-warning btn-editar" data-id="${tutor.id}">Editar</button>
                <button class="btn btn-sm btn-danger btn-excluir" data-id="${tutor.id}">Excluir</button>
            </td>
        </tr>
    `).join('');

    corpoTabela.querySelectorAll('.btn-editar').forEach((botao) => {
        botao.addEventListener('click', () => {
            const tutor = listaTutores.find((t) => t.id === Number(botao.dataset.id));
            preencherFormularioParaEdicao(tutor);
        });
    });

    corpoTabela.querySelectorAll('.btn-excluir').forEach((botao) => {
        botao.addEventListener('click', () => {
            excluirTutor(botao.dataset.id);
        });
    });
}

// ------------------------------------------------------------
// RF-14: busca
// ------------------------------------------------------------
btnBuscar.addEventListener('click', () => {
    const termo = inputBusca.value.trim();
    carregarTutores(termo);
});

// ------------------------------------------------------------
// RF-15 / RF-17: salvar (inserir novo ou editar existente)
// ------------------------------------------------------------
formTutor.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const tutor = {
        nome: tutorNomeInput.value.trim(),
        cpf: tutorCpfInput.value.trim(),
        telefone: tutorTelefoneInput.value.trim()
    };

    const id = tutorIdInput.value;

    try {
        const url = id ? `/api/tutores/${id}` : '/api/tutores';
        const metodo = id ? 'PUT' : 'POST';

        const resposta = await fetch(url, {
            method: metodo,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tutor)
        });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!resposta.ok) {
            const dados = await resposta.json();
            alert(dados.erro || 'Erro ao salvar tutor.');
            return;
        }

        formTutor.reset();
        tutorIdInput.value = '';
        btnCancelarEdicao.classList.add('d-none');
        await carregarTutores();

    } catch (erro) {
        alert('Erro ao salvar tutor.');
        console.error(erro);
    }
});

btnCancelarEdicao.addEventListener('click', () => {
    formTutor.reset();
    tutorIdInput.value = '';
    btnCancelarEdicao.classList.add('d-none');
});

// ------------------------------------------------------------
// Chamada pelos botões "Editar" criados em renderizarTutores()
// ------------------------------------------------------------
function preencherFormularioParaEdicao(tutor) {
    tutorIdInput.value = tutor.id;
    tutorNomeInput.value = tutor.nome;
    tutorCpfInput.value = tutor.cpf;
    tutorTelefoneInput.value = tutor.telefone || '';
    btnCancelarEdicao.classList.remove('d-none');
    tutorNomeInput.focus();
}

// ------------------------------------------------------------
// RF-13: excluir tutor
// Chamada pelos botões "Excluir" criados em renderizarTutores()
// ------------------------------------------------------------
async function excluirTutor(id) {
    if (!confirm('Deseja realmente excluir este tutor?')) return;

    try {
        const resposta = await fetch(`/api/tutores/${id}`, { method: 'DELETE' });

        if (resposta.status === 401) {
            window.location.href = '/login.html';
            return;
        }

        if (!resposta.ok) {
            const dados = await resposta.json();
            alert(dados.erro || 'Erro ao excluir tutor.');
            return;
        }

        await carregarTutores();

    } catch (erro) {
        alert('Erro ao excluir tutor.');
        console.error(erro);
    }
}
