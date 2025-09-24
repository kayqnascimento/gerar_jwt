const express = require('express');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Configurações
const PRIVATE_KEY_PATH = `-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCoaTeFlxpgC+CA
xpgEyNVNHFU+PbL8br/RIsl/itJtGX5z1gt/II3lMMTlUU5EdhuDl+2WdvtrBFKA
EI+5V7E/ushQfpjgsBwMRvDw1tsmjGCg0K/p8BWbUrz1RXkQRqprKHDp3/LEcB8f
J8jTMmYrUPvLGAwFTOhvh7DGzCWcdvdmpJ2w9FrlY9W/WC6wtDzx9kwXDVxtirlm
j5JWGj45rZ24JXbaBDQrRhajsdd1DnLAl92L2mVoNRausA8khSyXWM6bb/Nvg0S0
UrEzgK6bu47vru3ktY/Vm01/B79gBdNGRxHmkqQDeoX8NVn7xIiDn/r8ZqVaoVJo
vDl1t7wlAgMBAAECggEADDwqp7aw2Jn8SzbCXBSgJHxCuCUg4ASGxIGfvHegLoNr
46wBBVEe5e/7WgKkakZfXNnYjbYisWVsvfeWDXvQuYXPIEP2RNqeiwjLX9/oJ36K
1Zwbr6X81940sqgDsdpEbskPHPqjZ0CTDj8kcK2IbSyywlBCrU7nUxT7U5IIyHtg
7igEn72WN/lD3ARQXD+hHzsXATQvW5tFBjL+XaSFuQ8Agvo9u6uZ1ASc6WBaJoc+
PX5ZC2207tmIsgQuoqT9EXlHsQZLXP4TZ4Pgu6XrMmVdDN40teklfTGuSzqAQIkt
c720EAqSQzuTSKFnvZaNphyTojKFlgV3aPkgBGlFeQKBgQDZJeWucBoQX8Olnzsc
02oWpKYhYNFMaXwts03Cx63tUc50Mx37dohBTphmc3/83rsbNZ6mO6HBft9Wngj1
sS+1u5g0bEJGf8Zp/s3uDuGk7zsVacW4LokpD8fm3VeVbj8r6jUD6BXfU49kr98R
AOr19PF6NTie/6cTJmh+3YOIKQKBgQDGiwBau9/mBwgCI6BBYMPRmVeguptBIVAY
NaRc50sOAFZVdk9sxMWR2/gemaUyaMNuuxO/i4pA0KvDIIi9VFSNYCLFzNavmJIT
ENquw4k64YbV6O/ON3AdChMJBwYZP2gM+JDLgtCu0Hu8kT5FfECQi694mqbrRIpO
nOjoM2bDnQKBgQCIwlhsS0fvBhEXLziwh+npxtqmbO6EXG8L7UBNKys8KuiGwGbi
p51a3CAZbiauYKygj12Svj26uqf4SmHEM0qj/zj10zTOZ8zTltmlU5QDJ3QjoVEY
FZ7m0HyKxt5RS3TXuJKZGkMkOuE1fZpUgCp6q0CmQfyeDs7vvaHUPLiJOQKBgQCb
eQ31/1j9UFQ9GJjNmXC+GU49VuNsxSFrU9Y5ygVEGY+BrPvVOOFdrttFWxu5tcAU
XfrA7Ax/ZOicDEYHvJnZe4a/TgBv0RHSTEhywjwcF672o0nmOhNZKiJt10o3Sye3
wI3iT7YKrse2iiYxU3NbvYbS8ofzg+CqXsUjz9yRIQKBgQChQIC/Oi+lheENI6Bj
3xGZuOshX5DJozlQG1NfFrzgDdSQCpPyl82oZqbLu2Dpo4XTAkYAIaYtni19haSy
AKt8hn2dqw2WIliirsBzZ9yH2JEphLyml4AtbFJEtmUR4t+s9G5LoNuQZZtQD3Qa
UW9W7uBHUj7PAOeLWrfqvPaudQ==
-----END PRIVATE KEY-----`;
const BACKEND_TOKEN_URL = 'https://identityhomolog.acesso.io/oauth2/token';
const AUDIENCE = 'https://identityhomolog.acesso.io';
const SCOPE = '*'; // ajuste conforme necessário

// Endpoint para gerar access_token
app.get('/generate-access-token', async (req, res) => {
    try {
        // Monta payload do JWT
        const payload = {
            aud: AUDIENCE,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600,
            scope: SCOPE
        };

        // Gera JWT
        const token = jwt.sign(payload, PRIVATE_KEY_PATH, { algorithm: 'RS256' });

        // Monta body x-www-form-urlencoded
        const params = new URLSearchParams();
        params.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
        params.append('assertion', token);

        // Requisita access_token
        const response = await axios.post(BACKEND_TOKEN_URL, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Retorna access_token
        res.json({ access_token: response.data.access_token });
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
        res.status(500).json({ error: 'Falha ao gerar access_token', details: err.response ? err.response.data : err.message });
    }
});

// Inicia servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Microsserviço rodando na porta ${PORT}`);
});
