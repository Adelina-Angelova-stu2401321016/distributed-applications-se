using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.LoginRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.LoginResponses;
using MuseumManagmentSystem.Services;

namespace MuseumManagmentSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly JwtService _jwtService; 

        public AuthController(JwtService jwtService)
        {
            _jwtService = jwtService; 
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto request)
        {
            var result = await _jwtService.Authenticate(request); 
            if(result is null)
            {
                return Unauthorized(); 
            }
            
            return result; 
        }
    }
}
