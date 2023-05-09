const express = require("express");
const router = express.Router();
const {
  creatGroup,
  findAllGroups,
  createGroup,
  getUserGroups,
  joinGroup,
  leaveGroup,
} = require("../controllers/groupController");

// router.post('/', addNewUser)

router.post("/", createGroup);
router.get("/", findAllGroups);
router.get("/:id", getUserGroups);
router.post("/join", joinGroup);
router.post("/leave", leaveGroup);

module.exports = router;
