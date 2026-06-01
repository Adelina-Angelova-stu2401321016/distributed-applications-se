namespace MuseumManagmentSystem.Entities
{
    public class AttributeValue
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }

        public int AttrID { get; set; } 
        public Attribute Attr { get; set; } 

        public string ValueName { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }

    }
}
