import { google } from 'googleapis'

//TABLE ID
const ID = "1Aiw5wJGoqmTFcMB595Sv4TX6pDjd0lytaProjyQO7ac"

async function authentication() {
    const auth = new google.auth.GoogleAuth({
        keyFile: './credentials/credentials.json',
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    })

    const client = await auth.getClient()

    const sheets = google.sheets({
        version: 'v4',
        auth: client
    })

    return sheets
}

export async function update(amount) {
    authentication()
        .then(async (sheets) => {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: ID,
                range: 'A1'
            })
            return {response,sheets}
        })
        .then(async ({response, sheets}) => {
            const amountBefore = parseInt(response.data.values[0][0])
            const amountUpdate = amountBefore + parseInt(amount)
            await sheets.spreadsheets.values.update({
                spreadsheetId: ID,
                range: 'A1',
                valueInputOption: "USER_ENTERED",
                resource: {
                            values: [[amountUpdate]]
                }
            })
            console.log(`Added Sended Amount to Google Sheets`)
        })
        .catch((e) => {
            console.log(e)
        })
}
