const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3000;

// Chave privada para testes (substitua pela sua)
const privateKey = `-----BEGIN PRIVATE KEY-----
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

app.get("/generate", (req, res) => {
    const now = Math.floor(Date.now() / 1000);

    // Payload com scope e exp de 1 hora
    const payload = {
        iss: "qista_hml@ea320cc0-1cf5-49f5-a140-3dc7fad2f31f.iam.acesso.io",           // issuer
        aud: "https://identityhomolog.acesso.io", // audience
        iat: now,
        exp: now + 3600,                // expira em 1 hora
        scope: "*"             // substituindo sub
    };

    try {
        const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });
        res.send(token);
    } catch (err) {
        console.error("Erro ao gerar JWT:", err);
        res.status(500).send("Erro ao gerar JWT");
    }
});

app.listen(port, () => {
    console.log(`JWT service rodando em http://localhost:${port}`);
});
