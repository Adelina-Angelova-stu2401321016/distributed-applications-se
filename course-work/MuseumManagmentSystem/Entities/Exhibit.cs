namespace MuseumManagmentSystem.Entities
{
    public class Exhibit
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }
        public string Title { get; set; }
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public string Description { get; set; }
        public decimal Entry_Price { get; set; }
        public int CuratorID { get; set; }
        public User Curator { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }

    }
}
