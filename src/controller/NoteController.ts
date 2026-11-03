import type {Request, Response} from "express";
import Note, {INote} from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
  noteId: Types.ObjectId
}

export class NoteController {
  static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
    const { content } = req.body;

    const note = new Note();
    note.content = content;
    note.createdBy = req.user._id;
    note.task = req.task._id;

    req.task.notes.push(note._id);

    console.log(note)

    try{
      await Promise.allSettled([note.save(), req.task.save()]);
      res.send("Nota creada correctamente");
    } catch(error){
      console.log(error)
      res.status(500).json({error: "Hubo un error"});
    }
  }

  static getTaskNotes = async (req: Request, res: Response) => {
    try {
      const notes = await Note.find({task: req.task._id});
      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({error: "Hubo un error"});
    }
  }

  static deleteNoteById = async (req: Request<NoteParams>, res: Response) => {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);

    if(!note) {
      const error = new Error("La nota no existe");
      return res.status(404).json({error: error.message});
    }

    if(note.createdBy.toString() !== req.user._id.toString()){
      const error = new Error("Acción no válida");
      return res.status(401).json({error: error.message});
    }

    req.task.notes = req.task.notes.filter(note => note.toString() !== noteId.toString());

    try {
      await Promise.allSettled([req.task.save(), note.deleteOne()]);
      res.send("Nota Eliminada")
    } catch (error) {
      res.status(500).json({error: "Hubo un error"});
    }
  }
}