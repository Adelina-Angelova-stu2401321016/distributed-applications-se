namespace MuseumManagmentSystem.Entities
{
    public class Partner
    {
        public int ID { get; set; }
        public DateTime DT { get; set; } 
        public string PartnerName { get; set; } 
        public string VAT { get; set; } 
        public int TypeID { get; set; } 
        public PartnerType Type { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
