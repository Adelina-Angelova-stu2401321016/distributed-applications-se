namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.ItemResponses
{
    public class GetItemsDTO
    {
        public int ID { get; set; }
        public string Item_Name { get; set; }
        public string Description { get; set; }
        public string CollectionName { get; set; }
        public string? InternationalID { get; set; }
    }
}
