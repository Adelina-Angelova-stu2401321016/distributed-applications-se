namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.ExhibitRequests
{
    public class AddExhibitRequestDTO
    {
        public string Title { get; set; }
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public string Description { get; set; }
        public decimal Entry_Price { get; set; }
        public int CuratorID { get; set; }
    }
}
