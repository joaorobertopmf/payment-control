const request = require('supertest');
const { expect } = require('chai');
const { BASE_URL, obterToken } = require('../../support/auth');

const CRIAR_FUNCIONARIO_MUTATION = `mutation CriarFuncionario($input: CriarFuncionarioInput!) {
    criarFuncionario(input: $input) {
        id
        cpf
        nome
        salario_base
        admissao
        desligamento
    }
}`;

const EXCLUIR_FUNCIONARIO_MUTATION = `mutation ExcluirFuncionario($id: ID!) {
    excluirFuncionario(id: $id)
}`;

describe('Mutation: CriarFuncionario', () => {
    let token;
    const funcionariosCriados = [];

    before(async () => {
        token = await obterToken();
    });

    after(async () => {
        for (const id of funcionariosCriados) {
            await request(BASE_URL)
                .post('/graphql')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    query: EXCLUIR_FUNCIONARIO_MUTATION,
                    variables: { id }
                });
        }
        funcionariosCriados.length = 0;
    });

    it('Deve criar um funcionário quando preencho os campos obrigatórios de forma válida', async () => {
        const funcionario = {
            admissao: '2026-08-08',
            cpf: '20054610087',
            desligamento: null,
            nome: 'João Roberto Parente Mendes Filho',
            salario_base: 6000
        };

        const resposta = await request(BASE_URL)
            .post('/graphql')
            .set('Authorization', `Bearer ${token}`)
            .send({
                query: CRIAR_FUNCIONARIO_MUTATION,
                variables: { input: funcionario }
            });

        if (resposta.body.data?.criarFuncionario?.id) {
            funcionariosCriados.push(resposta.body.data.criarFuncionario.id);
        }

        expect(resposta.statusCode).to.equal(200);
        expect(resposta.body.data.criarFuncionario).to.have.property('id');
        expect(resposta.body.data.criarFuncionario).to.have.property('cpf', funcionario.cpf);
        expect(resposta.body.data.criarFuncionario).to.have.property('nome', funcionario.nome);
        expect(resposta.body.data.criarFuncionario).to.have.property('salario_base', funcionario.salario_base);
        expect(resposta.body.data.criarFuncionario).to.have.property('admissao', funcionario.admissao);
        expect(resposta.body.data.criarFuncionario).to.have.property('desligamento', null);
    });

    it('Não deve criar um funcionário quando não envio o token de autenticação', async () => {
        const resposta = await request(BASE_URL)
            .post('/graphql')
            .send({
                query: CRIAR_FUNCIONARIO_MUTATION,
                variables: {
                    input: {
                        cpf: '12345678901',
                        nome: 'Funcionário de Teste',
                        salario_base: 3500.5,
                        admissao: '2024-01-15'
                    }
                }
            });

        expect(resposta.statusCode).to.equal(200);
        expect(resposta.body.errors[0]).to.have.property('message', 'Autenticação obrigatória.');
    });
});
