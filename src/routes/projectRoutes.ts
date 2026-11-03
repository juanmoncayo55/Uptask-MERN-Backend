import { Router } from "express"
import { body, param } from "express-validator"
import { ProjectController } from "../controller/ProjectController"
import { handleInputErrors } from "../middleware/validation"
import { validateProjectExists } from "../middleware/project"
import { TaskController } from "../controller/TaskController"
import { authenticated } from "../middleware/auth"
import { TeamController } from "../controller/TeamController"
import { hasAuthorization, taskBelongToProject, taskExists } from "../middleware/task"
import { NoteController } from "../controller/NoteController"

const router = Router()

router.use(authenticated);

router.get("/", ProjectController.getAllProjects)

router.get("/:id",
  param('id')
    .isMongoId().withMessage("El ID no es correcto"),
  handleInputErrors,
  ProjectController.getProject
)
router.post("/",
  body('projectName')
    .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
  body('clientName')
    .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
  body('description')
    .notEmpty().withMessage('La Descripcion del Proyecto es Obligatoria'),
  handleInputErrors,
  ProjectController.createProject
)

/* Router Task */

//con param definimos el callback que se ejecuta en caso de que una URL tenga el parametro "idProject"
router.param("idProject", validateProjectExists)

router.put("/:idProject",
  param('idProject')
    .isMongoId().withMessage("El ID no es correcto"),
  body('projectName')
    .notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
  body('clientName')
    .notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
  body('description')
    .notEmpty().withMessage('La Descripcion del Proyecto es Obligatoria'),
  handleInputErrors,
  hasAuthorization,
  ProjectController.updateProject
)

router.delete("/:idProject",
  param('idProject')
    .isMongoId().withMessage("El ID no es correcto"),
  handleInputErrors,
  hasAuthorization,
  ProjectController.deleteProject
)



router.post("/:idProject/tasks",
  hasAuthorization,
  body('name')
    .notEmpty().withMessage('El Nombre de la tarea es Obligatorio'),
  body('description')
    .notEmpty().withMessage('La Descripcion de la Tarea Obligatoria'),
  handleInputErrors,
  TaskController.createTask
)

router.get("/:idProject/tasks",
  TaskController.getAllTasks
)

router.param("taskId", taskExists);
router.param("taskId", taskBelongToProject);

router.get("/:idProject/tasks/:taskId",
  param('idProject')
    .isMongoId().withMessage("El ID no es correcto"),
  handleInputErrors,
  TaskController.getTaskById
)

router.put("/:idProject/tasks/:taskId",
  hasAuthorization,
  param('idProject')
    .isMongoId().withMessage("El ID no es correcto"),
  body('name')
    .notEmpty().withMessage('El Nombre de la tarea es Obligatorio'),
  body('description')
    .notEmpty().withMessage('La Descripcion de la Tarea Obligatoria'),
  handleInputErrors,
  TaskController.updateTask
)

router.delete("/:idProject/tasks/:taskId",
  hasAuthorization,
  param('taskId')
    .isMongoId().withMessage("El ID no es correcto"),
  handleInputErrors,
  TaskController.deleteTask
)

router.put("/:idProject/tasks/:taskId/status",
  hasAuthorization,
  param('taskId')
    .isMongoId().withMessage("El ID no es correcto"),
  body("status")
    .notEmpty().withMessage("El Estado de la Tarea es Obligatorio"),
  handleInputErrors,
  TaskController.updateStatus
)

/** Team */
router.post("/:idProject/team/find",
  body("email")
    .isEmail().toLowerCase().withMessage("El e-mail es inválido"),
  handleInputErrors,
  TeamController.findMemberByEmail
)

router.get("/:idProject/team", TeamController.getProjectTeam)

router.post("/:idProject/team",
  body("id")
    .isMongoId().withMessage("El ID es incorrecto"),
  handleInputErrors,
  TeamController.addMemberById
)

router.delete("/:idProject/team/:idUser",
  param("idUser")
    .isMongoId().withMessage("El ID es incorrecto"),
  handleInputErrors,
  TeamController.removeMemberById
)

/** Notes Route */
router.post("/:idProject/tasks/:taskId/notes",
  body("content")
    .notEmpty().withMessage("El campo contenido es obligatorio"),
  handleInputErrors,
  NoteController.createNote
);

router.get("/:idProject/tasks/:taskId/notes",
  NoteController.getTaskNotes
);

router.delete("/:idProject/tasks/:taskId/notes/:noteId",
  NoteController.deleteNoteById
);

export default router