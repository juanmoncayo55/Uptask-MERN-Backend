import type { Request, Response } from "express";
import Task from "../models/Task";

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try{
      const task = new Task(req.body)
      task.project = req.project._id
      req.project.tasks.push(task._id)
      await Promise.allSettled([task.save(), req.project.save()])
      res.send("Tarea Creada Correctamente")
    } catch (error) {
      res.status(500).json({ error: "Hubo un error" })
    }
  }

  static getAllTasks = async (req: Request, res: Response) => {
    try{
      const tasks = await Task.find({ project: req.project._id }).populate("project")
      res.json(tasks)
    } catch (error) {
      res.status(500).json({ error: "Hubo un error: "+error })
    }
  }

  static getTaskById = async (req: Request, res: Response) => {
    console.log("Sientro");
    
    try{
      const { taskId } = req.params
      console.log("iksadfjbdjsakbd: ", taskId)
      const task = await Task.findById(taskId)
        .populate({
          path: "completedBy.user",
          select: "_id name email"
        })
        .populate({
          path: "notes",
          populate: { path:"createdBy", select: "_id name email" }
        })

      if(!task) {
        const error = new Error("No se encontro la tarea")
        res.status(404).json({ error: error.message })
      }


      res.status(200).json(task)
    } catch (error) {
      res.status(500).json({ error: "Hubo un error: ", msg: error })
    }
  }

  static updateTask = async (req: Request, res: Response) => {
    try{
      const { taskId } = req.params
      const task = await Task.findById(taskId)
      if(!task) {
        const error = new Error("No se encontro la tarea")
        res.status(404).json({ error: error.message })
      }
      if(task.project.toString() !== req.project._id.toString()){
        const error = new Error("Accion no valida")
        res.status(400).json({ error: error.message })
      }

      task.name = req.body.name
      task.description = req.body.description
      await task.save()

      res.status(200).send("Tarea actualizada")
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: "Hubo un error: ", msg: error })
    }
  }

  static deleteTask = async (req: Request, res: Response) => {
    try{
      req.project.tasks = req.project.tasks.filter(task => task.toString() !== req.task._id.toString())
      await Promise.allSettled([ req.task.deleteOne(), req.project.save() ])

      res.status(200).send("Tarea Eliminada Correctamente")
    } catch (error) {
      res.status(500).json({ error: "Hubo un error: ", msg: error })
    }
  }

  static updateStatus = async (req: Request, res: Response) => {
    try{
      const { status } = req.body
      req.task.status = status

      const data = {
        user: req.user._id,
        status
      }
      req.task.completedBy.push(data);
      await req.task.save()
      res.send("Tarea Actualizada")

    } catch (error) {
      res.status(500).json({ error: "Hubo un error: ", msg: error })
    }
  }
}