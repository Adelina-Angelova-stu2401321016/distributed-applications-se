namespace MuseumManagmentSystem.Entities
{
    public class Item
    {
        public int ID { get; set; }
        public DateTime DT { get; set; } 
        public string ItemName { get; set; }
        public string? Description { get; set; } 
        public int CollectionID { get; set; }
        public Collection Collection { get; set; } 
        public string? InternationalID { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
