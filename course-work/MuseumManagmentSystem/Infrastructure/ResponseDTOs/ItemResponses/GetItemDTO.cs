using Microsoft.VisualBasic;

namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.ItemResponses
{
    public class GetItemDTO
    {
        public int ID { get; set; }
        public string Item_Name { get; set; }
        public string Description { get; set; }
        public Collection Collection { get; set; }
        public string? InternationalID { get; set; }
    }
}
