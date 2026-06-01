namespace MuseumManagmentSystem.Entities
{
    public class Collection
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }
        public string CollName {get;set;}
        public int AdminID { get; set; }
        public User Admin { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
