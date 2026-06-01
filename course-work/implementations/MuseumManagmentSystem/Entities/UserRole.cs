namespace MuseumManagmentSystem.Entities
{
    public class UserRole
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }
        public DateTime DT { get; set; }

    }
}
