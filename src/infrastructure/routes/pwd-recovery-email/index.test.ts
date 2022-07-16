import * as pwdRecoveryModules from '.'
import { Request, Response } from 'express'
import fs from 'fs'
import nodemailer from 'nodemailer'
import { GoogleApis } from 'googleapis'

process.env.SECRETS_PATH = 'fakepath'

const baseRoute = '/api/v1/account/login'
const { pwdRecoveryHandler } = pwdRecoveryModules

jest.spyOn(global.console, 'error').mockImplementation(() => {})
jest.spyOn(global.console, 'info').mockImplementation(() => {})

const resMock = {
  send: jest.fn().mockReturnThis(),
  status: jest.fn().mockReturnThis(),
  sendStatus: jest.fn().mockReturnThis(),
} as any as Response

let googleMock = {
  auth: {
    OAuth2: jest.fn().mockImplementation(() => {
      return {
        setCredentials: jest.fn(),
        getAccessToken: jest.fn().mockResolvedValue('a'),
      }
    }),
  },
} as unknown as GoogleApis

let mailerMock = {
  createTransport: jest.fn().mockImplementation(() => {
    return {
      sendMail: jest.fn().mockResolvedValue('a'),
    }
  }),
} as unknown as typeof nodemailer

describe('Password recovery mail', () => {
  beforeAll(() => {})

  beforeEach(() => {})

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Should return 400 if email empty', async () => {
    const req = {
      body: {
        toEmail: '',
        recoverUrl: 'fakeRecoverUrl',
      },
    } as any as Request

    const response = await pwdRecoveryHandler(
      googleMock,
      mailerMock,
      req,
      resMock
    )
    expect(response.sendStatus).toBeCalledWith(400)
  })

  it('Should return 400 if email not present', async () => {
    const req = {
      body: {
        recoverUrl: 'fakeRecoverUrl',
      },
    } as any as Request

    const response = await pwdRecoveryHandler(
      googleMock,
      mailerMock,
      req,
      resMock
    )
    expect(response.sendStatus).toBeCalledWith(400)
  })

  it('Should return 400 if recoverUrl empty', async () => {
    const req = {
      body: {
        toEmail: 'fake@email.com',
        recoverUrl: '',
      },
    } as any as Request

    const response = await pwdRecoveryHandler(
      googleMock,
      mailerMock,
      req,
      resMock
    )
    expect(response.sendStatus).toBeCalledWith(400)
  })

  it('Should return 400 if recoverUrl not present', async () => {
    const req = {
      body: {
        toEmail: 'fake@email.com',
      },
    } as any as Request

    const response = await pwdRecoveryHandler(
      googleMock,
      mailerMock,
      req,
      resMock
    )
    expect(response.sendStatus).toBeCalledWith(400)
  })

  it('Should return 500 if there is an error when sending email', async () => {
    jest.spyOn(fs, 'readFileSync').mockImplementationOnce(() => {
      return Buffer.from(
        '{"EMAIL": "fake_EMAIL","CLIENT_ID": "fake_CLIENT_ID","CLIENT_SECRET": "fake_CLIENT_SECRET","REDIRECT_URI": "fake_REDIRECT_URI","REFRESH_TOKEN": "fake_REFRESH_TOKEN"}'
      )
    })

    const req = {
      body: {
        toEmail: 'fake@email.com',
        recoverUrl: 'fakeRecoverUrl',
      },
    } as any as Request

    const response = await pwdRecoveryHandler(
      googleMock,
      mailerMock,
      req,
      resMock
    )
    expect(response.sendStatus).toBeCalledWith(200)
  })
})
