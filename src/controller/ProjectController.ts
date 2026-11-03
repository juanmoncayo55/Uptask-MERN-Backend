import type { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {
  static async createProject(req: Request, res: Response){
    const project = new Project(req.body)

    //Asiganando manager al proyecto
    project.manager = req.user._id;
    try {
      await project.save()
      res.send("Proyecto creado con exito");
    } catch (error) {
      console.log(error);      
    }
  }

  static async getAllProjects(req: Request, res: Response){
    console.log("Este es el USER ", req.user)
    try {
      const projects = await Project.find({
        $or: [
          { manager: req.user._id },
          { team: {$in: [req.user._id]} }
        ]
      })

      console.log("Estos son los proyectos: ", projects);
      
      
      res.json(projects)
    } catch (error) {
      console.log(error)
    }
  }

  static async getProject(req: Request, res: Response){
    const { id } = req.params
    try {
      const project = await Project.findById(id).populate("tasks")

      if(!project){
        const error = new Error("El Proyecto no existee")
        return res.status(404).json({error: error.message})
      }

      //Si el usuario solicita acceso a los proyectos pero no es el manager y si no pertenetece al team o equipo de trabajo nos saldra un error de accion no valida.
      if(project.manager.toString() !== req.user._id.toString() && !project.team.includes(req.user._id)){
        const error = new Error("Acción no válida");
        return res.status(404).json({error: error.message})
      }

      res.json(project)
    } catch (error) {
      console.log(error)
    }
  }

  static async updateProject(req: Request, res: Response){
    try {
      req.project.clientName = req.body.clientName;
      req.project.projectName = req.body.projectName;
      req.project.description = req.body.description;

      await req.project.save()
      res.send("Proyecto Acualizado correctamente")
    } catch (error) {
      console.log(error)
    }
  }

  static async deleteProject(req: Request, res: Response){
    try {
      await req.project.deleteOne()
      res.send("Se elimino el proyecto")
    } catch (error) {
      console.log(error)
    }
  }
}