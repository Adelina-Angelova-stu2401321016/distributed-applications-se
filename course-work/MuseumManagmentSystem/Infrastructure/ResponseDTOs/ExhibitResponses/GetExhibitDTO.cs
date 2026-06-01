namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.ExhibitResponses
{
    public class GetExhibitDTO
    {
        public int ID { get; set; }
        public string Title { get; set; }
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public string Description { get; set; }
        public decimal Entry_Price { get; set; }
        public int CuratorID { get; set; }
    }
}
