using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MuseumManagmentSystem.Entities;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.ExhibitRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.RoomResponses;
using System.Data;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ExhibitRoomController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExhibitRoomController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("get-exhibitrooms/{exhibitId}")]
        public async Task<ActionResult<GetRoomsByExhDTO>> GetRoomsByExhibit(int exhibitId, [FromQuery] string? roomName, [FromQuery] DateTime? dtCreated,
        [FromQuery] int pageNum, [FromQuery] int pageSize, [FromQuery] string? sortBy, [FromQuery] byte? sortDirection)
        {
            var query = _context.ExhibitRooms.Where(er => er.IsDeleted == false && er.ExhibitID == exhibitId && er.Exhibit.IsDeleted == false && er.Room.IsDeleted == false);
            if (!string.IsNullOrWhiteSpace(roomName))
            {
                query = query.Where(er => er.Room.RoomName.Contains(roomName));
            }
            if (dtCreated.HasValue)
            {
                query = query.Where(er => er.DT.Date == dtCreated.Value.Date);
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
                    query = isDesc ? query.OrderByDescending(er => er.DT) : query.OrderBy(er => er.DT);
                }
                else
                {
                    query = isDesc ? query.OrderByDescending(er => er.Room.RoomName) : query.OrderBy(er => er.Room.RoomName);
                }
            }


            var Rooms = await query.Skip((pageNum - 1) * pageSize).Take(pageSize).Select(er => new GetRoomsByExhDTO
            {
                ID = er.ID,
                RoomID = er.RoomID, 
                Room_Name = er.Room.RoomName
            })
        .ToListAsync();

            return Ok(Rooms);
        }

        [HttpGet("get-other-rooms/{exhibitId}")]
        public async Task<ActionResult<GetRoomsNotExhDTO>> GetOtherRoomsByExhibit(int exhibitId)
        {
            var Rooms = await _context.Rooms.Where(r => !_context.ExhibitRooms.Any(er => er.RoomID == r.ID && er.ExhibitID == exhibitId) && r.IsDeleted == false)
                .Select(r => new GetRoomsNotExhDTO
            {
                RoomID = r.ID,
                Room_Name = r.RoomName
            })
        .ToListAsync();

            return Ok(Rooms);
        }

        [HttpPost("add-exhibitroom")]
        public async Task<ActionResult> AddExhibitRoom([FromBody] AddExhibitRoomDTO request)
        {
            var exhibit = await _context.Exhibits.FirstOrDefaultAsync(e => e.ID == request.ExhibitID && e.IsDeleted == false);
            if (exhibit == null)
            {
                return BadRequest("No such exhibit in the db");
            }
            var room = await _context.Rooms.FirstOrDefaultAsync(r => r.ID == request.RoomID && r.IsDeleted == false);
            if (room == null)
            {
                return BadRequest("No such room in the db");
            }

            int maxID = 700001; 
            if(_context.ExhibitRooms.Count() > 0)
            {
                maxID = await _context.ExhibitRooms.MaxAsync(er => er.ID);
            }
            
            var newExhibitRoom = new ExhibitRoom
            {
                ID = maxID + 1,
                DT = System.DateTime.Now,
                ExhibitID = request.ExhibitID, 
                RoomID = request.RoomID,
                IsDeleted = false, 
                DltDT = null
            };

            _context.ExhibitRooms.Add(newExhibitRoom);
            await _context.SaveChangesAsync();
            return Ok();

        }

        [HttpDelete("delete-exhibitroom/{ehxroomId}")]
        public async Task<IActionResult> DeleteExhibitRoom(int ehxroomId)
        {
            var exhibitroom = await _context.ExhibitRooms.FirstOrDefaultAsync(er => er.ID == ehxroomId);

            if (exhibitroom == null)
            {
                return NotFound("Room doesn't belong to the exhibit");
            }

            exhibitroom.IsDeleted = true;
            exhibitroom.DltDT = DateTime.Now; 
            await _context.SaveChangesAsync();

            return Ok();
        }

    }
}
