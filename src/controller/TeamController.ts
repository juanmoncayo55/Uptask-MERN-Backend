import type {Request, Response} from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamController {
  static async findMemberByEmail(req: Request, res: Response){
    const {email} = req.body;
    const user = await User.findOne({email}).select("id email name");

    if(!user){
      const error = new Error("Usuario NO Encontrado");
      return res.status(404).json({error: error.message});
    }

    res.json(user)
  }

  static async getProjectTeam(req: Request, res: Response){
    const project = await Project.findById(req.project._id).populate({
      path: "team",
      select: "id name email"
    });

    res.json(project.team);
  }

  static async addMemberById(req: Request, res: Response){
    const {id} = req.body;
    const user = await User.findById(id)

    if(!user){
      const error = new Error("Usuario NO Encontrado");
      return res.status(404).json({error: error.message});
    }

    //El req.project lo obtenemos del middleware que creamos para project.
    if(req.project.team.some(team => team.toString() === user._id.toString())){
      const error = new Error("El usuario ya esta asignado al proyecto.");
      return res.status(409).json({error: error.message});
    }

    req.project.team.push(user._id);
    await req.project.save();

    res.json("Usuario agregado correctamente.")
  }

  static async removeMemberById(req: Request, res: Response){
    //obtenemos el id del req.body
    const {idUser} = req.params;

    //Aqui la condicion es que si el id no existe en el arreglo de team del proyecto, entonces lanzamos un error. 
    if(!req.project.team.some(team => team.toString() === idUser)){
      const error = new Error("El usuario no esta existe en el proyecto.");
      return res.status(409).json({error: error.message});
    }

    //Filtramos del arreglo de team el ID del usuario que queremos eliminar
    req.project.team = req.project.team.filter(team => team.toString() !== idUser);
    await req.project.save();
    res.send("Usuario Eliminado con exito.");
  }
}