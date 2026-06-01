namespace MuseumManagmentSystem.Infrastructure.RequestDTOs.RoomRequests
{
    public class AddRoomRequestDTO
    {
        public string Room_Name { get; set; }
        public decimal? Temperature { get; set; }
        public decimal? Humidity { get; set; }
        public decimal? Light_Exp { get; set; }

    }
}
