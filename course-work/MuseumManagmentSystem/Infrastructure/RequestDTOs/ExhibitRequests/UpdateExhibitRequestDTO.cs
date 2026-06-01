using System.ComponentModel.DataAnnotations;

namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.ExhibitRequests
{
    public class UpdateExhibitRequestDTO
    {
        [Required]
        public int ID { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public DateTime Start_Date { get; set; }
        [Required]
        public DateTime End_Date { get; set; }
        [Required]
        public string Description { get; set; }

        [Range(0, double.MaxValue)]
        public decimal Entry_Price { get; set; }
        [Required]
        public int CuratorID { get; set; }
    }
}
