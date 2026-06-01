using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.RoleRequests;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.UserRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.RoleResponses;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.UserResponses;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }


     
        [HttpGet("getroles")]
        public async Task<ActionResult<GetAllRolesResponseDTO>> GetAllRoles([FromQuery] string? roleName, [FromQuery] DateTime? dtCreated,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.UserRoles.Where(a => a.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(roleName))
            {
                query = query.Where(a => a.Name.Contains(roleName));
            }
            if (dtCreated.HasValue)
            {
                query = query.Where(a => a.DT.Date == dtCreated.Value.Date);
            }
            if (pageNum < 1) return BadRequest("Page number cannot be less than 1.");
            if (pageSize < 1 || pageSize > 100) return BadRequest("Page size should be number between 1 and 100");
            bool isDesc = false;
            if (sortDirection is null || sortDirection == 0)
            {
                isDesc = false;
            }
            else if (sortDirection == 1)
            {
                isDesc = true;
            }

            if (sortBy != null)
            {
                if (sortBy.Equals("dtCreated", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(a => a.DT) : query.OrderBy(a => a.DT);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(a => a.Name) : query.OrderBy(a => a.Name);
                }
            }

            var AllRoles = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(ur => new GetAllRolesResponseDTO
            {
                ID = ur.ID,
                Name = ur.Name
            })
        .ToListAsync();

            return Ok(AllRoles);
        }


        [HttpPost("addrole")]
        public async Task<ActionResult> AddRole([FromBody] AddRoleRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Name is required.");
            }
            int maxID = await _context.UserRoles.MaxAsync(ur => ur.ID); 
               

            var newRole = new UserRole
            {
                ID = maxID + 1,
                Name = request.Name, 
                DT = DateTime.Now, 
                IsDeleted = false, 
                DltDT = null
            };

            _context.UserRoles.Add(newRole);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("editrole")]
        public async Task<ActionResult> EditRole([FromBody] UpdateRoleRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Name is required.");
            }
            var role = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.ID == request.ID);

            if (role == null)
            {
                return NotFound("Role not found");
            }

            role.Name = request.Name;
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpDelete("deleterole/{roleId}")]
        public async Task<IActionResult> DeleteRole(int roleId)
        {
            var role = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.ID == roleId);

            if (role == null)
            {
                return NotFound("Role not found");
            }

            role.IsDeleted = true;
            role.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("getusers")]
        public async Task<ActionResult<GetAllUsersResponseDTO>> GetAllUsers([FromQuery] string? userName, [FromQuery] string? roleName,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.Users.Where(a => a.IsDeleted == false && a.UserRole.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(userName))
            {
                query = query.Where(a => (a.FName + " " + a.LName).Contains(userName));
            }
            if (!string.IsNullOrWhiteSpace(roleName))
            {
                query = query.Where(a => a.UserRole.Name.Contains(roleName));
            }
            if (pageNum < 1) return BadRequest("Page number cannot be less than 1.");
            if (pageSize < 1 || pageSize > 100) return BadRequest("Page size should be number between 1 and 100");
            bool isDesc = false;
            if (sortDirection is null || sortDirection == 0)
            {
                isDesc = false;
            }
            else if (sortDirection == 1)
            {
                isDesc = true;
            }

            if (sortBy != null)
            {
                if (sortBy.Equals("userName", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(a => a.LName) : query.OrderBy(a => a.LName);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(a => a.UserRole.Name) : query.OrderBy(a => a.UserRole.Name);
                }
            }

            var AllUsers = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(u => new GetAllUsersResponseDTO
            {
                ID = u.ID,
                Username = u.Username,
                FName = u.FName,
                LName = u.LName,
                UserRole = u.UserRole.Name
            })
        .ToListAsync();

            return Ok(AllUsers);
        }

        [HttpPost("adduser")]
        public async Task<ActionResult> AddUser([FromBody] AddUserRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest("Username is required");
            }
            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Password is required");
            }
            if (string.IsNullOrWhiteSpace(request.FName))
            {
                return BadRequest("First name is required");
            }
            if (string.IsNullOrWhiteSpace(request.LName))
            {
                return BadRequest("Last Name is required");
            }
            
            var role = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.ID == request.UserRoleID);

            if(role == null)
            {
                return BadRequest("No such role in the db");
            }

            int maxID = await _context.Users.MaxAsync(u => u.ID);


            var newUser = new User
            {
                ID = maxID +1, DT = System.DateTime.Now,  
                Username = request.Username,
                Password = request.Password,
                FName = request.FName,
                LName = request.LName,
                UserRoleID = request.UserRoleID,
                IsDeleted = false, 
                DltDT = null
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("getuser/{userId}")]
        public async Task<ActionResult> GetUser(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.ID == userId);
            if(user == null)
            {
                return BadRequest("User not found"); 
            }
            return Ok(user); 
        }

        [Authorize]
        [HttpGet("getcurators")]
        public async Task<ActionResult<GetCuratorsDTO>> GetCurators()
        {
            var Curators = await _context.Users.Where(u => u.UserRoleID == 100002 && u.IsDeleted == false && u.UserRole.IsDeleted == false).Select(u => new GetCuratorsDTO
            {
                ID = u.ID,
                Name = u.FName + " " + u.LName
            })
        .ToListAsync();

            return Ok(Curators);
        }

        [HttpGet("getresearchers")]
        public async Task<ActionResult<GetCuratorsDTO>> GetResearchers()
        {
            var researchers = await _context.Users.Where(u => u.UserRoleID == 100003 && u.IsDeleted == false && u.UserRole.IsDeleted == false).Select(u => new GetCuratorsDTO
            {
                ID = u.ID,
                Name = u.FName + " " + u.LName
            })
        .ToListAsync();

            return Ok(researchers);
        }

        [HttpPost("edituser")]
        public async Task<ActionResult> EditUser([FromBody] UpdateUserRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Username))
            {
                return BadRequest("Username is required");
            }
            if (string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Password is required");
            }
            if (string.IsNullOrWhiteSpace(request.FName))
            {
                return BadRequest("First name is required");
            }
            if (string.IsNullOrWhiteSpace(request.LName))
            {
                return BadRequest("Last Name is required");
            }

            var role = await _context.UserRoles.FirstOrDefaultAsync(ur => ur.ID == request.UserRoleID);

            if (role == null)
            {
                return BadRequest("No such role in the db");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.ID == request.ID);
            if (user == null)
            {
                return BadRequest("User not found");
            }

            user.Username = request.Username;
            user.Password = request.Password;
            user.FName = request.FName;
            user.LName = request.LName;
            user.UserRoleID = request.UserRoleID; 
            await _context.SaveChangesAsync();

            return Ok(); 
        }

        [HttpDelete("deleteuser/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.ID == userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            user.IsDeleted = true;
            user.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }


    }

}