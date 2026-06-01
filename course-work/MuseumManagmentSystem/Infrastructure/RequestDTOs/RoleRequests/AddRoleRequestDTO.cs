using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.RoleRequests
{
    public class AddRoleRequestDTO
    {
        [Required]
        public string Name { get; set; }
    }
}
