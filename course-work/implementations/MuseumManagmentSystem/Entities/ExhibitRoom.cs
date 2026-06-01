namespace MuseumManagmentSystem.Entities
{
    public class ExhibitRoom
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }
        public int ExhibitID { get; set; } 
        public Exhibit Exhibit { get; set; }
        public int RoomID { get; set; }
        public Room Room { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }


    }
}
