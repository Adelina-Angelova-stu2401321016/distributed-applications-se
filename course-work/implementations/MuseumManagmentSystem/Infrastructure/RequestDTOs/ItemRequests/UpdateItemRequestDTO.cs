namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.ItemRequests
{
    public class UpdateItemRequestDTO
    {
        public int ID { get; set; }
        public string Item_Name { get; set; }
        public string? Description { get; set; }
        public int CollectionID { get; set; }
        public string? InternationalID { get; set; }
    }
}
