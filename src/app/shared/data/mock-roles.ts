import {CallanRole} from '../models/role.model';
import {CallanRoleNameEnum} from '../enums/role.name.enum';

const roleSupport = new CallanRole();
roleSupport.id = 4;
roleSupport.name = CallanRoleNameEnum.SUPPORT;

const roleAdmin = new CallanRole();
roleAdmin.id = 3;
roleAdmin.name = CallanRoleNameEnum.ADMIN;

const roleTeacher = new CallanRole();
roleTeacher.id = 2;
roleTeacher.name = CallanRoleNameEnum.TEACHER;

const roleStudent = new CallanRole();
roleStudent.id = 1;
roleStudent.name = CallanRoleNameEnum.STUDENT;

const mockRoles: CallanRole[] = [];
mockRoles.push(roleAdmin);
mockRoles.push(roleTeacher);
mockRoles.push(roleStudent);

export { mockRoles };
