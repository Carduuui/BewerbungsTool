const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');
const process = requrie('process');
const {authenticate} = require('@google-cloud/local-auth');

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist(){
    try{
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
    }
    catch(err){
        return null;
    }
}

async function saveCredentials(client){
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize(){
    let client = await loadSavedCredentialsIfExist();
    if(client){
        return client;
    }
    client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
    });
    if(client.credentials){
        await saveCredentials(client);
    }
    return client;
}

async function createGmailClient(auth){
    try{
        const gmail = google.gmail({version: 'v1', auth});
    }
    catch(err){
        throw new Error(`Gmail-Client konnte nicht erstellt werden: ${err.message}`);
    }
}

function createEmail(to, body, pdfBuffer, filename){

    const boundary = "boundary_" + Math.random().toString(36).substring(2,9);

    const emailLines = [
        `To: ${to}`,
        'Subject: Bewerbungstabelle PDF',
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        "Content-Type: text/html; charset=utf-8",
        "",
        body,
        "",
        `--${boundary}`,
        `Content-Type: application/pdf; name="${filename}"`,
        `Content_disposition: attachment; filename="${filename}"`,
        "",
        pdfBuffer.toString('base64'),
        "",
        `--${boundary}`
    ];

    return Buffer.from(emailLines.joing('\n')).toString('base64').replace(/\+/g, '-').replace(/\//g, '-');

}

export async function POST(req, res){
    try{
        const {to, body, pdfBase64, filename} = req.body;

        if(!to ||!pdfBase64 || !filename){
            return res.status(400).json({
                error: 'Fehlende Parameter: to, pdfBase64, filename sind erforderlich'
            });
        }

        const pdfBuffer = Buffer.from(pdfBase64.split(',')[1], 'base64');

        const gmail = await authorize().then(createGmailClient).catch(console.error);
        
        const rawMessage = createEmail(to, body, pdfBuffer, filename);

        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: rawMessage
            }
        });

        return res.status(200),json({
            success: true,
            message: 'Email erfolgreich gesendet',
            messageId: result.data.id
        });
    }
    catch(err){
        console.error('Fehler beim Email-Versand:', err);
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}