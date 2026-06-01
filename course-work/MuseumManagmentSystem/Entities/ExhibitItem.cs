namespace MuseumManagmentSystem.Entities
{
    public class ExhibitItem
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }

        public int ExhibitID { get; set; }
        public Exhibit Exhibit { get; set; }

        public int ItemID { get; set; }
        public Item Item { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
