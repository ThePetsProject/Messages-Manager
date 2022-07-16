import { pwdRecoveryRoute } from './pwd-recovery-email'
import { healthRoute } from './health'
import { Router } from 'express'
import { google } from 'googleapis'
import nodemailer from 'nodemailer'

/**
 * Create a Router type handler for each path, and set it in router.use
 */

export const routesArray = (router: Router) => [
  pwdRecoveryRoute(router, google, nodemailer),
  healthRoute(router),
]
