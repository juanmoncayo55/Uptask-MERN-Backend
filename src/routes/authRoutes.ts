import { Router } from "express";
import { body, param } from 'express-validator'
import AuthController from "../controller/AuthController";
import { handleInputErrors } from "../middleware/validation";
import { authenticated } from "../middleware/auth";

const router = Router();

router.post("/create-account",
  body("name")
    .notEmpty().withMessage("El Campo Nombre No puede ir vacio."),
  body("password")
    .isLength({min: 8}).withMessage("El Campo Password Debe Ser Mayor a 8 Caracteres."),
  body("password_confirmation")
    .custom((value, {req}) => {
      if(value != req.body.password){
        throw new Error("Los password no son iguales");
      }
      return true;
    }),
  body("email")
    .isEmail().withMessage("Debes ingresar un E-mail válido."),
  handleInputErrors,
  AuthController.createAccount
);

router.post("/confirm-account",
  body("token")
    .notEmpty().withMessage("El token es requerido."),
  handleInputErrors,
  AuthController.confirmAccount
);

router.post("/login",
  body("email")
    .notEmpty().withMessage("El Campo Nombre No puede ir vacio."),
  body("password")
    .notEmpty().withMessage("El Campo Password es requerido."),
  handleInputErrors,
  AuthController.login
)

router.post("/request-code",
  body("email")
    .isEmail().withMessage("E-mail no válido."),
  handleInputErrors,
  AuthController.requestConfirmationCode
)

router.post("/forgot-password",
  body("email")
    .isEmail().withMessage("E-mail no válido."),
  handleInputErrors,
  AuthController.forgotPassword
)

router.post("/validate-token",
  body("token")
    .notEmpty().withMessage("El token es requerido."),
  handleInputErrors,
  AuthController.validateToken
)

router.post("/update-password/:token",
  param("token")
    .isNumeric().withMessage("El token no es válido."),
  body("password")
    .isLength({min: 8}).withMessage("El Campo Password Debe Ser Mayor a 8 Caracteres."),
  body("password_confirmation")
    .custom((value, {req}) => {
      if(value != req.body.password){
        throw new Error("Los password no son iguales");
      }
      return true;
    }),
  handleInputErrors,
  AuthController.updatePasswordWithToken
)

router.get("/profile", authenticated, AuthController.profile)

/** Profile Route */
router.put("/profile",
  authenticated,
  body("name")
    .notEmpty().withMessage("El Campo Nombre No puede ir vacio."),
  body("email")
    .isEmail().withMessage("Debes ingresar un E-mail válido."),
  handleInputErrors,
  AuthController.updateProfile
)

router.post("/profile/update-password",
  authenticated,
  body("current_password")
    .notEmpty().withMessage("El password actual No puede ir vacio."),
  body("password")
    .isLength({min: 8}).withMessage("El Campo Password Debe Ser Mayor a 8 Caracteres."),
  body("password_confirmation")
    .custom((value, {req}) => {
      if(value != req.body.password){
        throw new Error("Los password no son iguales");
      }
      return true;
    }),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
)

router.post("/check-password",
  authenticated,
  body("password")
    .notEmpty().withMessage("El Campo Password es incorrecto."),
  handleInputErrors,
  AuthController.checkPassword
)

export default router;