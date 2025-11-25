const Joi = require("joi");

// Employee schema
const employeeSchema = Joi.object({
    id: Joi.number().label('Id'),
    name: Joi.string().min(3).max(50).required().label("Name"),
    code: Joi.string().min(3).max(10).required().label("Code"),
    color: Joi.string().min(3).max(20).required().label("Color"),
    profession: Joi.string().allow('').max(50).label("Profession"),
    city: Joi.string().allow('').max(50).label("City"),
    branch: Joi.string().allow('').max(50).label("Branch"),
    assigned: Joi.boolean().required().label("Assigned")
});

module.exports = employeeSchema