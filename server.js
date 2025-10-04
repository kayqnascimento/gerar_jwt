

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const qs = require('qs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/gerarTokenUnico', async (req, res) => {
    const logPrefix = '[Gerar Token]';
    console.log(`${logPrefix} Requisição recebida.`);

    try {
        const accessToken = await getUnicoAccessToken();
        
        res.status(200).json({
            access_token: accessToken
        });

    } catch (err) {
        res.status(500).json({ error: 'Falha ao gerar o access_token da Unico.' });
    }
});

app.post(
    '/converterParaBase64',
    express.raw({ type: '*/*', limit: '50mb' }),
    (req, res) => {
        const logPrefix = '[Conversor Base64]';
        
        try {
            const binaryData = req.body;
            if (!binaryData || binaryData.length === 0) {
                return res.status(400).json({ error: 'Corpo da requisição vazio. Nenhum dado binário foi enviado.' });
            }

            const filename = req.headers['x-filename'] || 'arquivo_desconhecido';
            console.log(`${logPrefix} Recebido arquivo binário: ${filename}`);

            const base64String = binaryData.toString('base64');
            console.log(`${logPrefix} Conversão bem-sucedida.`);

            return res.status(200).json({
                nomeArquivoOriginal: filename,
                conteudoBase64: base64String
            });
        } catch (error) {
            console.error(`${logPrefix} Falha na conversão:`, error);
            res.status(500).json({ error: 'Erro ao converter o arquivo para Base64.' });
        }
    }
);

let cachedToken = null;
let tokenGenerationTimestamp = null;
const CACHE_VALIDITY_SECONDS = 50 * 60; 

async function getUnicoAccessToken() {
    const logPrefix = '[Auth Service]';
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (cachedToken && tokenGenerationTimestamp) {
        const tokenAgeInSeconds = nowInSeconds - tokenGenerationTimestamp;
        if (tokenAgeInSeconds < CACHE_VALIDITY_SECONDS) {
            console.log(`${logPrefix} Retornando token do cache interno. Idade: ${tokenAgeInSeconds}s.`);
            return cachedToken;
        }
    }

    console.log(`${logPrefix} Cache vazio ou expirado. Gerando novo token...`);
    
    try {
        const serviceAccount = process.env.UNICO_SERVICE_ACCOUNT;
        const tenant = process.env.UNICO_TENANT;
        const audience = process.env.UNICO_AUDIENCE;
        const privateKeyPath = '/etc/secrets/unico_private.key';
        
        let privateKey;
        if (fs.existsSync(privateKeyPath)) {
            privateKey = fs.readFileSync(privateKeyPath, 'utf8');
        } else if (process.env.UNICO_PRIVATE_KEY) {
            privateKey = process.env.UNICO_PRIVATE_KEY.replace(/\\n/g, '\n');
        }

        if (!privateKey || !serviceAccount || !tenant || !audience) {
            throw new Error('Variáveis de ambiente da Unico não configuradas.');
        }
        
        const assertionPayload = {
            iss: `${serviceAccount}@${tenant}.iam.acesso.io`,
            aud: audience,
            iat: nowInSeconds,
            exp: nowInSeconds + 3600,
            scope: "*"
        };

        const assertionToken = jwt.sign(assertionPayload, privateKey, { algorithm: 'RS256' });

        const tokenUrl = `${audience}/oauth2/token`;
        const requestBody = {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: assertionToken
        };

        const response = await axios.post(tokenUrl, qs.stringify(requestBody), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        cachedToken = response.data.access_token;
        tokenGenerationTimestamp = nowInSeconds;

        console.log(`${logPrefix} Novo token gerado e salvo no cache.`);
        return cachedToken;

    } catch (err) {
        cachedToken = null;
        tokenGenerationTimestamp = null;
        throw err;
    }
}

// --- Inicia o Servidor ---
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Microsserviço de Utilidades rodando na porta ${PORT}`);
    console.log(`=======================================================`);
    console.log('Endpoints disponíveis:');
    // AJUSTE: Logs atualizados com os novos nomes
    console.log(`  POST /gerarTokenUnico`);
    console.log(`  POST /converterParaBase64`);
});