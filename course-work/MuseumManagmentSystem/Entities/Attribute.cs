namespace MuseumManagmentSystem.Entities
{
    public class Attribute
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }
        public string AttrName { get; set; }
        public int AdminID { get; set; }
        public User Admin { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }

    }
}
