using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MuseumManagmentSystem.Infrastructure.Data;
using MuseumManagmentSystem.Infrastructure.RequestDTOs.LoginRequests;
using MuseumManagmentSystem.Infrastructure.ResponseDTOs.LoginResponses;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MuseumManagmentSystem.Services
{
    public class JwtService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration; 

        public JwtService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration; 
        }

        public async Task <LoginResponseDto> Authenticate(LoginRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return null; 
            }
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username && u.Password == request.Password && u.IsDeleted == false);
            var issuer = _configuration["JwtConfig:Issuer"];
            var audience = _configuration["JwtConfig:Audience"];
            var key = _configuration["JwtConfig:Key"];
            var tokenValidityMins = _configuration.GetValue<int>("JwtConfig:TokenValidityMins");
            var tokenExpiryTimeStamp = DateTime.UtcNow.AddMinutes(tokenValidityMins);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                   new Claim("userid", user.ID.ToString()),
                   new Claim(ClaimTypes.Name, user.Username),
                   new Claim("roleid", user.UserRoleID.ToString())
                }),
                Expires = tokenExpiryTimeStamp,
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
                SecurityAlgorithms.HmacSha512Signature),
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var securityToken = tokenHandler.CreateToken(tokenDescriptor);
            var accessToken = tokenHandler.WriteToken(securityToken);

            return new LoginResponseDto
            {
                UserID = user.ID,
                Status = "Success",
                FName = user.FName,
                UserRoleId = user.UserRoleID,
                AccessToken = accessToken,
                ExpiresIn = (int)tokenExpiryTimeStamp.Subtract(DateTime.UtcNow).TotalSeconds
            }; 
        }

    }
}
