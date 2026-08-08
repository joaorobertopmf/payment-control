const request = require('supertest');

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

const LOGIN_MUTATION = `mutation Login($email: String!, $senha: String!) {
    login(email: $email, senha: $senha) {
        token
    }
}`;

let tokenEmCache = null;

async function obterToken({ email = 'admin@admin.com', senha = '123456' } = {}) {
    if (tokenEmCache) return tokenEmCache;

    const resposta = await request(BASE_URL)
        .post('/graphql')
        .send({
            query: LOGIN_MUTATION,
            variables: { email, senha }
        });

    const token = resposta.body?.data?.login?.token;
    if (!token) {
        throw new Error(`Falha ao autenticar para os testes: ${JSON.stringify(resposta.body)}`);
    }

    tokenEmCache = token;
    return tokenEmCache;
}

function limparToken() {
    tokenEmCache = null;
}

module.exports = { BASE_URL, obterToken, limparToken };
