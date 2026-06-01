namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.RoomResponses
{
    public class GetRoomDTO
    {
        public int ID { get; set; }
        public string Room_Name { get; set; }
        public string? Temperature { get; set; }
        public string? Humidity { get; set; }
        public string? Light_Exp { get; set; }
    }
}
