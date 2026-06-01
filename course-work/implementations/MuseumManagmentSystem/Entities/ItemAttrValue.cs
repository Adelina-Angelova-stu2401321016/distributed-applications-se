namespace MuseumManagmentSystem.Entities
{
    public class ItemAttrValue
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }
        public int ItemID { get; set; } 
        public Item Item { get; set; }
        public int ValueID { get; set; } 
        public AttributeValue Value { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }

    }
}
