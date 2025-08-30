const express = require('express');
const {
  getAllProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  createDefaultCategories
} = require('../controllers/projectController.cjs');
const {
  createProjectValidationRules,
  updateProjectValidationRules,
  validateRequest
} = require('../validators/projectValidator.cjs');

const router = express.Router();

router.get('/', getAllProjects);
router.post('/', createProjectValidationRules(), validateRequest, createProject);
router.get('/:id', getProjectById);
router.put('/:id', updateProjectValidationRules(), validateRequest, updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/create-categories', createDefaultCategories);

module.exports = router;
