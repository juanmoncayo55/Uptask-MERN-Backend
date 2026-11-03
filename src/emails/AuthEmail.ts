import { transporter } from "../config/nodemailer";

interface IAuthEmail {
  email: string,
  name: string,
  token: string
}

export class AuthEmail {
  static sendConfirmationEmail = async ( user: IAuthEmail ) => {
    await transporter.sendMail({
      from: 'Uptask <uptask@email.com>',
      to: user.email,
      subject: 'Uptask - Confirma tu Cuenta',
      text: 'Uptask - Confirma tu Email',
      html: `<p>Hola: ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
        <p>Visita el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirma cuenta</a>
        <p>E ingresa el código: <b>${user.token}</b></p>
        <p>Este TOKEN expira en 10 minutos</p>

      `
    })
  }

  static sendPasswordResetToken = async ( user: IAuthEmail ) => {
    await transporter.sendMail({
      from: 'Uptask <uptask@email.com>',
      to: user.email,
      subject: 'Uptask - Reestablece tu Password',
      text: 'Uptask - Reestablece tu Password',
      html: `<p>Hola: ${user.name}, has solicitado reestablecer tu password.</p>
        <p>Visita el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
        <p>E ingresa el código: <b>${user.token}</b></p>
        <p>Este TOKEN expira en 10 minutos</p>

      `
    })
  }
}