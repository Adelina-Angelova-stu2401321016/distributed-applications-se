using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.RoomRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.RoomResponses;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RoomController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RoomController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("getrooms")]
        public async Task<ActionResult<GetAllRoomsDTO>> GetAllRooms([FromQuery] string? roomName, [FromQuery] decimal? temperature, decimal? humidity, decimal? ligth_exp,
   [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.Rooms.Where(r => r.IsDeleted == false); 
            if (!string.IsNullOrWhiteSpace(roomName))
            {
                query = query.Where(r => r.RoomName.Contains(roomName));
            }
            if(temperature != null)
            {
                query = query.Where(r => r.Temperature == temperature);
            }
            if (humidity != null)
            {
                query = query.Where(r => r.Humidity == humidity);
            }
            if (ligth_exp != null)
            {
                query = query.Where(r => r.Light_Exp == ligth_exp);
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
                if (sortBy.Equals("roomName", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(r => r.RoomName) : query.OrderBy(r => r.RoomName);
                }
                else if(sortBy.Equals("temperature", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(r => r.Temperature) : query.OrderBy(r => r.Temperature);
                }
                else if (sortBy.Equals("humidity", StringComparison.OrdinalIgnoreCase))
                {
                    query = isDesc ? query.OrderByDescending(r => r.Humidity) : query.OrderBy(r => r.Humidity);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(r => r.Light_Exp) : query.OrderBy(r => r.Light_Exp);
                }
            }

            var AllRooms = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(r => new GetAllRoomsDTO
            {
                ID = r.ID,
                Room_Name = r.RoomName
            })
        .ToListAsync();

            return Ok(AllRooms);
        }

        [HttpGet("getroom/{roomId}")]
        public async Task<ActionResult<GetRoomDTO>> GetRoom(int roomId)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.ID == roomId);
            if (room == null)
            {
                return BadRequest("Room not found");
            }
            return Ok(room);

        }

        
        [HttpPost("addroom")]
        public async Task<ActionResult> AddRoom([FromBody] AddRoomRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Room_Name))
            {
                return BadRequest("Room name is required");
            }

            int maxID = await _context.Rooms.MaxAsync(e => e.ID);
            var newRoom = new Room
            {
                ID = maxID + 1,
                DT = System.DateTime.Now,
                RoomName = request.Room_Name,
                Temperature = request.Temperature,
                Humidity = request.Humidity,
                Light_Exp = request.Light_Exp,
                IsDeleted = false,
                DltDT = null
            }; 

            _context.Rooms.Add(newRoom);
            await _context.SaveChangesAsync();
            return Ok();

        }


        [HttpPost("editroom")]
        public async Task<ActionResult> EditRoom([FromBody] UpdateRoomRequestDTO request)
        {
            if (string.IsNullOrWhiteSpace(request.Room_Name))
            {
                return BadRequest("Room name is required");
            }

            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.ID == request.ID);
            if (room == null)
            {
                return BadRequest("Exhibit not found");
            }

            room.RoomName = request.Room_Name;
            room.Temperature = request.Temperature;
            room.Humidity = request.Humidity;
            room.Light_Exp = request.Light_Exp; 

            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpDelete("deleteroom/{roomId}")]
        public async Task<IActionResult> DeleteRoom(int roomId)
        {
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.ID == roomId);

            if (room == null)
            {
                return NotFound("Room not found");
            }

            room.IsDeleted = true;
            room.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
