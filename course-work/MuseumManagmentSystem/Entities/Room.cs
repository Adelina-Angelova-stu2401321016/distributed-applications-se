namespace MuseumManagmentSystem.Entities
{
    public class Room
    {
        public int ID { get; set; } 
        public DateTime DT { get; set; }
        public string RoomName { get; set; }
        public decimal? Temperature { get; set; }
        public decimal? Humidity { get; set; }
        public decimal? Light_Exp { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DltDT { get; set; }

    }
}
