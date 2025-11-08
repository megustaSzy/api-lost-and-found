import { Router } from "express";
import { userController } from "../controllers/userController";


const router = Router();

router.get("/", userController.getAllUsers);

router.get("/:id", userController.getUserById)

router.put("/:id", userController.editUser)

router.delete("/:id", userController.deleteUser)

router.post("/", userController.addUser)

export default router