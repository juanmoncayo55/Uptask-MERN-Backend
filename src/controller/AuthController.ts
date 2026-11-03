import type {Request, Response} from "express";
import { Types } from "mongoose";
import User from "../models/User";
import { checkedPassword, hashPassword } from "../utils/auth";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

export default class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try{
      const {password, email} = req.body;

      //Verificar la existencia del usuario
      const userExists = await User.findOne({email});
      if(userExists){
        const error = new Error("El Usuario ya esta registrado");
        res.status(409).json({error: error.message});
      }

      //Hashear Password
      const user = new User(req.body);
      user.password = await hashPassword(password);

      const token = new Token();
      token.token = generateToken();
      token.user = new Types.ObjectId(user._id);

      //Enviando Email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })

      //Guardar
      await Promise.allSettled([await user.save(), await token.save()]);

      res.send("Usuario creado correctamente, revisa tu E-mail");
    } catch (error) {
      console.log(error)
      res.status(500).json({error: "Hubo un error en el Servidor"});
    }
  }

  static confirmAccount = async (req: Request, res: Response) => {
    try{
      //extraemos el token del cuerpo
      const {token} = req.body;
      //buscamos el token en la base de datos
      const tokenExists = await Token.findOne({token});
      //verificamos si existe el token, de no existir
      if(!tokenExists){
        const error = new Error("El token no es válido");
        return res.status(401).json({error: error.message});
      }

      //Si existe el token, buscamos al usuario y confirmed sera true
      const user = await User.findById(tokenExists.user)
      user.confirmed = true;

      await Promise.allSettled([ user.save(), tokenExists.deleteOne() ])
      res.send("Cuenta confirmada correctamente.");
    } catch (error) {
      console.log(error)
      res.status(500).json({error: "Hubo un error en el Servidor"});
    }
  }

  static login = async (req: Request, res: Response) => {
    try{

      const {email, password} = req.body;

      //VErificando si el usuario existe en la BD
      const user = await User.findOne({ email });
      console.log(user)
      if( !user ){
        const error = new Error("El usuario no existe");
        console.log(error)
        res.status(404).json({error: error.message});
      }

      //Verificando si el usuario tiene la cuenta confirmada.
      if(!user.confirmed){
        const token = new Token();
        token.token = generateToken();
        token.user = new Types.ObjectId(user._id);
        await token.save();

        //Enviando Email
        AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token
        })

        const error = new Error("La cuenta no ha sido confirmada, hemos enviado un email de confirmación a tu cuenta.");
        res.status(401).json({error: error.message});
      }

      //Validando la contraseña de usuario
      const validateAccount = await checkedPassword(password, user.password);
      if(!validateAccount){
        const error = new Error("Password Incorrecto");
        res.status(401).json({error: error.message});
      }

      const token = generateJWT({id: user._id});

      res.send(token)

    } catch (error) {
      console.log(error)
      res.status(500).json({error: "Hubo un error en el Servidor"});
    }
  }

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try{
      const {email} = req.body;

      //Verificar la existencia del usuario
      const user = await User.findOne({email});
      if(!user){
        const error = new Error("El Usuario NO esta registrado");
        res.status(404).json({error: error.message});
      }

      if(user.confirmed){
        const error = new Error("El Usuario ya esta validado.");
        res.status(403).json({error: error.message});
      }

      const token = new Token();
      token.token = generateToken();
      token.user = new Types.ObjectId(user._id);

      //Enviando Email
      AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token
      })

      //Guardar
      await Promise.allSettled([await user.save(), await token.save()]);

      res.send("Se envio un nuevo TOKEN a tu e-mail");
    } catch (error) {
      console.log(error)
      res.status(500).json({error: "Hubo un error en el Servidor"});
    }
  }

  static forgotPassword = async (req: Request, res: Response) => {
    try{
      const {email} = req.body;

      //Verificar la existencia del usuario
      const user = await User.findOne({email});
      if(!user){
        const error = new Error("El Usuario NO esta registrado");
        res.status(404).json({error: error.message});
      }

      const token = new Token();
      token.token = generateToken();
      token.user = new Types.ObjectId(user._id);
      await token.save()

      //Enviando Email
      AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token
      })

      res.send("Revisa tu e-mail para instrucciones.");
    } catch (error) {
      console.log(error)
      res.status(500).json({error: "Hubo un error en el Servidor"});
    }
  }

  static validateToken = async (req: Request, res: Response) => {
    try{
      //extraemos el token del cuerpo
      const {token} = req.body;
      //buscamos el token en la base de datos
      const tokenExists = await Token.findOne({token});
      //verificamos si existe el token, de no existir
      if(!tokenExists){
        const error = new Error("El token no es válido");
        return res.status(401).json({error: error.message});
      }

      res.send("Token valido, Define tu nuevo password");
    } catch (error) {
      console.log(error)
      res.status(500).json({error: "Hubo un error en el Servidor"});
    }
  }

  static updatePasswordWithToken = async (req: Request, res: Response) => {
    try{
      const { password } = req.body;
      //extraemos el token de los params
      const {token} = req.params;
      //buscamos el token en la base de datos
      const tokenExists = await Token.findOne({token});
      //verificamos si existe el token, de no existir
      if(!tokenExists){
        const error = new Error("El token no es válido");
        return res.status(401).json({error: error.message});
      }

      //obtenemos el user mediante el token existente
      const user = await User.findById(tokenExists.user);
      //le cambiamos la contraseña al usuario
      user.password = await hashPassword(password);

      //Guardamos todo en la BD
      await Promise.allSettled([user.save(), tokenExists.deleteOne()]);

      res.send("El Password se modifico correctamente.");
    } catch (error) {
      console.log(error)
      res.status(500).json({error: "Hubo un error en el Servidor"});
    }
  }

  static profile = async (req: Request, res: Response) => {
    return res.send(req.user);
  }

  static updateProfile = async (req: Request, res: Response) => {
    const { email, name } = req.body;

    const userExist = await User.findOne({email});
    if( userExist && userExist._id.toString() !== req.user._id.toString() ){
      const error = new Error("Ese email ya esta registrado");
      return res.status(409).json({error: error.message});
    }

    req.user.name = name;
    req.user.email = email;

    try {
      await req.user.save();
      res.status(500).send("Perfil Actualizado Correctamente.");
    } catch (error) {
      res.status(500).send("Hubo un error");
    }
  }

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await checkedPassword(current_password, user.password);
    if(!isPasswordCorrect){
      const error = new Error("El password actual es incorrecto");
      return res.status(401).json({error: error.message});
    }

    try {
      user.password = await hashPassword(password);
      await user.save();
      res.status(200).send("Usuario actualizado correctamente.");
    } catch (error) {
      res.status(500).send("Hubo un error");
    }
  }

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await checkedPassword(password, user.password);
    
    if(!isPasswordCorrect){
      const error = new Error("El password es incorrecto");
      return res.status(401).json({error: error.message});
    }
    
    res.status(200).send("El password es correcto.")
  }
}