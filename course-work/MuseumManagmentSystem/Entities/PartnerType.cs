namespace MuseumManagmentSystem.Entities
{
    public class PartnerType
    {
        public int ID { get; set; } 
        public DateTime DT { get; set; } 
        public string TypeName { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }

    }
}
