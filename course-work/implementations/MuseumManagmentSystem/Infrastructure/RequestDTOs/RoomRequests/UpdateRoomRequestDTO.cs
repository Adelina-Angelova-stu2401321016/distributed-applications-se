namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.RoomRequests
{
    public class UpdateRoomRequestDTO
    {
        public int ID { get; set; }
        public string Room_Name { get; set; }
        public decimal? Temperature { get; set; }
        public decimal? Humidity { get; set; }
        public decimal? Light_Exp { get; set; }
    }
}
