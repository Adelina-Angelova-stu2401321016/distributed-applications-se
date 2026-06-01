using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.StudentRequests
{
    public class UpdateStudentDTO
    {
        [Required]
        public int ID { get; set; }
        [Required]
        public string FName { get; set; }
        [Required]
        public string LName { get; set; }
        [Required]
        public int PartnerID { get; set; }

    }
}
