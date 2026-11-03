import type {Request, Response, NextFunction} from "express";
import Task, { ITask } from "../models/Task";
import { IProject } from "../models/Project";

declare global {
  namespace Express {
    interface Request {
      task: ITask,
      project: IProject
    }
  }
}

export async function taskExists(req: Request, res: Response, next: NextFunction){  
  try{
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if(!task){
      const error = new Error("Tarea no Encontrada");
      res.status(404).json({error: error.message});
      return;
    }

    req.task = task;
    next();
  } catch (error) {
    console.log("Error de middleware 'taskExists': ", error);
    res.status(505).json({error: "Hubo un error en el servidor."});
  }
}

//Verificamos si el task le pertenece al proyecto actual
export function taskBelongToProject(req: Request, res: Response, next: NextFunction){
  if(req.task.project.toString() !== req.project._id.toString()){
    const error = new Error("Acción no Válida");
    return res.status(400).json({error: error.message});
  }
  next();
}

//middleware que verifica si el usuario que creo el proyecto es el mismo que esta logueado.
export function hasAuthorization(req: Request, res: Response, next: NextFunction){
  if(req.user._id.toString() !== req.project.manager.toString()){
    const error = new Error("Acción no Válida");
    return res.status(400).json({error: error.message});
  }
  next();
}