
require('dotenv').config();

const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const qs = require('qs');

const app = express();
const PORT = process.env.PORT || 3000;

app.post('/gerar-token-unico', async (req, res) => {
    const logPrefix = '[LOG Token]';
    const errorPrefix = '[ERRO Token]';
    console.log(`${logPrefix} Requisição recebida.`);

    try {
        const serviceAccount = process.env.UNICO_SERVICE_ACCOUNT;
        const tenant = process.env.UNICO_TENANT;
        const audience = process.env.UNICO_AUDIENCE;
        const privateKeyPath = '/etc/secrets/qista_hml_3f2f4d4f-6aaa-4e6e-b5a4-2a28b9580177.key';
        
        let privateKey;

        if (fs.existsSync(privateKeyPath)) {
            console.log(`${logPrefix} Lendo chave privada do Secret File do Render.`);
            privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        } else {
            console.log(`${logPrefix} Lendo chave privada das variáveis de ambiente (.env).`);
            if (process.env.UNICO_PRIVATE_KEY) {
                privateKey = process.env.UNICO_PRIVATE_KEY.replace(/\\n/g, '\n');
            }
        }

        if (!privateKey || !serviceAccount || !tenant || !audience) {
            console.error(`${errorPrefix} Variáveis de ambiente da Unico não configuradas corretamente.`);
            return res.status(500).json({ error: 'Configuração do servidor incompleta.' });
        }

        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: `${serviceAccount}@${tenant}.iam.acesso.io`,
            aud: audience,
            iat: now,
            exp: now + 3600, 
            scope: "*"
        };

        const assertionToken = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
        console.log(`${logPrefix} JWT de afirmação gerado.`);

        const tokenUrl = `${audience}/oauth2/token`;
        const requestBody = {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: assertionToken
        };

        const response = await axios.post(tokenUrl, qs.stringify(requestBody), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        
        console.log(`${logPrefix} Access token da Unico recebido com sucesso.`);
        
        res.json({ 
            access_token: response.data.access_token, 
            expires_in: response.data.expires_in 
        });

    } catch (err) {
        const errorDetails = err.response ? err.response.data : { message: err.message };
        console.error(`${errorPrefix} Falha ao gerar access_token:`, JSON.stringify(errorDetails));
        res.status(500).json({ error: 'Falha ao gerar access_token', details: errorDetails });
    }
});


app.post(
    '/converter-para-base64',
    express.raw({ type: '*/*', limit: '20mb' }),
    (req, res) => {
        const logPrefix = '[LOG Conversor]';
        const errorPrefix = '[ERRO Conversor]';
        
        try {
            const binaryData = req.body;
            if (!binaryData || binaryData.length === 0) {
                return res.status(400).json({ error: 'Corpo da requisição vazio.' });
            }

            const filename = req.headers['x-filename'] || 'nome_nao_fornecido.bin';
            console.log(`${logPrefix} Recebido arquivo binário. Nome: ${filename}`);

            const base64String = binaryData.toString('base64');
            console.log(`${logPrefix} Conversão para Base64 bem-sucedida.`);

            return res.status(200).json({
                nomeArquivoOriginal: filename,
                conteudoBase64: base64String
            });
        } catch (error) {
            console.error(`${errorPrefix} Falha inesperada:`, error);
            return res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
        }
    }
);

app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  API de Utilidades de Integração rodando na porta ${PORT}`);
    console.log(`=======================================================`);
    console.log('Endpoints disponíveis:');
    console.log(`  POST /gerar-token-unico`);
    console.log(`  POST /converter-para-base64`);
});