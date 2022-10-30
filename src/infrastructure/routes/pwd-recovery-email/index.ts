import { Router } from 'express'
import { Request, Response } from 'express'
import nodemailer from 'nodemailer'
import { GoogleApis } from 'googleapis'
import fs from 'fs'
import Mail from 'nodemailer/lib/mailer'

export type PwdRecoveryRouteFnType = (
  router: Router,
  google: GoogleApis,
  mailer: typeof nodemailer
) => Router

export const pwdRecoveryHandler = async (
  google: GoogleApis,
  mailer: typeof nodemailer,
  req: Request,
  res: Response
): Promise<Response> => {
  const { toEmail, recoverUrl } = req.body

  if (!(toEmail?.length && recoverUrl?.length)) return res.sendStatus(400)

  const secretsPath = process.env.VAULT_SECRETS_FILE_PATH
  const mongoDataFile = `${secretsPath}mailData.json`
  const mongoData = JSON.parse(fs.readFileSync(mongoDataFile, 'utf-8'))

  const auth = {
    type: 'OAuth2',
    user: mongoData.EMAIL,
    clientId: mongoData.CLIENT_ID,
    clientSecret: mongoData.CLIENT_SECRET,
    refreshToken: mongoData.REFRESH_TOKEN,
  }

  const mailoptions = {
    from: `The Pets Project <${mongoData.EMAIL}>`,
    to: toEmail,
    subject: 'Recuperación de contraseña',
  }

  const oAuth2Client = new google.auth.OAuth2(
    mongoData.CLIENT_ID,
    mongoData.CLIENT_SECRET,
    mongoData.REDIRECT_URL
  )

  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

  try {
    const accessToken = await oAuth2Client.getAccessToken()

    const transportOptions = {
      service: 'gmail',
      auth: {
        ...auth,
        accessToken: accessToken,
      },
    } as nodemailer.TransportOptions

    const transport = mailer.createTransport(transportOptions)

    const mailOptions = {
      ...mailoptions,
      html: `<p>Reestablece tu contraseña en ${recoverUrl}</p>`,
    } as Mail.Options

    const mailResponse = await transport.sendMail(mailOptions)
    return res.sendStatus(200)
  } catch (error) {
    return res.sendStatus(500)
  }
}

export const pwdRecoveryRoute: PwdRecoveryRouteFnType = (
  router: Router,
  google: GoogleApis,
  mailer: typeof nodemailer
): Router => {
  return router.post('/recover-password', (req, res) =>
    pwdRecoveryHandler(google, mailer, req, res)
  )
}
